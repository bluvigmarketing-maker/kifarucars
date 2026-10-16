"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { hashPortalToken } from "@/lib/client-portal/dal";
import { getLeaseBalance } from "@/lib/payments/balance";
import {
  isMpesaConfigured,
  MAX_STK_AMOUNT,
  normalizeKenyanPhone,
  statusForResultCode,
  stkPush,
  stkQuery,
} from "@/lib/mpesa/daraja";
import { PaymentSchema, type PaymentFormState } from "@/lib/validations";
import type { PaymentStatus } from "@/lib/types";

// Like submitExtensionRequest, there is no session here: the portal token is
// the credential. It's re-verified via get_portal_view on every call, and
// the lease id / balance always come from the database, never the form.

const RETRY_COOLDOWN_MS = 60_000;
// Give the callback a head start before falling back to STK Query.
const QUERY_AFTER_MS = 20_000;

export async function startLeasePayment(
  _prevState: PaymentFormState,
  formData: FormData
): Promise<PaymentFormState> {
  if (!isMpesaConfigured || !isServiceRoleConfigured) {
    return { status: "error", message: "Online payment isn't available right now. Please pay via the till number." };
  }

  const validated = PaymentSchema.safeParse({
    token: formData.get("token"),
    phone: formData.get("phone"),
    amount: formData.get("amount"),
  });
  if (!validated.success) {
    return { status: "error", message: validated.error.issues[0]?.message ?? "Check the details and try again." };
  }
  const { token, amount } = validated.data;

  const phone = normalizeKenyanPhone(validated.data.phone);
  if (!phone) return { status: "error", message: "Enter a valid Safaricom number, e.g. 0712 345 678." };

  const supabase = await createClient();
  const { data: view } = await supabase
    .rpc("get_portal_view", { p_token_hash: hashPortalToken(token) })
    .maybeSingle<{ lease_id: string; cost: number; extension_charges: number; amount_paid: number }>();
  if (!view) return { status: "error", message: "This payment link is no longer valid." };

  const { balance } = getLeaseBalance(view.cost, view.extension_charges, view.amount_paid);
  if (balance <= 0) return { status: "error", message: "Your lease is fully paid — nothing is due." };
  if (amount > Math.ceil(balance)) {
    return { status: "error", message: `The amount can't be more than your balance of KES ${Math.ceil(balance).toLocaleString()}.` };
  }
  if (amount > MAX_STK_AMOUNT) {
    return { status: "error", message: `M-Pesa allows up to KES ${MAX_STK_AMOUNT.toLocaleString()} per payment — please pay in parts.` };
  }

  const admin = createAdminClient();

  // One prompt at a time per lease, so a double-tap doesn't send two.
  const { data: recent } = await admin
    .from("payments")
    .select("id")
    .eq("lease_id", view.lease_id)
    .eq("status", "pending")
    .gte("created_at", new Date(Date.now() - RETRY_COOLDOWN_MS).toISOString())
    .limit(1);
  if (recent && recent.length > 0) {
    return { status: "error", message: "A payment prompt was just sent. Check your phone, or try again in a minute." };
  }

  // Insert first so the callback always finds a row to update.
  const { data: payment, error: insertError } = await admin
    .from("payments")
    .insert({ lease_id: view.lease_id, amount, phone, status: "pending" })
    .select("id")
    .single();
  if (insertError || !payment) return { status: "error", message: "We couldn't start the payment. Please try again." };

  let result;
  try {
    result = await stkPush({
      phone,
      amount,
      accountReference: "KifaruLease",
      description: "Lease payment",
    });
  } catch (error) {
    // Keep the real cause on the row (visible on hover in /kifaruadmin/payments)
    // and in the server logs; the client only sees the generic message.
    const message = error instanceof Error ? error.message : String(error);
    console.error("STK Push failed", message);
    result = { ok: false as const, message: `M-Pesa is unavailable: ${message}`.slice(0, 500) };
  }

  if (!result.ok) {
    await admin
      .from("payments")
      .update({ status: "failed", result_desc: result.message })
      .eq("id", payment.id);
    return { status: "error", message: "We couldn't reach M-Pesa. Please try again in a moment." };
  }

  await admin
    .from("payments")
    .update({ merchant_request_id: result.merchantRequestId, checkout_request_id: result.checkoutRequestId })
    .eq("id", payment.id);

  return { status: "sent", paymentId: payment.id };
}

/**
 * Polled by the portal while the customer is on the PIN prompt. Normally the
 * callback has already settled the row; if it's still pending after
 * QUERY_AFTER_MS, asks Daraja directly so a lost callback doesn't leave the
 * client stuck.
 */
export async function getPaymentStatus(token: string, paymentId: string): Promise<PaymentStatus | null> {
  if (!isServiceRoleConfigured || !token || !paymentId) return null;

  const admin = createAdminClient();
  const { data: payment } = await admin
    .from("payments")
    .select("id, status, checkout_request_id, created_at, lease:leases!inner(portal_token_hash)")
    .eq("id", paymentId)
    .eq("lease.portal_token_hash", hashPortalToken(token))
    .maybeSingle();
  if (!payment) return null;

  if (
    payment.status === "pending" &&
    payment.checkout_request_id &&
    isMpesaConfigured &&
    Date.now() - new Date(payment.created_at).getTime() > QUERY_AFTER_MS
  ) {
    try {
      const query = await stkQuery(payment.checkout_request_id);
      if (query.state === "done") {
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
          revalidatePath(`/portal/${token}`);
          return updated.status as PaymentStatus;
        }
        // The callback won the race — fall through to re-read below.
        const { data: fresh } = await admin.from("payments").select("status").eq("id", payment.id).single();
        return (fresh?.status as PaymentStatus) ?? null;
      }
    } catch {
      // Daraja unreachable — keep reporting pending; the next poll retries.
    }
  }

  return payment.status as PaymentStatus;
}
