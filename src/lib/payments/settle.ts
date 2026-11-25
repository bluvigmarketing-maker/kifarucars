import "server-only";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { daysInclusive, formatDisplayDate } from "@/lib/booking-dates";
import { isEmailReady, sendEmail } from "@/lib/email/mailer";
import { buildInvoicePdf, formatInvoiceDate, type InvoiceData, type InvoiceLine } from "@/lib/invoices/pdf";
import { formatKes } from "@/lib/payments/balance";
import { BUSINESS } from "@/lib/placeholder-data";
import { DISCOUNT_MIN_DAYS, vehicleTitle } from "@/lib/vehicle-display";
import type { Booking, BookingExtra, Client, ExtensionRequest, Lease, Payment, Vehicle } from "@/lib/types";

type VehicleBits = Pick<Vehicle, "name" | "make">;

type PaymentRow = Payment & {
  booking: (Booking & { vehicle: VehicleBits; payments: Pick<Payment, "amount" | "status">[] }) | null;
  lease:
    | (Lease & {
        client: Client;
        vehicle: VehicleBits;
        extension_requests: Pick<ExtensionRequest, "amount" | "status">[];
        payments: Pick<Payment, "amount" | "status">[];
      })
    | null;
};

const VEHICLE_SELECT = "vehicle:vehicles(name, make)";
const PAYMENT_SELECT = `*,
  booking:bookings(*, ${VEHICLE_SELECT}, payments(amount, status)),
  lease:leases(*, client:clients(*), ${VEHICLE_SELECT}, extension_requests(amount, status), payments(amount, status))`;

const sumPaid = (payments: Pick<Payment, "amount" | "status">[]) =>
  payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + Number(p.amount), 0);

/**
 * Runs once a payment is known to be paid — from Safaricom's callback or
 * the STK Query fallback while the customer's page polls. Confirms a
 * booking (which blocks its dates on the calendar) and emails the PDF
 * invoice. Safe to call more than once.
 */
export async function onPaymentPaid(paymentId: string) {
  const admin = createAdminClient();
  const { data } = await admin.from("payments").select(PAYMENT_SELECT).eq("id", paymentId).maybeSingle();
  const payment = data as PaymentRow | null;
  if (!payment || payment.status !== "paid") return;

  if (payment.booking) {
    await admin.from("bookings").update({ status: "confirmed" }).eq("id", payment.booking.id).eq("status", "pending");
    // Kifaru Liquor drinks picked with the car were part of this payment.
    await admin
      .from("liquor_orders")
      .update({ status: "paid", paid_at: payment.paid_at ?? new Date().toISOString() })
      .eq("booking_id", payment.booking.id)
      .eq("status", "pending_payment");
    try {
      revalidatePath(`/fleet/${payment.booking.vehicle_id}`);
      revalidatePath("/kifaruadmin/bookings");
    } catch {
      // Outside a request scope (e.g. after()) — the pages refresh on their next render.
    }
  }

  await sendPaymentInvoice(payment);
}

export function invoiceNumber(payment: Pick<Payment, "id" | "paid_at" | "created_at">) {
  const date = new Date(payment.paid_at ?? payment.created_at);
  const ymd = date.toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" }).replace(/-/g, "");
  return `KIF-${ymd}-${payment.id.slice(0, 6).toUpperCase()}`;
}

type DrinkLine = { name: string; unit_price: number; quantity: number };

function invoiceFor(payment: PaymentRow, drinks: DrinkLine[] = []): (InvoiceData & { email: string | null }) | null {
  const base = {
    invoiceNumber: invoiceNumber(payment),
    issuedAt: new Date(payment.paid_at ?? payment.created_at),
    mpesaReceipt: payment.mpesa_receipt,
  };

  if (payment.booking) {
    const b = payment.booking;
    const days = daysInclusive(b.start_date, b.end_date);
    const carTotal = Number(b.estimated_total ?? payment.amount);
    const discount = Number(b.discount ?? 0);
    const lines: InvoiceLine[] = [
      {
        description: `${vehicleTitle(b.vehicle)} hire`,
        detail: `${formatDisplayDate(b.start_date)} to ${formatDisplayDate(b.end_date)} · ${days} day${days === 1 ? "" : "s"}`,
        amount: Number(b.subtotal ?? carTotal + discount),
      },
    ];
    if (discount > 0) lines.push({ description: `Discount — ${DISCOUNT_MIN_DAYS}+ day booking`, amount: -discount });
    // Kifaru Liquor drinks paid in the same M-Pesa payment.
    for (const d of drinks) {
      lines.push({
        description: `Kifaru Liquor — ${d.name}`,
        detail: `${d.quantity} x ${formatKes(Number(d.unit_price))}`,
        amount: Number(d.unit_price) * d.quantity,
      });
    }
    const total = carTotal + drinks.reduce((sum, d) => sum + Number(d.unit_price) * d.quantity, 0);
    const paid = sumPaid(b.payments);
    return {
      ...base,
      email: b.email,
      billTo: { name: b.full_name, phone: b.phone, email: b.email },
      lines,
      total,
      paid,
      balance: total - paid,
    };
  }

  if (payment.lease) {
    const l = payment.lease;
    const extensions = l.extension_requests
      .filter((r) => r.status === "approved")
      .reduce((sum, r) => sum + Number(r.amount ?? 0), 0);
    const lines: InvoiceLine[] = [
      {
        description: `Lease — ${vehicleTitle(l.vehicle)}`,
        detail: `${formatDisplayDate(l.start_date)} to ${formatDisplayDate(l.end_date)}`,
        amount: Number(l.cost),
      },
    ];
    if (extensions > 0) lines.push({ description: "Approved lease extensions", amount: extensions });
    const total = Number(l.cost) + extensions;
    const paid = sumPaid(l.payments);
    return {
      ...base,
      email: l.client.email,
      billTo: { name: l.client.full_name, phone: l.client.phone, email: l.client.email },
      lines,
      total,
      paid,
      balance: total - paid,
    };
  }

  return null;
}

