import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./env";

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isServiceRoleConfigured = Boolean(supabaseUrl && serviceRoleKey);

/**
 * Service-role Supabase client — bypasses RLS entirely. Only for server code
 * that has no user session but must write trusted rows: the M-Pesa payment
 * flow (src/lib/actions/payments.ts) and Safaricom's callback
 * (src/app/api/payments/callback/[secret]/route.ts). Never import from a
 * client component; `server-only` enforces that at build time.
 */
export function createAdminClient() {
  if (!isServiceRoleConfigured) {
    throw new Error("Set SUPABASE_SERVICE_ROLE_KEY to enable payments.");
  }
  return createSupabaseClient(supabaseUrl!, serviceRoleKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
