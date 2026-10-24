import "server-only";

// Safaricom Daraja (M-Pesa) client for Lipa Na M-Pesa Online (STK Push)
// into the Buy Goods till. Every value comes from env — see .env.example.
//
// Buy Goods specifics: BusinessShortCode is the till's *store / head office
// number* (issued by Safaricom with the Daraja go-live, NOT the till number
// itself), PartyB is the till number customers pay into, and the passkey
// belongs to that store number. Sandbox only supports the 174379 paybill, so
// sandbox mode switches to CustomerPayBillOnline with PartyB = shortcode.

// Dashboard-pasted env values often carry stray quotes or whitespace, which
// silently break Daraja auth — strip both.
function envValue(name: string) {
  return process.env[name]?.trim().replace(/^["']|["']$/g, "").trim() || undefined;
}

const env = envValue("MPESA_ENV")?.toLowerCase() === "production" ? "production" : "sandbox";
const BASE_URL = env === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";

const consumerKey = envValue("MPESA_CONSUMER_KEY");
const consumerSecret = envValue("MPESA_CONSUMER_SECRET");
const shortcode = envValue("MPESA_SHORTCODE");
const passkey = envValue("MPESA_PASSKEY");
const callbackBaseUrl = envValue("MPESA_CALLBACK_BASE_URL");
const callbackSecret = envValue("MPESA_CALLBACK_SECRET");

export const TILL_NUMBER = envValue("MPESA_TILL_NUMBER") || "8999944";
export const TILL_NAME = "Top Dollars Ltd";

// Safaricom's per-transaction ceiling for M-Pesa payments.
export const MAX_STK_AMOUNT = 250_000;

export const isMpesaConfigured = Boolean(
  consumerKey && consumerSecret && shortcode && passkey && callbackBaseUrl && callbackSecret
);

export function getCallbackSecret() {
  return callbackSecret;
}

/** 07XXXXXXXX, 01XXXXXXXX, +2547..., 2547... → 2547XXXXXXXX (or null). */
export function normalizeKenyanPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  let local: string;
  if (digits.startsWith("254")) local = digits.slice(3);
  else if (digits.startsWith("0")) local = digits.slice(1);
  else local = digits;
  return /^[17]\d{8}$/.test(local) ? `254${local}` : null;
}

// Daraja wants yyyyMMddHHmmss in Kenyan time (EAT, UTC+3, no DST).
function darajaTimestamp() {
  const eat = new Date(Date.now() + 3 * 60 * 60 * 1000);
  return eat.toISOString().replace(/[-:T]/g, "").slice(0, 14);
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 200);
    // Key prefix (never the full key) + env make a credentials mix-up obvious.
    throw new Error(
      `Daraja ${env} auth failed (${res.status}) key ${consumerKey?.slice(0, 4)}… ${detail}`.trim()
    );
  }
  const data = (await res.json()) as { access_token: string; expires_in: string };

  // Refresh a minute early so an in-flight request never uses a dead token.
  cachedToken = { value: data.access_token, expiresAt: Date.now() + (Number(data.expires_in) - 60) * 1000 };
  return cachedToken.value;
}

function stkPassword(timestamp: string) {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
}

export type StkPushResult =
  | { ok: true; merchantRequestId: string; checkoutRequestId: string }
  | { ok: false; message: string };

export async function stkPush({
  phone,
  amount,
  accountReference,
  description,
}: {
  phone: string;
  amount: number;
  accountReference: string;
  description: string;
}): Promise<StkPushResult> {
  const token = await getAccessToken();
  const timestamp = darajaTimestamp();

  const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: stkPassword(timestamp),
      Timestamp: timestamp,
      TransactionType: env === "production" ? "CustomerBuyGoodsOnline" : "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: env === "production" ? TILL_NUMBER : shortcode,
      PhoneNumber: phone,
      // Daraja rejects callback URLs containing words like "mpesa" or
      // "safaricom", hence the neutral /api/payments path.
      CallBackURL: `${callbackBaseUrl!.replace(/\/$/, "")}/api/payments/callback/${callbackSecret}`,
      AccountReference: accountReference.slice(0, 12),
      TransactionDesc: description.slice(0, 13),
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    ResponseCode?: string;
    MerchantRequestID?: string;
    CheckoutRequestID?: string;
    errorMessage?: string;
    CustomerMessage?: string;
  };

  if (res.ok && data.ResponseCode === "0" && data.CheckoutRequestID && data.MerchantRequestID) {
    return { ok: true, merchantRequestId: data.MerchantRequestID, checkoutRequestId: data.CheckoutRequestID };
  }
  return { ok: false, message: data.errorMessage || data.CustomerMessage || `STK Push failed (${res.status})` };
}

export type StkQueryResult =
  | { state: "pending" }
  | { state: "done"; resultCode: number; resultDesc: string };

/**
 * Asks Daraja for the outcome of an STK Push — the fallback for when the
 * callback is slow or never arrives. Note it does not return the M-Pesa
 * receipt number; only the callback carries that.
 */
export async function stkQuery(checkoutRequestId: string): Promise<StkQueryResult> {
  const token = await getAccessToken();
  const timestamp = darajaTimestamp();

  const res = await fetch(`${BASE_URL}/mpesa/stkpushquery/v1/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: stkPassword(timestamp),
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as { ResultCode?: string; ResultDesc?: string };

  // While the customer is still on the PIN prompt Daraja answers with an
  // error body ("The transaction is being processed") and no ResultCode.
  // 4999 ("still under processing") is likewise not a final result.
  if (data.ResultCode === undefined || data.ResultCode === "4999") return { state: "pending" };
  return { state: "done", resultCode: Number(data.ResultCode), resultDesc: data.ResultDesc ?? "" };
}

/** Maps a Daraja ResultCode to a payments.status value. */
export function statusForResultCode(code: number): "paid" | "cancelled" | "failed" {
  if (code === 0) return "paid";
  if (code === 1032) return "cancelled";
  return "failed";
}
