"use client";

import { useActionState, useState } from "react";
import { saveVehicle } from "@/lib/actions/vehicles";
import { Button } from "@/components/ui/Button";
import {
  CoverImageField,
  GalleryUploadField,
  HoverSoundUploadField,
  VideoUploadField,
} from "@/components/admin/VehicleMediaFields";
import type { VehicleFormState } from "@/lib/validations";
import { cn } from "@/lib/cn";
import type { PriceUnit, Vehicle } from "@/lib/types";

const initialState: VehicleFormState = { status: "idle" };

const inputClasses =
  "mt-1.5 w-full rounded-lg border border-charcoal-200 bg-white px-4 py-2.5 text-sm text-charcoal-900 focus:border-burgundy-500 focus:outline-none dark:border-charcoal-700 dark:bg-charcoal-900 dark:text-charcoal-50";
const labelClasses = "text-sm font-medium text-charcoal-700 dark:text-charcoal-300";

const PRICE_UNITS: { value: PriceUnit; label: string }[] = [
  { value: "day", label: "Per day" },
  { value: "month", label: "Per month" },
  { value: "custom", label: "Custom" },
];

function PriceField({ vehicle, error }: { vehicle?: Vehicle; error?: string }) {
  const [unit, setUnit] = useState<PriceUnit>(vehicle?.price_unit ?? "day");

  return (
    <div>
      <label className={labelClasses}>Price</label>
      <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-charcoal-400">
            KES
          </span>
          <input
            type="number"
            name="price"
            min={0}
            step="0.01"
            defaultValue={vehicle?.price ?? ""}
            className={cn(inputClasses, "mt-0 pl-12")}
            placeholder="e.g. 8500"
          />
        </div>
        <div
          role="radiogroup"
          aria-label="Price is charged"
          className="flex rounded-lg border border-charcoal-200 p-1 dark:border-charcoal-700"
        >
          {PRICE_UNITS.map((option) => (
            <label
              key={option.value}
              className={cn(
                "flex-1 cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 text-center text-sm transition-colors",
                unit === option.value
                  ? "bg-burgundy-600 text-white"
                  : "text-charcoal-600 hover:bg-charcoal-50 dark:text-charcoal-300 dark:hover:bg-charcoal-800"
              )}
            >
              <input
                type="radio"
                name="priceUnit"
                value={option.value}
                checked={unit === option.value}
                onChange={() => setUnit(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>
      {unit === "custom" ? (
        <input
          name="priceCustomLabel"
          defaultValue={vehicle?.price_custom_label ?? ""}
          className={inputClasses}
          placeholder='e.g. "per week", "per weekend", or "Price on request"'
        />
      ) : null}
      <p className="mt-1 text-xs text-charcoal-500 dark:text-charcoal-400">
        Optional. Shown on the public listing; per-day and per-month prices also give customers an
        estimated total when they pick dates.
      </p>
      {error ? <p className="mt-1 text-xs text-burgundy-600">{error}</p> : null}
    </div>
  );
}

export function VehicleForm({ vehicle }: { vehicle?: Vehicle }) {
  const [state, formAction, pending] = useActionState(saveVehicle, initialState);
  const errors = state.status === "error" ? state.errors : undefined;

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {vehicle ? <input type="hidden" name="id" value={vehicle.id} /> : null}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClasses}>Name</label>
          <input name="name" defaultValue={vehicle?.name} className={inputClasses} placeholder="e.g. Land Cruiser Prado" />
          {errors?.name ? <p className="mt-1 text-xs text-burgundy-600">{errors.name[0]}</p> : null}
        </div>
        <div>
          <label className={labelClasses}>Make</label>
          <input name="make" defaultValue={vehicle?.make} className={inputClasses} placeholder="e.g. Toyota" />
          {errors?.make ? <p className="mt-1 text-xs text-burgundy-600">{errors.make[0]}</p> : null}
        </div>
        <div>
          <label className={labelClasses}>Year</label>
          <input type="number" name="year" defaultValue={vehicle?.year ?? ""} className={inputClasses} placeholder="e.g. 2023" />
          {errors?.year ? <p className="mt-1 text-xs text-burgundy-600">{errors.year[0]}</p> : null}
        </div>
        <div>
          <label className={labelClasses}>Transmission</label>
          <select name="transmission" defaultValue={vehicle?.transmission ?? "Automatic"} className={inputClasses}>
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
          </select>
        </div>
        <div>
          <label className={labelClasses}>Seats</label>
          <input type="number" name="seats" min={1} defaultValue={vehicle?.seats ?? ""} className={inputClasses} placeholder="e.g. 7" />
          {errors?.seats ? <p className="mt-1 text-xs text-burgundy-600">{errors.seats[0]}</p> : null}
        </div>
        <div>
          <label className={labelClasses}>Fuel type</label>
          <input name="fuelType" defaultValue={vehicle?.fuel_type} className={inputClasses} placeholder="e.g. Petrol, Diesel, Hybrid" />
          {errors?.fuelType ? <p className="mt-1 text-xs text-burgundy-600">{errors.fuelType[0]}</p> : null}
        </div>
        <div>
          <label className={labelClasses}>Engine capacity</label>
          <input name="engineCapacity" defaultValue={vehicle?.engine_capacity} className={inputClasses} placeholder="e.g. 2,800cc" />
          {errors?.engineCapacity ? <p className="mt-1 text-xs text-burgundy-600">{errors.engineCapacity[0]}</p> : null}
        </div>
      </div>

      <PriceField vehicle={vehicle} error={errors?.price?.[0]} />

      <CoverImageField defaultValue={vehicle?.image_url} error={errors?.imageUrl?.[0]} />

      <label className="flex items-center gap-2 text-sm text-charcoal-700 dark:text-charcoal-300">
        <input type="checkbox" name="isAvailable" defaultChecked={vehicle?.is_available ?? true} />
        Visible on the public fleet listing
      </label>

      <div className="space-y-5 border-t border-charcoal-100 pt-5 dark:border-charcoal-800">
        <p className="text-sm font-semibold uppercase tracking-widest text-charcoal-400 dark:text-charcoal-500">
          Media
        </p>
        <GalleryUploadField defaultValue={vehicle?.gallery_urls} />
        <VideoUploadField defaultValue={vehicle?.video_url} />
        <HoverSoundUploadField defaultValue={vehicle?.hover_sound_url} />
      </div>

      <div className="border-t border-charcoal-100 pt-5 dark:border-charcoal-800">
        <p className="text-sm font-semibold uppercase tracking-widest text-charcoal-400 dark:text-charcoal-500">
          Staff-only details
        </p>
        <p className="mt-1 text-xs text-charcoal-500 dark:text-charcoal-400">
          Never shown on the public site — used for internal records and ownership verification.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClasses}>Mileage (km)</label>
            <input type="number" name="mileage" min={0} defaultValue={vehicle?.mileage ?? ""} className={inputClasses} />
          </div>
          <div>
            <label className={labelClasses}>Chassis number</label>
            <input name="chassisNumber" defaultValue={vehicle?.chassis_number ?? ""} className={inputClasses} />
          </div>
          <div>
            <label className={labelClasses}>Registration number</label>
            <input name="registrationNumber" defaultValue={vehicle?.registration_number ?? ""} className={inputClasses} placeholder="e.g. KDA 123X" />
          </div>
          <div>
            <label className={labelClasses}>Owner name</label>
            <input name="ownerName" defaultValue={vehicle?.owner_name ?? ""} className={inputClasses} />
          </div>
          <div>
            <label className={labelClasses}>Owner phone</label>
            <input name="ownerPhone" defaultValue={vehicle?.owner_phone ?? ""} className={inputClasses} />
          </div>
          <div>
            <label className={labelClasses}>Owner email</label>
            <input type="email" name="ownerEmail" defaultValue={vehicle?.owner_email ?? ""} className={inputClasses} />
          </div>
        </div>

        <div className="mt-5">
          <label className={labelClasses}>Additional features</label>
          <input
            name="additionalFeatures"
            defaultValue={vehicle?.additional_features?.join(", ") ?? ""}
            className={inputClasses}
            placeholder="Comma-separated, e.g. Sunroof, Reverse camera, Leather seats"
          />
        </div>
      </div>

      {state.status === "error" && state.message ? (
        <p className="text-sm text-burgundy-600">{state.message}</p>
      ) : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : vehicle ? "Save Changes" : "Add Vehicle"}
        </Button>
        <Button href="/kifaruadmin/fleet" variant="outline">
          Cancel
        </Button>
      </div>
    </form>
  );
}
