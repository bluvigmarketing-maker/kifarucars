"use client";

import { useActionState, useId, useState } from "react";
import { CheckCircle2, Loader2, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { submitVehicleApplication } from "@/lib/actions/vehicle-application";
import { uploadLogbookFile } from "@/lib/supabase/storage";
import type { VehicleApplicationFormState } from "@/lib/validations";

const initialState: VehicleApplicationFormState = { status: "idle" };

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

function LogbookUpload({ errors }: { errors?: Partial<Record<string, string[]>> }) {
  const id = useId();
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [path, setPath] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  return (
    <div>
      <label htmlFor={id} className={labelClasses}>
        Logbook copy (photo or PDF)
      </label>
      <div className="mt-1.5 flex items-center gap-3">
        <label
          htmlFor={id}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-charcoal-300 px-4 py-2.5 text-sm text-charcoal-600 hover:border-burgundy-500 dark:border-charcoal-700 dark:text-charcoal-300"
        >
          <Paperclip size={15} />
          {fileName || "Choose file"}
        </label>
        <input
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="sr-only"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setFileName(file.name);
            setStatus("uploading");
            setError("");
            try {
              const result = await uploadLogbookFile(file);
              if ("error" in result) {
                setStatus("error");
                setError(result.error);
                setPath("");
              } else {
                setStatus("done");
                setPath(result.path);
              }
            } catch {
              setStatus("error");
              setError("Upload failed. Please try again.");
              setPath("");
            }
          }}
        />
        {status === "uploading" ? <Loader2 size={16} className="animate-spin text-charcoal-400" /> : null}
        {status === "done" ? <CheckCircle2 size={16} className="text-green-600" /> : null}
      </div>
      {status === "error" && error ? <p className="mt-1 text-xs text-burgundy-600">{error}</p> : null}
      {errors?.logbookPath ? (
        <p className="mt-1 text-xs text-burgundy-600">{errors.logbookPath[0]}</p>
      ) : null}
      <input type="hidden" name="logbookPath" value={path} />
    </div>
  );
}

export function VehicleApplicationForm() {
  const [state, formAction, pending] = useActionState(submitVehicleApplication, initialState);
  const errors = state.status === "error" ? state.errors : undefined;

  if (state.status === "success") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border-2 border-gold-500/60 bg-white p-6 shadow-[0_0_18px_-6px_rgba(201,162,39,0.45)] dark:border-gold-400/50 dark:bg-charcoal-900">
        <CheckCircle2 className="mt-0.5 flex-shrink-0 text-burgundy-600 dark:text-burgundy-400" size={22} />
        <div>
          <p className="font-medium text-charcoal-950 dark:text-white">
            Thanks — your application has been submitted.
          </p>
          <p className="mt-1 text-sm text-charcoal-600 dark:text-charcoal-300">
            Our team will review your vehicle details and get back to you.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      <div>
        <h3 className="font-display text-lg text-charcoal-950 dark:text-white">Vehicle Details</h3>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Vehicle name" name="name" errors={errors}>
            <input name="name" required className={inputClasses} placeholder="e.g. Land Cruiser Prado" />
          </Field>
          <Field label="Make" name="make" errors={errors}>
            <input name="make" required className={inputClasses} placeholder="e.g. Toyota" />
          </Field>
          <Field label="Year" name="year" errors={errors}>
            <input type="number" name="year" required className={inputClasses} />
          </Field>
          <Field label="Transmission" name="transmission" errors={errors}>
            <select name="transmission" defaultValue="Automatic" className={inputClasses}>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </Field>
          <Field label="Seats" name="seats" errors={errors}>
            <input type="number" name="seats" defaultValue={5} required className={inputClasses} />
          </Field>
          <Field label="Fuel type" name="fuelType" errors={errors}>
            <input name="fuelType" required className={inputClasses} placeholder="e.g. Petrol, Diesel" />
          </Field>
          <Field label="Luggage capacity" name="luggageCapacity" errors={errors}>
            <input name="luggageCapacity" required className={inputClasses} placeholder="e.g. 2 Big, 2 Small" />
          </Field>
          <Field label="Mileage (km)" name="mileage" errors={errors}>
            <input type="number" name="mileage" min={0} className={inputClasses} />
          </Field>
          <Field label="Chassis number" name="chassisNumber" errors={errors}>
            <input name="chassisNumber" className={inputClasses} />
          </Field>
          <Field label="Registration number" name="registrationNumber" errors={errors}>
            <input name="registrationNumber" className={inputClasses} placeholder="e.g. KDA 123X" />
          </Field>
        </div>
        <div className="mt-5">
          <Field label="Additional features" name="additionalFeatures" errors={errors}>
            <input
              name="additionalFeatures"
              className={inputClasses}
              placeholder="Comma-separated, e.g. Sunroof, Reverse camera, Leather seats"
            />
          </Field>
        </div>
        <div className="mt-5">
          <LogbookUpload errors={errors} />
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg text-charcoal-950 dark:text-white">Owner Details</h3>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Your name" name="ownerName" errors={errors}>
            <input name="ownerName" required className={inputClasses} />
          </Field>
          <Field label="Phone" name="ownerPhone" errors={errors}>
            <input type="tel" name="ownerPhone" required className={inputClasses} />
          </Field>
          <Field label="Email" name="ownerEmail" errors={errors}>
            <input type="email" name="ownerEmail" required className={`${inputClasses} sm:col-span-2`} />
          </Field>
        </div>
      </div>

      {state.status === "error" && state.message ? (
        <p className="text-sm text-burgundy-600">{state.message}</p>
      ) : null}

      <label className="flex items-start gap-2 text-xs text-charcoal-500 dark:text-charcoal-400">
        <input type="checkbox" required className="mt-0.5" />
        I confirm the details above are accurate and agree to Kifaru Car Hire
        reviewing my vehicle and documents as described in the{" "}
        <a href="/privacy" className="underline hover:text-burgundy-600">
          Privacy Policy
        </a>
        .
      </label>

      <Button type="submit" disabled={pending}>
        {pending ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  );
}
