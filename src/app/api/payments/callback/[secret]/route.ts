import { timingSafeEqual } from "crypto";
import { after, NextResponse } from "next/server";
import { createAdminClient, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { getCallbackSecret, statusForResultCode } from "@/lib/mpesa/daraja";
import { onPaymentPaid } from "@/lib/payments/settle";

// Safaricom's STK Push result callback. Daraja doesn't sign callbacks, so
// the unguessable [secret] path segment (MPESA_CALLBACK_SECRET) is what
// keeps anyone else from marking payments as paid. The update only ever
// touches a still-pending row matched by CheckoutRequestID, so replays are
// harmless.

type CallbackItem = { Name: string; Value?: string | number };
type StkCallbackBody = {
  Body?: {
    stkCallback?: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: { Item: CallbackItem[] };
    };
  };
};

function secretMatches(given: string) {
  const expected = getCallbackSecret();
  if (!expected) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Always acknowledge with 200 once authenticated — a non-200 makes Daraja
// retry, which can't fix a malformed or unknown callback.
const ACCEPTED = () => NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });

export async function POST(request: Request, { params }: RouteContext<"/api/payments/callback/[secret]">) {
  const { secret } = await params;
  if (!secretMatches(secret)) return new NextResponse(null, { status: 404 });
  if (!isServiceRoleConfigured) return new NextResponse(null, { status: 503 });

  const payload = (await request.json().catch(() => null)) as StkCallbackBody | null;
  const callback = payload?.Body?.stkCallback;
  if (!callback?.CheckoutRequestID) return ACCEPTED();

  const resultCode = Number(callback.ResultCode);
  const status = statusForResultCode(resultCode);
  const items = callback.CallbackMetadata?.Item ?? [];
  const item = (name: string) => items.find((i) => i.Name === name)?.Value;

  const update: Record<string, unknown> = {
    status,
    result_code: resultCode,
    result_desc: callback.ResultDesc,
  };
  if (status === "paid") {
    update.paid_at = new Date().toISOString();
    if (item("MpesaReceiptNumber")) update.mpesa_receipt = String(item("MpesaReceiptNumber"));
    // Record what M-Pesa actually collected.
    if (item("Amount") !== undefined) update.amount = Number(item("Amount"));
  }

  const admin = createAdminClient();
  let query = admin.from("payments").update(update).eq("checkout_request_id", callback.CheckoutRequestID);
  // Safaricom's success callback is authoritative: it may complete a row the
  // STK Query fallback already settled (paid without a receipt, or wrongly
  // failed/cancelled from an interim answer). A failure only ever settles a
  // pending row.
  query =
    status === "paid"
      ? query.is("mpesa_receipt", null)
      : query.eq("status", "pending");
  const { data: updated, error } = await query.select("id");
  if (error) console.error("M-Pesa callback update failed", callback.CheckoutRequestID, error.message);

  // Confirm the booking and email the invoice once Safaricom has its 200.
  if (status === "paid" && updated) {
    for (const row of updated) after(() => onPaymentPaid(row.id));
  }

  return ACCEPTED();
}
