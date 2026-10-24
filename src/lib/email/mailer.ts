import "server-only";
import nodemailer from "nodemailer";

// Outgoing email over SMTP (Zoho, Google Workspace, Microsoft 365, or any
// transactional provider's SMTP relay) — see the SMTP_* section of
// .env.example. Nothing is sent until every required value is set.

function envValue(name: string) {
  return process.env[name]?.trim().replace(/^["']|["']$/g, "").trim() || undefined;
}

const host = envValue("SMTP_HOST");
const port = Number(envValue("SMTP_PORT") ?? 465);
const user = envValue("SMTP_USER");
const pass = envValue("SMTP_PASS");
const from = envValue("EMAIL_FROM") ?? user;
// Optional: a staff inbox copied on every invoice.
const bcc = envValue("INVOICE_BCC");

export const isEmailConfigured = Boolean(host && user && pass && from);

let transporter: nodemailer.Transporter | null = null;

export async function sendEmail(message: {
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments?: { filename: string; content: Buffer; contentType: string }[];
}) {
  if (!isEmailConfigured) throw new Error("Email isn't configured — set the SMTP_* variables.");
  transporter ??= nodemailer.createTransport({
    host,
    port,
    // 465 is implicit TLS; 587 upgrades with STARTTLS.
    secure: port === 465,
    auth: { user, pass },
  });
  await transporter.sendMail({ from, bcc, ...message });
}
