"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { submitCorporateQuote } from "@/lib/actions/enquiry";
import type { CorporateQuoteFormState } from "@/lib/validations";

const initialState: CorporateQuoteFormState = { status: "idle" };

const inputClasses =
  "mt-1.5 w-full rounded-lg border border-charcoal-200 bg-white px-4 py-2.5 text-sm text-charcoal-900 focus:border-burgundy-500 focus:outline-none dark:border-charcoal-700 dark:bg-charcoal-900 dark:text-charcoal-50";
const labelClasses = "text-sm font-medium text-charcoal-700 dark:text-charcoal-300";

function Field({
  label,
  name,
  errors,
  children,
}: {
  label: string;
  name: string;
  errors?: Partial<Record<string, string[]>>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelClasses}>{label}</label>
      {children}
      {errors?.[name] ? <p className="mt-1 text-xs text-burgundy-600">{errors[name]![0]}</p> : null}
    </div>
  );
}

export function CorporateQuoteForm() {
  const [state, formAction, pending] = useActionState(submitCorporateQuote, initialState);
  const errors = state.status === "error" ? state.errors : undefined;

  if (state.status === "success") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border-2 border-gold-500/60 bg-white p-6 shadow-[0_0_18px_-6px_rgba(201,162,39,0.45)] dark:border-gold-400/50 dark:bg-charcoal-900">
        <CheckCircle2 className="mt-0.5 flex-shrink-0 text-burgundy-600 dark:text-burgundy-400" size={22} />
        <div>
          <p className="font-medium text-charcoal-950 dark:text-white">Thanks — your quote request has been sent.</p>
          <p className="mt-1 text-sm text-charcoal-600 dark:text-charcoal-300">
            Our corporate team will prepare a leasing proposal and get back to you shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-2xl border-2 border-gold-500/60 bg-white p-6 shadow-[0_0_18px_-6px_rgba(201,162,39,0.45)] sm:p-8 dark:border-gold-400/50 dark:bg-charcoal-900"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Full name" name="fullName" errors={errors}>
          <input name="fullName" required autoComplete="name" className={inputClasses} />
        </Field>
        <Field label="Company" name="company" errors={errors}>
          <input name="company" required autoComplete="organization" className={inputClasses} />
        </Field>
        <Field label="Work email" name="email" errors={errors}>
          <input type="email" name="email" required autoComplete="email" className={inputClasses} />
        </Field>
        <Field label="Phone" name="phone" errors={errors}>
          <input type="tel" name="phone" required autoComplete="tel" className={inputClasses} />
        </Field>
        <Field label="Vehicles needed" name="vehicleCount" errors={errors}>
          <select name="vehicleCount" defaultValue="" className={inputClasses}>
            <option value="">Select</option>
            <option>1</option>
            <option>2–5</option>
            <option>6–10</option>
            <option>10+</option>
          </select>
        </Field>
        <Field label="Lease term" name="leaseTerm" errors={errors}>
          <select name="leaseTerm" defaultValue="" className={inputClasses}>
            <option value="">Select</option>
            <option>3 months</option>
            <option>6 months</option>
            <option>12 months</option>
            <option>24+ months</option>
          </select>
        </Field>
      </div>
      <Field label="Anything else? (optional)" name="message" errors={errors}>
        <textarea
          name="message"
          rows={3}
          className={inputClasses}
          placeholder="Chauffeur needs, locations, start date, etc."
        />
      </Field>

      {state.status === "error" && state.message ? (
        <p className="text-sm text-burgundy-600">{state.message}</p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Sending..." : "Request A Quote"}
      </Button>
    </form>
  );
}
