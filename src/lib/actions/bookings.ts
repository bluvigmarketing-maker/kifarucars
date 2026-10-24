"use server";

import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/admin/dal";
import { getUnavailableRanges, getVehicleForDetail } from "@/lib/data";
import { daysInclusive, overlapsUnavailable, toIsoDate } from "@/lib/booking-dates";
import { isMpesaConfigured, MAX_STK_AMOUNT, normalizeKenyanPhone } from "@/lib/mpesa/daraja";
import { settleViaQueryIfStale, startStkPayment } from "@/lib/payments/stk";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createAdminClient, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { BookingSchema, type BookingFormState } from "@/lib/validations";
import { quoteBooking } from "@/lib/vehicle-display";
import type { BookingStatus, PaymentStatus } from "@/lib/types";

// No session on the public side: the booking id returned after submit is
// the customer's handle for polling/retrying payment. Amounts always come
// from the database + quoteBooking, never from the form.

export async function submitBooking(
  _prevState: BookingFormState,
  formData: FormData
): Promise<BookingFormState> {
  const validated = BookingSchema.safeParse({
    vehicleId: formData.get("vehicleId"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    notes: formData.get("notes"),
  });

  if (!validated.success) {
    return { status: "error", errors: validated.error.flatten().fieldErrors };
  }

  if (!isSupabaseConfigured) {
    return {
      status: "error",
      message: "Bookings aren't connected yet — set up Supabase to start receiving requests (see README).",
    };
  }

  const { vehicleId, startDate, endDate, fullName, email, notes } = validated.data;

  if (startDate < toIsoDate(new Date())) {
    return { status: "error", errors: { startDate: ["Pick a date from today onwards."] } };
  }

  const [vehicle, unavailable] = await Promise.all([
    getVehicleForDetail(vehicleId),
    getUnavailableRanges(vehicleId),
  ]);
  if (!vehicle) {
    return { status: "error", message: "This vehicle is no longer available to book." };
  }
  if (overlapsUnavailable(startDate, endDate, unavailable)) {
    return {
      status: "error",
      message: "Some of those dates have just been booked. Please pick different dates.",
    };
  }

  const quote = quoteBooking(vehicle, daysInclusive(startDate, endDate));
  const canPayOnline =
    quote !== null && quote.total >= 1 && quote.total <= MAX_STK_AMOUNT && isMpesaConfigured && isServiceRoleConfigured;

  const phone = canPayOnline ? normalizeKenyanPhone(validated.data.phone) : validated.data.phone;
  if (!phone) {
    return { status: "error", errors: { phone: ["Enter a valid Safaricom number, e.g. 0712 345 678."] } };
  }

  const record = {
    vehicle_id: vehicleId,
    full_name: fullName,
    phone,
    email,
    start_date: startDate,
    end_date: endDate,
    subtotal: quote?.subtotal ?? null,
    discount: quote?.discount ?? 0,
    estimated_total: quote?.total ?? null,
    notes: notes || null,
  };

  if (!canPayOnline) {
    // Custom pricing (or M-Pesa not set up): a request staff follow up on.
    const supabase = await createClient();
    const { error } = await supabase.from("bookings").insert(record);
    if (error) {
      return { status: "error", message: "Something went wrong sending your request. Please try again." };
    }
    revalidatePath("/kifaruadmin/bookings");
    return { status: "requested" };
  }

  const admin = createAdminClient();
  const { data: booking, error } = await admin.from("bookings").insert(record).select("id").single();
  if (error || !booking) {
    return { status: "error", message: "Something went wrong creating your booking. Please try again." };
  }
  revalidatePath("/kifaruadmin/bookings");

  const result = await startStkPayment(
    { bookingId: booking.id },
    { amount: quote.total, phone, accountReference: "KifaruBooking", description: "Car hire booking" }
  );
  if (!result.ok) {
    return { status: "error", message: result.message, bookingId: booking.id };
  }
  return { status: "sent", bookingId: booking.id, paymentId: result.paymentId, amount: quote.total };
}

// Re-sends the M-Pesa prompt for an unpaid booking (cancelled on the phone,
// wrong PIN, timed out) without creating a second booking.
export async function retryBookingPayment(bookingId: string): Promise<BookingFormState> {
  if (!isMpesaConfigured || !isServiceRoleConfigured || !bookingId) {
    return { status: "error", message: "Online payment isn't available right now." };
  }

  const admin = createAdminClient();
  const { data: booking } = await admin
    .from("bookings")
    .select("id, phone, status, estimated_total, payments(status)")
    .eq("id", bookingId)
    .maybeSingle();
  if (!booking || booking.status !== "pending" || booking.estimated_total == null) {
    return { status: "error", message: "This booking can't be paid online any more — please contact us." };
  }
  if (booking.payments.some((p) => p.status === "paid")) {
    return { status: "error", message: "This booking is already paid." };
  }

  const amount = Number(booking.estimated_total);
  const result = await startStkPayment(
    { bookingId },
    { amount, phone: booking.phone, accountReference: "KifaruBooking", description: "Car hire booking" }
  );
  if (!result.ok) return { status: "error", message: result.message, bookingId };
  return { status: "sent", bookingId, paymentId: result.paymentId, amount };
}

export async function getBookingPaymentStatus(bookingId: string, paymentId: string): Promise<PaymentStatus | null> {
  if (!isServiceRoleConfigured || !bookingId || !paymentId) return null;

  const admin = createAdminClient();
  const { data: payment } = await admin
    .from("payments")
    .select("id, status, checkout_request_id, created_at")
    .eq("id", paymentId)
    .eq("booking_id", bookingId)
    .maybeSingle();
  if (!payment) return null;

  return settleViaQueryIfStale({
    id: payment.id,
    status: payment.status as PaymentStatus,
    checkout_request_id: payment.checkout_request_id,
    created_at: payment.created_at,
  });
}

export async function updateBookingStatus(id: string, vehicleId: string, status: BookingStatus) {
  await verifyAdmin();
  const supabase = await createClient();
  await supabase.from("bookings").update({ status }).eq("id", id);
  revalidatePath("/kifaruadmin/bookings");
  // Confirming/unconfirming changes which dates are blocked on the calendar.
  revalidatePath(`/fleet/${vehicleId}`);
}

export async function deleteBooking(id: string, vehicleId: string) {
  await verifyAdmin();
  const supabase = await createClient();
  await supabase.from("bookings").delete().eq("id", id);
  revalidatePath("/kifaruadmin/bookings");
  revalidatePath(`/fleet/${vehicleId}`);
}
