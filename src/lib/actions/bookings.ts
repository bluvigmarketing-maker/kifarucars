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
import { BookingExtrasField, BookingSchema, type BookingFormState } from "@/lib/validations";
import { formatKes } from "@/lib/payments/balance";
import { parseLiquorPicks, pendingDrinksTotal, priceLiquorPicks } from "@/lib/liquor";
import { quoteBooking } from "@/lib/vehicle-display";
import type { BookingStatus, PaymentStatus } from "@/lib/types";

// To book, the customer has to pay: submitting creates a pending booking
// and sends the M-Pesa prompt, and the booking is confirmed only once paid
// (see onPaymentPaid). There's no unpaid "request" path.
//
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
  // Extras (drinks etc.) are paid at pickup, so they never change the
  // M-Pesa amount below — they're just recorded on the booking.
  const extraPicks = BookingExtrasField.parse(formData.get("extras") ?? undefined);
  // Kifaru Liquor drinks, by contrast, ARE paid now: same M-Pesa prompt as the car.
  const drinkPicks = parseLiquorPicks(formData.get("drinks"));

  if (!isSupabaseConfigured) {
    return {
      status: "error",
      message: "Online booking isn't available right now. Please call us to book.",
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

  // A booking only exists once it's paid for, so anything that can't be
  // paid by M-Pesa right now can't be booked online at all.
  if (!isMpesaConfigured || !isServiceRoleConfigured) {
    return { status: "error", message: "Online booking isn't available right now. Please call us to book." };
  }
  const quote = quoteBooking(vehicle, daysInclusive(startDate, endDate));
  if (!quote) {
    return { status: "error", message: "This car can't be booked online. Please call us to book it." };
  }
  const drinks = await priceLiquorPicks(drinkPicks);
  if (drinkPicks.length > 0 && drinks.lines.length < drinkPicks.length) {
    return {
      status: "error",
      message: "Some of the drinks you picked are no longer available. Please check your drinks and try again.",
    };
  }
  const amount = quote.total + drinks.total;
  if (amount > MAX_STK_AMOUNT) {
    return {
      status: "error",
      message: `M-Pesa allows up to ${formatKes(MAX_STK_AMOUNT)} per payment — please call us to book these dates.`,
    };
  }

  const phone = normalizeKenyanPhone(validated.data.phone);
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
    subtotal: quote.subtotal,
    discount: quote.discount,
    estimated_total: quote.total,
    notes: notes || null,
    ...(drinks.lines.length > 0 ? { wants_liquor: true } : {}),
  };

  const admin = createAdminClient();

  // Names and prices come from the menu, never the form; anything no
  // longer offered is dropped.
  let extraRows: { extra_id: string; name: string; unit_price: number; quantity: number }[] = [];
  if (extraPicks.length > 0) {
    const { data: menu } = await admin
      .from("extras")
      .select("id, name, price")
      .eq("is_active", true)
      .in("id", extraPicks.map((p) => p.id));
    const byId = new Map((menu ?? []).map((e) => [e.id, e]));
    extraRows = extraPicks.flatMap((pick) => {
      const item = byId.get(pick.id);
      return item ? [{ extra_id: item.id, name: item.name, unit_price: Number(item.price), quantity: pick.quantity }] : [];
    });
  }

  const { data: booking, error } = await admin.from("bookings").insert(record).select("id").single();
  if (error || !booking) {
    return { status: "error", message: "Something went wrong creating your booking. Please try again." };
  }

  if (extraRows.length > 0) {
    const { error: extrasError } = await admin
      .from("booking_extras")
      .insert(extraRows.map((row) => ({ ...row, booking_id: booking.id })));
    if (extrasError) {
      // Nothing's been charged yet — undo rather than leave a booking
      // whose extras the team doesn't know about.
      await admin.from("bookings").delete().eq("id", booking.id);
      return { status: "error", message: "Something went wrong saving your extras. Please try again." };
    }
  }

  if (drinks.lines.length > 0) {
    // The drinks become a Kifaru Liquor order linked to this booking. It's
    // paid by the booking's M-Pesa payment and marked paid in onPaymentPaid.
    const { data: order, error: orderError } = await admin
      .from("liquor_orders")
      .insert({
        source: "car_hire",
        booking_id: booking.id,
        full_name: fullName,
        phone,
        email,
        notes: "Drinks to be ready with the hire car.",
        subtotal: drinks.total,
      })
      .select("id")
      .single();
    const { error: itemsError } = order
      ? await admin.from("liquor_order_items").insert(drinks.lines.map((line) => ({ ...line, order_id: order.id })))
      : { error: orderError };
    if (orderError || itemsError) {
      // Nothing charged yet — undo so the drinks aren't silently dropped.
      await admin.from("bookings").delete().eq("id", booking.id);
      return { status: "error", message: "Something went wrong saving your drinks. Please try again." };
    }
  }
  revalidatePath("/kifaruadmin/bookings");

  const result = await startStkPayment(
    { bookingId: booking.id },
    {
      amount,
      phone,
      accountReference: "KifaruBooking",
      description: drinks.lines.length > 0 ? "Car and drinks" : "Car hire booking",
    }
  );
  if (!result.ok) {
    return { status: "error", message: result.message, bookingId: booking.id };
  }
  return { status: "sent", bookingId: booking.id, paymentId: result.paymentId, amount };
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

  // The car plus any Kifaru Liquor drinks picked with it.
  const drinksTotal = await pendingDrinksTotal(admin, bookingId);
  const amount = Number(booking.estimated_total) + drinksTotal;
  const result = await startStkPayment(
    { bookingId },
    {
      amount,
      phone: booking.phone,
      accountReference: "KifaruBooking",
      description: drinksTotal > 0 ? "Car and drinks" : "Car hire booking",
    }
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
