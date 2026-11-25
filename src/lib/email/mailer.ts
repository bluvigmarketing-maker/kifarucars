import "server-only";
import nodemailer from "nodemailer";
import { getEmailConfig, type EmailConfig } from "@/lib/email/settings";

// Outgoing email over SMTP (Zoho, Google Workspace, Microsoft 365, or any
// provider's SMTP relay). Settings come from the admin dashboard
// (/kifaruadmin/settings), falling back to the SMTP_* environment variables.
// Nothing is sent until one of them is complete.

let transporter: { signature: string; transport: nodemailer.Transporter } | null = null;

function transportFor(config: EmailConfig) {
  const signature = [config.host, config.port, config.user, config.pass].join("|");
  if (transporter?.signature !== signature) {
    transporter = {
      signature,
      transport: nodemailer.createTransport({
        host: config.host,
        port: config.port,
        // 465 is implicit TLS; 587 upgrades with STARTTLS.
        secure: config.port === 465,
        auth: { user: config.user, pass: config.pass },
      }),
    };
  }
  return transporter.transport;
}

export async function isEmailReady() {
  return (await getEmailConfig()) !== null;
}

export async function sendEmail(
  message: {
    to: string;
    subject: string;
    text: string;
    html: string;
    attachments?: { filename: string; content: Buffer; contentType: string }[];
  },
  options: { copyStaff?: boolean; config?: EmailConfig } = {}
) {
  const config = options.config ?? (await getEmailConfig());
  if (!config) throw new Error("Email isn't set up — add the SMTP settings in the admin dashboard.");
  await transportFor(config).sendMail({
    from: config.from,
    bcc: options.copyStaff && config.staffCopy ? config.staffCopy : undefined,
    ...message,
  });
}
