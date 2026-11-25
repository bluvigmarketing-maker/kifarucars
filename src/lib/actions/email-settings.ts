"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyAdmin } from "@/lib/admin/dal";
import { sendEmail } from "@/lib/email/mailer";
import { clearEmailConfigCache, encryptSecret, getEmailConfig, readSettingsRow } from "@/lib/email/settings";
import { createAdminClient, isServiceRoleConfigured } from "@/lib/supabase/admin";

const optionalEmail = z.union([z.literal(""), z.email("Enter a valid email address.")]);

const EmailSettingsSchema = z.object({
  smtpHost: z.string().trim().min(3, "Enter the SMTP server, e.g. smtp.zoho.com.").max(200),
  smtpPort: z.coerce.number().int().min(1).max(65535),
  smtpUser: z.string().trim().min(3, "Enter the SMTP username (usually the full email address).").max(200),
  smtpPass: z.string().max(500),
  emailFrom: z.string().trim().max(200),
  staffCopyEmail: optionalEmail,
  liquorOrdersEmail: optionalEmail,
});

export type EmailSettingsState =
  | { status: "idle" }
  | { status: "saved" }
  | { status: "error"; message?: string; errors?: Partial<Record<keyof z.infer<typeof EmailSettingsSchema>, string[]>> };

export async function saveEmailSettings(_prev: EmailSettingsState, formData: FormData): Promise<EmailSettingsState> {
  const admin = await verifyAdmin();
  if (!isServiceRoleConfigured) {
    return { status: "error", message: "The server's Supabase service key isn't set, so settings can't be saved." };
  }

  const validated = EmailSettingsSchema.safeParse({
    smtpHost: formData.get("smtpHost") ?? "",
    smtpPort: formData.get("smtpPort") ?? 465,
    smtpUser: formData.get("smtpUser") ?? "",
    smtpPass: formData.get("smtpPass") ?? "",
    emailFrom: formData.get("emailFrom") ?? "",
    staffCopyEmail: (formData.get("staffCopyEmail") ?? "").toString().trim(),
    liquorOrdersEmail: (formData.get("liquorOrdersEmail") ?? "").toString().trim(),
  });
  if (!validated.success) return { status: "error", errors: z.flattenError(validated.error).fieldErrors };
  const v = validated.data;

  // A blank password keeps the saved one.
  const existing = await readSettingsRow();
  if (!v.smtpPass && !existing?.smtp_pass_encrypted) {
    return { status: "error", errors: { smtpPass: ["Enter the SMTP password (or app password)."] } };
  }

  const { error } = await createAdminClient()
    .from("email_settings")
    .upsert({
      id: true,
      smtp_host: v.smtpHost,
      smtp_port: v.smtpPort,
      smtp_user: v.smtpUser,
      ...(v.smtpPass ? { smtp_pass_encrypted: encryptSecret(v.smtpPass) } : {}),
      email_from: v.emailFrom,
      staff_copy_email: v.staffCopyEmail,
      liquor_orders_email: v.liquorOrdersEmail,
      updated_at: new Date().toISOString(),
      updated_by: admin.email,
    });
  if (error) {
    return {
      status: "error",
      message: error.message.includes("email_settings")
        ? "The email settings table doesn't exist yet — run migration 0016 in Supabase."
        : "Couldn't save the settings. Please try again.",
    };
  }

  clearEmailConfigCache();
  revalidatePath("/kifaruadmin/settings");
  return { status: "saved" };
}

export type TestEmailState = { status: "idle" } | { status: "sent"; to: string } | { status: "error"; message: string };

export async function sendTestEmail(_prev: TestEmailState, formData: FormData): Promise<TestEmailState> {
  const admin = await verifyAdmin();
  const to = (formData.get("to") ?? "").toString().trim() || admin.email;
  if (!z.email().safeParse(to).success) return { status: "error", message: "Enter a valid email address to send to." };

  clearEmailConfigCache();
  const config = await getEmailConfig();
  if (!config) return { status: "error", message: "Save the SMTP settings first." };

  try {
    await sendEmail(
      {
        to,
        subject: "Kifaru test email",
        text: `This is a test email from the Kifaru admin dashboard.\n\nIf you received it, invoices and order notifications will send correctly (via ${config.host}).`,
        html: `<div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#171514"><p>This is a test email from the Kifaru admin dashboard.</p><p>If you received it, invoices and order notifications will send correctly (via ${config.host}).</p></div>`,
      },
      { config }
    );
    return { status: "sent", to };
  } catch (error) {
    // Show the SMTP server's own reason — it's what explains a wrong
    // password, port or blocked login.
    const reason = error instanceof Error ? error.message : String(error);
    return { status: "error", message: `Sending failed: ${reason.slice(0, 300)}` };
  }
}
