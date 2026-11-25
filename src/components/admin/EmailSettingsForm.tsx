"use client";

import { useActionState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  saveEmailSettings,
  sendTestEmail,
  type EmailSettingsState,
  type TestEmailState,
} from "@/lib/actions/email-settings";

const inputClasses =
  "mt-1.5 w-full rounded-lg border border-charcoal-200 bg-white px-4 py-2.5 text-sm text-charcoal-900 focus:border-burgundy-500 focus:outline-none dark:border-charcoal-700 dark:bg-charcoal-900 dark:text-charcoal-50";
const labelClasses = "text-sm font-medium text-charcoal-700 dark:text-charcoal-300";
const hintClasses = "mt-1 text-xs text-charcoal-500 dark:text-charcoal-400";
const cardClasses = "rounded-2xl border border-charcoal-100 bg-white p-6 dark:border-charcoal-800 dark:bg-charcoal-900";

type Initial = {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  emailFrom: string;
  staffCopyEmail: string;
  liquorOrdersEmail: string;
  hasPassword: boolean;
};

function FieldError({ messages }: { messages?: string[] }) {
  return messages?.length ? <p className="mt-1 text-xs text-burgundy-600">{messages[0]}</p> : null;
}

export function EmailSettingsForm({ initial, adminEmail }: { initial: Initial; adminEmail: string }) {
  const [saveState, saveAction, saving] = useActionState(saveEmailSettings, { status: "idle" } as EmailSettingsState);
  const [testState, testAction, testing] = useActionState(sendTestEmail, { status: "idle" } as TestEmailState);
  const errors = saveState.status === "error" ? saveState.errors : undefined;

  return (
    <div className="grid max-w-3xl gap-6">
      <form action={saveAction} className={`${cardClasses} space-y-5`}>
        <h2 className="font-display text-lg text-charcoal-950 dark:text-white">Mail server (SMTP)</h2>

        <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
          <div>
            <label htmlFor="smtpHost" className={labelClasses}>
              SMTP server
            </label>
            <input id="smtpHost" name="smtpHost" defaultValue={initial.smtpHost} placeholder="smtp.zoho.com" className={inputClasses} />
            <FieldError messages={errors?.smtpHost} />
          </div>
          <div>
            <label htmlFor="smtpPort" className={labelClasses}>
              Port
            </label>
            <input
              id="smtpPort"
              name="smtpPort"
              type="number"
              min={1}
              max={65535}
              defaultValue={initial.smtpPort}
              className={inputClasses}
            />
            <FieldError messages={errors?.smtpPort} />
          </div>
        </div>
        <p className={`${hintClasses} -mt-3`}>
          Zoho: smtp.zoho.com, port 465 · Google Workspace: smtp.gmail.com, port 465 · Microsoft 365:
          smtp.office365.com, port 587
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="smtpUser" className={labelClasses}>
              Username
            </label>
            <input
              id="smtpUser"
              name="smtpUser"
              defaultValue={initial.smtpUser}
              autoComplete="off"
              placeholder="bookings@kifaru.ke"
              className={inputClasses}
            />
            <FieldError messages={errors?.smtpUser} />
          </div>
          <div>
            <label htmlFor="smtpPass" className={labelClasses}>
              Password
            </label>
            <input
              id="smtpPass"
              name="smtpPass"
              type="password"
              autoComplete="new-password"
              placeholder={initial.hasPassword ? "Saved — leave blank to keep" : "App password"}
              className={inputClasses}
            />
            <FieldError messages={errors?.smtpPass} />
            <p className={hintClasses}>Use an app-specific password if the account has 2-step verification.</p>
          </div>
        </div>

        <div>
          <label htmlFor="emailFrom" className={labelClasses}>
            Send as
          </label>
          <input
            id="emailFrom"
            name="emailFrom"
            defaultValue={initial.emailFrom}
            placeholder="Kifaru <bookings@kifaru.ke>"
            className={inputClasses}
          />
          <p className={hintClasses}>The sender customers see. Leave blank to use the username.</p>
        </div>

        <h2 className="border-t border-charcoal-100 pt-5 font-display text-lg text-charcoal-950 dark:border-charcoal-800 dark:text-white">
          Who gets notified
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="staffCopyEmail" className={labelClasses}>
              Car hire — staff copy of invoices
            </label>
            <input
              id="staffCopyEmail"
              name="staffCopyEmail"
              type="email"
              defaultValue={initial.staffCopyEmail}
              placeholder="Optional"
              className={inputClasses}
            />
            <FieldError messages={errors?.staffCopyEmail} />
            <p className={hintClasses}>Also receives bookings that include Kifaru Liquor drinks.</p>
          </div>
          <div>
            <label htmlFor="liquorOrdersEmail" className={labelClasses}>
              Kifaru Liquor — new orders
            </label>
            <input
              id="liquorOrdersEmail"
              name="liquorOrdersEmail"
              type="email"
              defaultValue={initial.liquorOrdersEmail}
              className={inputClasses}
            />
            <FieldError messages={errors?.liquorOrdersEmail} />
          </div>
        </div>

        {saveState.status === "error" && saveState.message ? (
          <p className="text-sm text-burgundy-600">{saveState.message}</p>
        ) : null}
        {saveState.status === "saved" ? (
          <p className="flex items-center gap-1.5 text-sm text-green-700 dark:text-green-400">
            <CheckCircle2 size={16} /> Saved. Send a test email below to check it works.
          </p>
        ) : null}

        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save settings"}
        </Button>
      </form>

      <form action={testAction} className={`${cardClasses} space-y-4`}>
        <h2 className="font-display text-lg text-charcoal-950 dark:text-white">Send a test email</h2>
        <div>
          <label htmlFor="to" className={labelClasses}>
            Send to
          </label>
          <input id="to" name="to" type="email" defaultValue={adminEmail} className={inputClasses} />
        </div>
        {testState.status === "sent" ? (
          <p className="flex items-center gap-1.5 text-sm text-green-700 dark:text-green-400">
            <CheckCircle2 size={16} /> Test email sent to {testState.to}. Check the inbox (and spam folder).
          </p>
        ) : testState.status === "error" ? (
          <p className="text-sm text-burgundy-600">{testState.message}</p>
        ) : null}
        <Button type="submit" variant="outline" disabled={testing}>
          <Send size={16} />
          {testing ? "Sending..." : "Send test email"}
        </Button>
      </form>
    </div>
  );
}