async function sendPaymentInvoice(payment: PaymentRow) {
  if (payment.invoice_sent_at || !(await isEmailReady())) return;
  const admin = createAdminClient();

  let drinks: DrinkLine[] = [];
  if (payment.booking) {
    // Errors ignored: a liquor-table problem must never stop the invoice.
    const { data } = await admin
      .from("liquor_orders")
      .select("items:liquor_order_items(name, unit_price, quantity)")
      .eq("booking_id", payment.booking.id)
      .neq("status", "cancelled");
    drinks = ((data ?? []) as { items: DrinkLine[] }[]).flatMap((o) => o.items);
  }

  const invoice = invoiceFor(payment, drinks);
  if (!invoice?.email) return;

  if (payment.booking) {
    // Separate query, errors ignored: an extras problem (or 0013 not run
    // yet) must never stop the invoice going out.
    const { data: extras } = await admin
      .from("booking_extras")
      .select("name, unit_price, quantity")
      .eq("booking_id", payment.booking.id);
    invoice.pickupExtras = ((extras ?? []) as Pick<BookingExtra, "name" | "unit_price" | "quantity">[]).map((e) => ({
      description: `${e.quantity} x ${e.name}`,
      amount: Number(e.unit_price) * e.quantity,
    }));
  }
  // Claim the send so the callback and a concurrent poll can't both email.
  const { data: claimed } = await admin
    .from("payments")
    .update({ invoice_sent_at: new Date().toISOString() })
    .eq("id", payment.id)
    .is("invoice_sent_at", null)
    .select("id")
    .maybeSingle();
  if (!claimed) return;

  try {
    const pdf = await buildInvoicePdf(invoice);
    const firstName = invoice.billTo.name.split(" ")[0];
    const amount = formatKes(Number(payment.amount));
    const receipt = payment.mpesa_receipt ? ` (M-Pesa receipt ${payment.mpesa_receipt})` : "";
    const extrasTotal = (invoice.pickupExtras ?? []).reduce((sum, e) => sum + e.amount, 0);
    const extrasLine =
      extrasTotal > 0
        ? `Your extras (${invoice.pickupExtras!.map((e) => e.description).join(", ")}) will be ready with the car. Please pay ${formatKes(extrasTotal)} for them at pickup.`
        : null;
    await sendEmail({
      to: invoice.email,
      subject: `Your ${BUSINESS.name} invoice ${invoice.invoiceNumber}`,
      text: [
        `Hi ${firstName},`,
        "",
        `Thank you — we've received your payment of ${amount}${receipt}.`,
        `Your invoice ${invoice.invoiceNumber} dated ${formatInvoiceDate(invoice.issuedAt)} is attached.`,
        ...(extrasLine ? ["", extrasLine] : []),
        "",
        `Questions? Call ${BUSINESS.phone} or reply to this email.`,
        "",
        BUSINESS.name,
      ].join("\n"),
      html: `<div style="font-family:Helvetica,Arial,sans-serif;color:#171514;font-size:14px;line-height:1.6">
  <p>Hi ${escapeHtml(firstName)},</p>
  <p>Thank you — we've received your payment of <strong>${amount}</strong>${escapeHtml(receipt)}.</p>
  <p>Your invoice <strong>${invoice.invoiceNumber}</strong> dated ${formatInvoiceDate(invoice.issuedAt)} is attached.</p>
  ${extrasLine ? `<p>${escapeHtml(extrasLine)}</p>` : ""}
  <p>Questions? Call ${escapeHtml(BUSINESS.phone)} or reply to this email.</p>
  <p style="color:#7d1c35;font-weight:bold">${escapeHtml(BUSINESS.name)}</p>
</div>`,
        attachments: [{ filename: `${invoice.invoiceNumber}.pdf`, content: pdf, contentType: "application/pdf" }],
      },
      // Staff inbox from the email settings gets a copy of every invoice.
      { copyStaff: true }
    );
  } catch (error) {
    console.error("Invoice email failed", payment.id, error instanceof Error ? error.message : error);
    // Release the claim so a later callback retry or poll can try again.
    await admin.from("payments").update({ invoice_sent_at: null }).eq("id", payment.id);
  }
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
