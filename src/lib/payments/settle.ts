import "server-only";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { daysInclusive, formatDisplayDate } from "@/lib/booking-dates";
import { isEmailConfigured, sendEmail } from "@/lib/email/mailer";
import { buildInvoicePdf, formatInvoiceDate, type InvoiceData, type InvoiceLine } from "@/lib/invoices/pdf";
import { formatKes } from "@/lib/payments/balance";
import { BUSINESS } from "@/lib/placeholder-data";
import { DISCOUNT_MIN_DAYS, vehicleTitle } from "@/lib/vehicle-display";
import type { Booking, Client, ExtensionRequest, Lease, Payment, Vehicle } from "@/lib/types";

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

function invoiceFor(payment: PaymentRow): (InvoiceData & { email: string | null }) | null {
  const base = {
    invoiceNumber: invoiceNumber(payment),
    issuedAt: new Date(payment.paid_at ?? payment.created_at),
    mpesaReceipt: payment.mpesa_receipt,
  };

  if (payment.booking) {
    const b = payment.booking;
    const days = daysInclusive(b.start_date, b.end_date);
    const total = Number(b.estimated_total ?? payment.amount);
    const discount = Number(b.discount ?? 0);
    const lines: InvoiceLine[] = [
      {
        description: `${vehicleTitle(b.vehicle)} hire`,
        detail: `${formatDisplayDate(b.start_date)} to ${formatDisplayDate(b.end_date)} · ${days} day${days === 1 ? "" : "s"}`,
        amount: Number(b.subtotal ?? total + discount),
      },
    ];
    if (discount > 0) lines.push({ description: `Discount — ${DISCOUNT_MIN_DAYS}+ day booking`, amount: -discount });
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
  if (!isEmailConfigured || payment.invoice_sent_at) return;
  const invoice = invoiceFor(payment);
  if (!invoice?.email) return;

  const admin = createAdminClient();
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
    await sendEmail({
      to: invoice.email,
      subject: `Your ${BUSINESS.name} invoice ${invoice.invoiceNumber}`,
      text: [
        `Hi ${firstName},`,
        "",
        `Thank you — we've received your payment of ${amount}${receipt}.`,
        `Your invoice ${invoice.invoiceNumber} dated ${formatInvoiceDate(invoice.issuedAt)} is attached.`,
        "",
        `Questions? Call ${BUSINESS.phone} or reply to this email.`,
        "",
        BUSINESS.name,
      ].join("\n"),
      html: `<div style="font-family:Helvetica,Arial,sans-serif;color:#171514;font-size:14px;line-height:1.6">
  <p>Hi ${escapeHtml(firstName)},</p>
  <p>Thank you — we've received your payment of <strong>${amount}</strong>${escapeHtml(receipt)}.</p>
  <p>Your invoice <strong>${invoice.invoiceNumber}</strong> dated ${formatInvoiceDate(invoice.issuedAt)} is attached.</p>
  <p>Questions? Call ${escapeHtml(BUSINESS.phone)} or reply to this email.</p>
  <p style="color:#7d1c35;font-weight:bold">${escapeHtml(BUSINESS.name)}</p>
</div>`,
      attachments: [{ filename: `${invoice.invoiceNumber}.pdf`, content: pdf, contentType: "application/pdf" }],
    });
  } catch (error) {
    console.error("Invoice email failed", payment.id, error instanceof Error ? error.message : error);
    // Release the claim so a later callback retry or poll can try again.
    await admin.from("payments").update({ invoice_sent_at: null }).eq("id", payment.id);
  }
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
