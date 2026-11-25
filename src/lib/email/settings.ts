import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { createAdminClient, isServiceRoleConfigured } from "@/lib/supabase/admin";

// Email (SMTP) settings: saved by staff at /kifaruadmin/settings into the
// `email_settings` table (shared with Kifaru Liquor), falling back to the
// SMTP_* environment variables until something has been saved there.
// Keep this file identical in kifarucars and kifaru-liqour.

export type EmailConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  // Car hire: staff copy of every invoice.
  staffCopy: string | null;
  // Kifaru Liquor: new paid shop orders.
  liquorOrdersEmail: string | null;
  source: "dashboard" | "environment";
};

type SettingsRow = {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_pass_encrypted: string | null;
  email_from: string;
  staff_copy_email: string;
  liquor_orders_email: string;
};

// ── Password encryption ────────────────────────────────────────────────
// The key is derived from the service-role key both sites already have, so
// no extra secret needs setting up. If that key is ever rotated, re-enter
// the SMTP password on the settings page.

function key() {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
  return createHash("sha256").update(`kifaru-email-settings:${secret}`).digest();
}

export function encryptSecret(plain: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return `v1:${Buffer.concat([iv, cipher.getAuthTag(), data]).toString("base64")}`;
}

function decryptSecret(stored: string): string | null {
  try {
    if (!stored.startsWith("v1:")) return null;
    const raw = Buffer.from(stored.slice(3), "base64");
    const decipher = createDecipheriv("aes-256-gcm", key(), raw.subarray(0, 12));
    decipher.setAuthTag(raw.subarray(12, 28));
    return Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

// ── Loading ────────────────────────────────────────────────────────────

function envValue(name: string) {
  return process.env[name]?.trim().replace(/^["']|["']$/g, "").trim() || undefined;
}

function fromEnvironment(): EmailConfig | null {
  const host = envValue("SMTP_HOST");
  const user = envValue("SMTP_USER");
  const pass = envValue("SMTP_PASS");
  if (!host || !user || !pass) return null;
  return {
    host,
    port: Number(envValue("SMTP_PORT") ?? 465),
    user,
    pass,
    from: envValue("EMAIL_FROM") ?? user,
    staffCopy: envValue("INVOICE_BCC") ?? null,
    liquorOrdersEmail: null,
    source: "environment",
  };
}

export async function readSettingsRow(): Promise<SettingsRow | null> {
  if (!isServiceRoleConfigured) return null;
  const { data, error } = await createAdminClient().from("email_settings").select("*").eq("id", true).maybeSingle();
  if (error) return null; // e.g. migration 0016 not run yet
  return data as SettingsRow | null;
}

const CACHE_MS = 60_000;
let cached: { config: EmailConfig | null; at: number } | null = null;

/** The SMTP settings to send with right now, or null if email isn't set up. */
export async function getEmailConfig(): Promise<EmailConfig | null> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.config;

  const row = await readSettingsRow();
  const pass = row?.smtp_pass_encrypted ? decryptSecret(row.smtp_pass_encrypted) : null;
  const env = fromEnvironment();

  let config: EmailConfig | null = null;
  if (row && row.smtp_host && row.smtp_user && pass) {
    config = {
      host: row.smtp_host,
      port: row.smtp_port,
      user: row.smtp_user,
      pass,
      from: row.email_from || row.smtp_user,
      staffCopy: row.staff_copy_email || null,
      liquorOrdersEmail: row.liquor_orders_email || null,
      source: "dashboard",
    };
  } else if (env) {
    // Recipients saved on the dashboard still apply on top of env SMTP.
    config = {
      ...env,
      staffCopy: row?.staff_copy_email || env.staffCopy,
      liquorOrdersEmail: row?.liquor_orders_email || null,
    };
  }

  cached = { config, at: Date.now() };
  return config;
}

/** Call after saving, so this server uses the new settings straight away. */
export function clearEmailConfigCache() {
  cached = null;
}
