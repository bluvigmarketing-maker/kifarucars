"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { submitExtensionRequest } from "@/lib/actions/client-portal";
import { Button } from "@/components/ui/Button";
import type { ExtensionRequestFormState } from "@/lib/validations";

const initialState: ExtensionRequestFormState = { status: "idle" };

const inputClasses =
  "mt-1.5 w-full rounded-lg border border-charcoal-200 bg-white px-4 py-2.5 text-sm text-charcoal-900 focus:border-burgundy-500 focus:outline-none dark:border-charcoal-700 dark:bg-charcoal-900 dark:text-charcoal-50";
const labelClasses = "text-sm font-medium text-charcoal-700 dark:text-charcoal-300";

export function ExtensionRequestForm({
  token,
  currentEndDate,
  disabled,
  disabledReason,
}: {
  token: string;
  currentEndDate: string;
  disabled: boolean;
  disabledReason?: string;
}) {
  const [state, formAction, pending] = useActionState(submitExtensionRequest, initialState);

  const minDate = new Date(`${currentEndDate}T00:00:00`);
  minDate.setDate(minDate.getDate() + 1);
  const minDateValue = minDate.toISOString().slice(0, 10);

  if (state.status === "success") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border-2 border-gold-500/60 bg-white p-6 shadow-[0_0_18px_-6px_rgba(201,162,39,0.45)] dark:border-gold-400/50 dark:bg-charcoal-900">
        <CheckCircle2 className="mt-0.5 flex-shrink-0 text-burgundy-600 dark:text-burgundy-400" size={22} />
        <div>
          <p className="font-medium text-charcoal-950 dark:text-white">Request submitted</p>
          <p className="mt-1 text-sm text-charcoal-600 dark:text-charcoal-300">
            Our team will review your extension request and get back to you.
          </p>
        </div>
      </div>
    );
  }

  if (disabled) {
    return (
      <p className="rounded-2xl border border-charcoal-100 bg-white p-5 text-sm text-charcoal-500 dark:border-charcoal-800 dark:bg-charcoal-900 dark:text-charcoal-400">
        {disabledReason}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <label className={labelClasses}>New end date</label>
        <input
          type="date"
          name="requestedEndDate"
          min={minDateValue}
          required
          className={inputClasses}
        />
      </div>
      <div>
        <label className={labelClasses}>Reason (optional)</label>
        <textarea name="reason" rows={3} className={inputClasses} />
      </div>

      {state.status === "error" && state.message ? (
        <p className="text-sm text-burgundy-600">{state.message}</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Submitting..." : "Request Extension"}
      </Button>
    </form>
  );
}
