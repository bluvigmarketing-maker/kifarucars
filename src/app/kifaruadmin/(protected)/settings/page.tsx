import { EmailSettingsForm } from "@/components/admin/EmailSettingsForm";
import { verifyAdmin } from "@/lib/admin/dal";
import { getEmailConfig, readSettingsRow } from "@/lib/email/settings";

export default async function AdminSettingsPage() {
  const admin = await verifyAdmin();
  const [row, active] = await Promise.all([readSettingsRow(), getEmailConfig()]);

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal-950 dark:text-white">Email settings</h1>
      <p className="mt-1 max-w-2xl text-sm text-charcoal-500 dark:text-charcoal-400">
        The mail account used to send booking invoices (Kifaru Car Hire) and order confirmations (Kifaru Liquor).
        Both sites use these settings. Changes apply within a minute.
      </p>

      <p className="mt-4 text-sm">
        <span className="font-medium text-charcoal-700 dark:text-charcoal-300">Status: </span>
        {active?.source === "dashboard" ? (
          <span className="text-green-700 dark:text-green-400">Sending with the settings below.</span>
        ) : active?.source === "environment" ? (
          <span className="text-charcoal-600 dark:text-charcoal-300">
            Sending with the server&apos;s built-in settings — save the form to manage them here instead.
          </span>
        ) : (
          <span className="text-burgundy-600">Email is not set up — invoices and order emails aren&apos;t being sent.</span>
        )}
      </p>

      <div className="mt-6">
        <EmailSettingsForm
          initial={{
            smtpHost: row?.smtp_host ?? "",
            smtpPort: row?.smtp_port ?? 465,
            smtpUser: row?.smtp_user ?? "",
            emailFrom: row?.email_from ?? "",
            staffCopyEmail: row?.staff_copy_email ?? "",
            liquorOrdersEmail: row?.liquor_orders_email ?? "admin@kifaru.ke",
            hasPassword: Boolean(row?.smtp_pass_encrypted),
          }}
          adminEmail={admin.email}
        />
      </div>
    </div>
  );
}
