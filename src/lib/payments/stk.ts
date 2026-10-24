import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMpesaConfigured, statusForResultCode, stkPush, stkQuery } from "@/lib/mpesa/daraja";
import { onPaymentPaid } from "@/lib/payments/settle";
import type { PaymentStatus } from "@/lib/types";

// Shared by lease payments (client portal) and booking payments (calendar
// on /fleet/[id]). Callers authenticate the customer and work out the amount
// first; everything here runs with the service-role client.

const RETRY_COOLDOWN_MS = 60_000;
// Give the callback a head start before falling back to STK Query.
const QUERY_AFTER_MS = 20_000;

export type PaymentTarget = { leaseId: string } | { bookingId: string };

export async function startStkPayment(
  target: PaymentTarget,
  { amount, phone, accountReference, description }: {
    amount: number;
    phone: string;
    accountReference: string;
    description: string;
  }
): Promise<{ ok: true; paymentId: string } | { ok: false; message: string }> {
  const admin = createAdminClient();
  const column = "leaseId" in target ? "lease_id" : "booking_id";
  const targetId = "leaseId" in target ? target.leaseId : target.bookingId;

  // One prompt at a time per lease/booking, so a double-tap doesn't send two.
  const { data: recent } = await admin
    .from("payments")
    .select("id")
    .eq(column, targetId)
    .eq("status", "pending")
    .gte("created_at", new Date(Date.now() - RETRY_COOLDOWN_MS).toISOString())
    .limit(1);
  if (recent && recent.length > 0) {
    return { ok: false, message: "A payment prompt was just sent. Check your phone, or try again in a minute." };
  }

  // Insert first so the callback always finds a row to update.
  const { data: payment, error: insertError } = await admin
    .from("payments")
    .insert({ [column]: targetId, amount, phone, status: "pending" })
    .select("id")
    .single();
  if (insertError || !payment) return { ok: false, message: "We couldn't start the payment. Please try again." };

  let result;
  try {
    result = await stkPush({ phone, amount, accountReference, description });
  } catch (error) {
    // Keep the real cause on the row (visible on hover in /kifaruadmin/payments)
    // and in the server logs; the customer only sees the generic message.
    const message = error instanceof Error ? error.message : String(error);
    console.error("STK Push failed", message);
    result = { ok: false as const, message: `M-Pesa is unavailable: ${message}`.slice(0, 500) };
  }

  if (!result.ok) {
    await admin
      .from("payments")
      .update({ status: "failed", result_desc: result.message })
      .eq("id", payment.id);
    return { ok: false, message: "We couldn't reach M-Pesa. Please try again in a moment." };
  }

  await admin
    .from("payments")
    .update({ merchant_request_id: result.merchantRequestId, checkout_request_id: result.checkoutRequestId })
    .eq("id", payment.id);

  return { ok: true, paymentId: payment.id };
}

/**
 * For status polls. Normally the callback has already settled the row; if
 * it's still pending after QUERY_AFTER_MS, asks Daraja directly so a lost
 * callback doesn't leave the customer stuck. Returns the latest status.
 */
export async function settleViaQueryIfStale(payment: {
  id: string;
  status: PaymentStatus;
  checkout_request_id: string | null;
  created_at: string;
}): Promise<PaymentStatus> {
  if (
    payment.status !== "pending" ||
    !payment.checkout_request_id ||
    !isMpesaConfigured ||
    Date.now() - new Date(payment.created_at).getTime() <= QUERY_AFTER_MS
  ) {
    return payment.status;
  }

  const admin = createAdminClient();
  try {
    const query = await stkQuery(payment.checkout_request_id);
    if (query.state !== "done") return payment.status;

    const status = statusForResultCode(query.resultCode);
    const { data: updated } = await admin
      .from("payments")
      .update({
        status,
        result_code: query.resultCode,
        result_desc: query.resultDesc,
        paid_at: status === "paid" ? new Date().toISOString() : null,
      })
      .eq("id", payment.id)
      .eq("status", "pending")
      .select("status")
      .maybeSingle();
    if (updated) {
      if (updated.status === "paid") await onPaymentPaid(payment.id);
      return updated.status as PaymentStatus;
    }
    // The callback won the race — re-read.
    const { data: fresh } = await admin.from("payments").select("status").eq("id", payment.id).single();
    return (fresh?.status as PaymentStatus) ?? payment.status;
  } catch {
    // Daraja unreachable — keep reporting pending; the next poll retries.
    return payment.status;
  }
}
