"use client";

import { useActionState } from "react";
import { saveVehicle } from "@/lib/actions/vehicles";
import { Button } from "@/components/ui/Button";
import type { VehicleFormState } from "@/lib/validations";
import type { Vehicle } from "@/lib/types";

const initialState: VehicleFormState = { status: "idle" };

const inputClasses =
  "mt-1.5 w-full rounded-lg border border-charcoal-200 bg-white px-4 py-2.5 text-sm text-charcoal-900 focus:border-burgundy-500 focus:outline-none dark:border-charcoal-700 dark:bg-charcoal-900 dark:text-charcoal-50";
const labelClasses = "text-sm font-medium text-charcoal-700 dark:text-charcoal-300";

export function VehicleForm({ vehicle }: { vehicle?: Vehicle }) {
  const [state, formAction, pending] = useActionState(saveVehicle, initialState);
  const errors = state.status === "error" ? state.errors : undefined;

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {vehicle ? <input type="hidden" name="id" value={vehicle.id} /> : null}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClasses}>Name</label>
          <input name="name" defaultValue={vehicle?.name} required className={inputClasses} placeholder="e.g. Land Cruiser Prado" />
          {errors?.name ? <p className="mt-1 text-xs text-burgundy-600">{errors.name[0]}</p> : null}
        </div>
        <div>
          <label className={labelClasses}>Make</label>
          <input name="make" defaultValue={vehicle?.make} required className={inputClasses} placeholder="e.g. Toyota" />
          {errors?.make ? <p className="mt-1 text-xs text-burgundy-600">{errors.make[0]}</p> : null}
        </div>
        <div>
          <label className={labelClasses}>Year</label>
          <input type="number" name="year" defaultValue={vehicle?.year} required className={inputClasses} />
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
          <input type="number" name="seats" defaultValue={vehicle?.seats ?? 5} required className={inputClasses} />
          {errors?.seats ? <p className="mt-1 text-xs text-burgundy-600">{errors.seats[0]}</p> : null}
        </div>
        <div>
          <label className={labelClasses}>Fuel type</label>
          <input name="fuelType" defaultValue={vehicle?.fuel_type} required className={inputClasses} placeholder="e.g. Petrol, Diesel, Hybrid" />
          {errors?.fuelType ? <p className="mt-1 text-xs text-burgundy-600">{errors.fuelType[0]}</p> : null}
        </div>
        <div>
          <label className={labelClasses}>Luggage capacity</label>
          <input name="luggageCapacity" defaultValue={vehicle?.luggage_capacity} required className={inputClasses} placeholder="e.g. 2 Big, 2 Small" />
          {errors?.luggageCapacity ? <p className="mt-1 text-xs text-burgundy-600">{errors.luggageCapacity[0]}</p> : null}
        </div>
      </div>

      <div>
        <label className={labelClasses}>Image URL</label>
        <input
          name="imageUrl"
          defaultValue={vehicle?.image_url}
          required
          className={inputClasses}
          placeholder="/vehicles/placeholder-suv.svg or a Supabase Storage URL"
        />
        {errors?.imageUrl ? <p className="mt-1 text-xs text-burgundy-600">{errors.imageUrl[0]}</p> : null}
      </div>

      <label className="flex items-center gap-2 text-sm text-charcoal-700 dark:text-charcoal-300">
        <input type="checkbox" name="isAvailable" defaultChecked={vehicle?.is_available ?? true} />
        Visible on the public fleet listing
      </label>

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
