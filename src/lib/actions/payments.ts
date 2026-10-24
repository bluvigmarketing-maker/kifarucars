"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { hashPortalToken } from "@/lib/client-portal/dal";
import { getLeaseBalance } from "@/lib/payments/balance";
import { isMpesaConfigured, MAX_STK_AMOUNT, normalizeKenyanPhone } from "@/lib/mpesa/daraja";
import { settleViaQueryIfStale, startStkPayment } from "@/lib/payments/stk";
import { PaymentSchema, type PaymentFormState } from "@/lib/validations";
import type { PaymentStatus } from "@/lib/types";

// Like submitExtensionRequest, there is no session here: the portal token is
// the credential. It's re-verified via get_portal_view on every call, and
// the lease id / balance always come from the database, never the form.

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

  const result = await startStkPayment(
    { leaseId: view.lease_id },
    { amount, phone, accountReference: "KifaruLease", description: "Lease payment" }
  );
  if (!result.ok) return { status: "error", message: result.message };
  return { status: "sent", paymentId: result.paymentId };
}

/**
 * Polled by the portal while the customer is on the PIN prompt — see
 * settleViaQueryIfStale for the lost-callback fallback.
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

  const status = await settleViaQueryIfStale({
    id: payment.id,
    status: payment.status as PaymentStatus,
    checkout_request_id: payment.checkout_request_id,
    created_at: payment.created_at,
  });
  if (status !== payment.status) revalidatePath(`/portal/${token}`);
  return status;
}
