"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Copy } from "lucide-react";
import { registerClient } from "@/lib/actions/leases";
import { Button } from "@/components/ui/Button";
import type { RegisterClientFormState } from "@/lib/validations";
import type { Vehicle } from "@/lib/types";

const initialState: RegisterClientFormState = { status: "idle" };

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

function PortalLinkPanel({ portalUrl }: { portalUrl: string }) {
  const [copied, setCopied] = useState(false);
  const fullUrl =
    typeof window !== "undefined" ? `${window.location.origin}${portalUrl}` : portalUrl;

  return (
    <div className="flex items-start gap-3 rounded-2xl border-2 border-gold-500/60 bg-white p-6 shadow-[0_0_18px_-6px_rgba(201,162,39,0.45)] dark:border-gold-400/50 dark:bg-charcoal-900">
      <CheckCircle2 className="mt-0.5 flex-shrink-0 text-burgundy-600 dark:text-burgundy-400" size={22} />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-charcoal-950 dark:text-white">Client registered — link ready</p>
        <p className="mt-1 text-sm text-charcoal-600 dark:text-charcoal-300">
          Send this to the client via WhatsApp or email — it won&apos;t be shown again.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <input
            readOnly
            value={fullUrl}
            onFocus={(e) => e.currentTarget.select()}
            className={`${inputClasses} mt-0 flex-1 truncate`}
          />
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(fullUrl);
              setCopied(true);
            }}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-charcoal-200 px-3.5 py-2.5 text-xs font-medium text-charcoal-600 hover:border-burgundy-500 hover:text-burgundy-700 dark:border-charcoal-700 dark:text-charcoal-300"
          >
            <Copy size={13} /> {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="mt-4">
          <Button href="/kifaruadmin/leases" variant="outline" size="sm">
            Back to Lease Records
          </Button>
        </div>
      </div>
    </div>
  );
}

export function RegisterClientForm({ vehicles }: { vehicles: Vehicle[] }) {
  const [state, formAction, pending] = useActionState(registerClient, initialState);
  const errors = state.status === "error" ? state.errors : undefined;

  if (state.status === "success") {
    return <PortalLinkPanel portalUrl={state.portalUrl} />;
  }

  return (
    <form action={formAction} className="max-w-2xl space-y-8">
      <div>
        <h3 className="font-display text-lg text-charcoal-950 dark:text-white">Client Details</h3>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Full name" name="fullName" errors={errors}>
            <input name="fullName" required className={inputClasses} />
          </Field>
          <Field label="Phone" name="phone" errors={errors}>
            <input type="tel" name="phone" required className={inputClasses} />
          </Field>
          <Field label="Email (optional)" name="email" errors={errors}>
            <input type="email" name="email" className={inputClasses} />
          </Field>
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg text-charcoal-950 dark:text-white">Lease Details</h3>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Vehicle" name="vehicleId" errors={errors}>
            <select name="vehicleId" required defaultValue="" className={inputClasses}>
              <option value="" disabled>
                Select a vehicle
              </option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.make} {vehicle.name} ({vehicle.year})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Cost" name="cost" errors={errors}>
            <input type="number" name="cost" min={0} step="0.01" required className={inputClasses} />
          </Field>
          <Field label="Start date" name="startDate" errors={errors}>
            <input type="date" name="startDate" required className={inputClasses} />
          </Field>
          <Field label="End date" name="endDate" errors={errors}>
            <input type="date" name="endDate" required className={inputClasses} />
          </Field>
        </div>
        <div className="mt-5">
          <Field label="Admin notes (optional)" name="notes" errors={errors}>
            <textarea name="notes" rows={3} className={inputClasses} />
          </Field>
        </div>
      </div>

      {state.status === "error" && state.message ? (
        <p className="text-sm text-burgundy-600">{state.message}</p>
      ) : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Registering..." : "Register Client"}
        </Button>
        <Button href="/kifaruadmin/leases" variant="outline">
          Cancel
        </Button>
      </div>
    </form>
  );
}
