"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { ImageOff, Pencil, Trash2, X } from "lucide-react";
import { deleteExtra, saveExtra, toggleExtraActive } from "@/lib/actions/extras";
import { Button } from "@/components/ui/Button";
import { CoverImageField } from "@/components/admin/VehicleMediaFields";
import { cn } from "@/lib/cn";
import { formatKes } from "@/lib/payments/balance";
import type { ExtraFormState } from "@/lib/validations";
import type { Extra } from "@/lib/types";

const initialState: ExtraFormState = { status: "idle" };

const inputClasses =
  "mt-1.5 w-full rounded-lg border border-charcoal-200 bg-white px-4 py-2.5 text-sm text-charcoal-900 focus:border-burgundy-500 focus:outline-none dark:border-charcoal-700 dark:bg-charcoal-900 dark:text-charcoal-50";
const labelClasses = "text-sm font-medium text-charcoal-700 dark:text-charcoal-300";
const cardClasses =
  "rounded-2xl border-2 border-gold-500/60 bg-white p-5 shadow-[0_0_18px_-6px_rgba(201,162,39,0.45)] dark:border-gold-400/50 dark:bg-charcoal-900 dark:shadow-[0_0_18px_-6px_rgba(212,185,106,0.35)]";

// Shared by "Add extra" and each row's edit mode.
function ExtraForm({ extra, onDone }: { extra?: Extra; onDone?: () => void }) {
  const [state, formAction, pending] = useActionState(saveExtra, initialState);
  const errors = state.status === "error" ? state.errors : undefined;

  useEffect(() => {
    if (state.status === "success") onDone?.();
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-4">
      {extra ? <input type="hidden" name="id" value={extra.id} /> : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_9rem_6rem]">
        <div>
          <label className={labelClasses}>Name</label>
          <input name="name" required defaultValue={extra?.name} className={inputClasses} placeholder="e.g. Bottled water 500ml" />
          {errors?.name ? <p className="mt-1 text-xs text-burgundy-600">{errors.name[0]}</p> : null}
        </div>
        <div>
          <label className={labelClasses}>Price (KES)</label>
          <input
            type="number"
            name="price"
            required
            min={0}
            step="1"
            defaultValue={extra?.price ?? ""}
            className={inputClasses}
            placeholder="e.g. 50"
          />
          {errors?.price ? <p className="mt-1 text-xs text-burgundy-600">{errors.price[0]}</p> : null}
        </div>
        <div>
          <label className={labelClasses}>Order</label>
          <input type="number" name="sortOrder" min={0} defaultValue={extra?.sort_order ?? ""} className={inputClasses} placeholder="Last" />
        </div>
      </div>
      <div>
        <label className={labelClasses}>Description</label>
        <input
          name="description"
          defaultValue={extra?.description}
          className={inputClasses}
          placeholder='Optional, e.g. "Chilled, per bottle"'
        />
      </div>
      <CoverImageField label="Photo" defaultValue={extra?.image_url ?? ""} error={errors?.imageUrl?.[0]} />
      <label className="flex items-center gap-2 text-sm text-charcoal-700 dark:text-charcoal-300">
        <input type="checkbox" name="isActive" defaultChecked={extra?.is_active ?? true} />
        Offered on the booking form
      </label>
      {state.status === "error" && state.message ? <p className="text-sm text-burgundy-600">{state.message}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving..." : extra ? "Save" : "Add Extra"}
        </Button>
        {extra ? (
          <Button type="button" size="sm" variant="outline" onClick={onDone}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function ExtraRow({ extra }: { extra: Extra }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return (
      <li className={cardClasses}>
        <ExtraForm extra={extra} onDone={() => setEditing(false)} />
      </li>
    );
  }

  return (
    <li className={cn(cardClasses, "flex items-center gap-4")}>
      {extra.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail, arbitrary uploaded URL
        <img src={extra.image_url} alt="" className="h-14 w-14 flex-shrink-0 rounded-lg object-cover" />
      ) : (
        <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-charcoal-50 text-charcoal-300 dark:bg-charcoal-800 dark:text-charcoal-600">
          <ImageOff size={18} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-medium text-charcoal-950 dark:text-white">
          <span className="mr-2 text-xs tabular-nums text-charcoal-400">#{extra.sort_order}</span>
          {extra.name}
          <span className="ml-2 text-sm font-normal text-charcoal-600 dark:text-charcoal-300">{formatKes(Number(extra.price))}</span>
        </p>
        {extra.description ? (
          <p className="mt-0.5 truncate text-sm text-charcoal-500 dark:text-charcoal-400">{extra.description}</p>
        ) : null}
      </div>
      <div className="flex flex-shrink-0 items-center gap-1.5">
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => toggleExtraActive(extra.id, !extra.is_active))}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium",
            extra.is_active
              ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
              : "bg-charcoal-100 text-charcoal-500 dark:bg-charcoal-800 dark:text-charcoal-400"
          )}
        >
          {extra.is_active ? "Offered" : "Hidden"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={`Edit ${extra.name}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-charcoal-500 hover:bg-charcoal-50 hover:text-burgundy-700 dark:text-charcoal-400 dark:hover:bg-charcoal-800"
        >
          <Pencil size={15} />
        </button>
        <button
          type="button"
          disabled={isPending}
          aria-label={`Delete ${extra.name}`}
          onClick={() => {
            if (confirm(`Delete "${extra.name}"? Existing bookings that include it keep their record.`)) {
              startTransition(() => deleteExtra(extra.id));
            }
          }}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-charcoal-500 hover:bg-burgundy-50 hover:text-burgundy-700 dark:text-charcoal-400 dark:hover:bg-charcoal-800"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </li>
  );
}

export function ExtrasManager({ extras }: { extras: Extra[] }) {
  const [adding, setAdding] = useState(extras.length === 0);
  // Bumped after each add so the form remounts empty for the next item.
  const [addFormKey, setAddFormKey] = useState(0);

  return (
    <div className="max-w-3xl space-y-6">
      {adding ? (
        <div className={cardClasses}>
          <div className="mb-4 flex items-center justify-between">
            <p className="font-medium text-charcoal-950 dark:text-white">New extra</p>
            {extras.length > 0 ? (
              <button
                type="button"
                aria-label="Close"
                onClick={() => setAdding(false)}
                className="text-charcoal-400 hover:text-charcoal-700 dark:hover:text-charcoal-200"
              >
                <X size={18} />
              </button>
            ) : null}
          </div>
          <ExtraForm key={addFormKey} onDone={() => setAddFormKey((k) => k + 1)} />
        </div>
      ) : (
        <Button onClick={() => setAdding(true)}>Add Extra</Button>
      )}

      <ul className="space-y-3">
        {extras.map((extra) => (
          <ExtraRow key={extra.id} extra={extra} />
        ))}
      </ul>
    </div>
  );
}
