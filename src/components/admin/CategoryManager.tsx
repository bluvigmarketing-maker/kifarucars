"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { deleteCategory, saveCategory } from "@/lib/actions/categories";
import { Button } from "@/components/ui/Button";
import type { CategoryFormState } from "@/lib/validations";
import type { VehicleCategory } from "@/lib/types";

const initialState: CategoryFormState = { status: "idle" };

const inputClasses =
  "mt-1.5 w-full rounded-lg border border-charcoal-200 bg-white px-4 py-2.5 text-sm text-charcoal-900 focus:border-burgundy-500 focus:outline-none dark:border-charcoal-700 dark:bg-charcoal-900 dark:text-charcoal-50";
const labelClasses = "text-sm font-medium text-charcoal-700 dark:text-charcoal-300";
const cardClasses =
  "rounded-2xl border-2 border-gold-500/60 bg-white p-5 shadow-[0_0_18px_-6px_rgba(201,162,39,0.45)] dark:border-gold-400/50 dark:bg-charcoal-900 dark:shadow-[0_0_18px_-6px_rgba(212,185,106,0.35)]";

// Shared by "Add category" and each row's edit mode.
function CategoryForm({
  category,
  onDone,
}: {
  category?: VehicleCategory;
  onDone?: () => void;
}) {
  const [state, formAction, pending] = useActionState(saveCategory, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state.status === "error" ? state.errors : undefined;

  useEffect(() => {
    if (state.status !== "success") return;
    if (category) onDone?.();
    else formRef.current?.reset();
  }, [state, category, onDone]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_7rem]">
        <div>
          <label className={labelClasses}>Name</label>
          <input
            name="name"
            required
            defaultValue={category?.name}
            className={inputClasses}
            placeholder="e.g. Luxury SUV"
          />
          {errors?.name ? <p className="mt-1 text-xs text-burgundy-600">{errors.name[0]}</p> : null}
        </div>
        <div>
          <label className={labelClasses}>Order</label>
          <input
            type="number"
            name="sortOrder"
            min={0}
            defaultValue={category?.sort_order ?? ""}
            className={inputClasses}
            placeholder="Last"
          />
        </div>
      </div>
      <div>
        <label className={labelClasses}>Description</label>
        <input
          name="description"
          defaultValue={category?.description}
          className={inputClasses}
          placeholder="Optional — shown under the category on the pricing page"
        />
      </div>
      {state.status === "error" && state.message ? (
        <p className="text-sm text-burgundy-600">{state.message}</p>
      ) : null}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving..." : category ? "Save" : "Add Category"}
        </Button>
        {category ? (
          <Button type="button" size="sm" variant="outline" onClick={onDone}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function CategoryRow({ category, vehicleCount }: { category: VehicleCategory; vehicleCount: number }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return (
      <li className={cardClasses}>
        <CategoryForm category={category} onDone={() => setEditing(false)} />
      </li>
    );
  }

  return (
    <li className={cardClasses}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-charcoal-950 dark:text-white">
            <span className="mr-2 text-xs tabular-nums text-charcoal-400">#{category.sort_order}</span>
            {category.name}
          </p>
          {category.description ? (
            <p className="mt-0.5 text-sm text-charcoal-600 dark:text-charcoal-300">{category.description}</p>
          ) : null}
          <p className="mt-1 text-xs text-charcoal-500 dark:text-charcoal-400">
            {vehicleCount} {vehicleCount === 1 ? "vehicle" : "vehicles"}
          </p>
        </div>
        <div className="flex flex-shrink-0 gap-1.5">
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label={`Edit ${category.name}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-charcoal-500 hover:bg-charcoal-50 hover:text-burgundy-700 dark:text-charcoal-400 dark:hover:bg-charcoal-800"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            disabled={isPending}
            aria-label={`Delete ${category.name}`}
            onClick={() => {
              const note = vehicleCount > 0 ? ` Its ${vehicleCount} vehicle(s) will become uncategorised.` : "";
              if (confirm(`Delete the "${category.name}" category?${note}`)) {
                startTransition(() => deleteCategory(category.id));
              }
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-charcoal-500 hover:bg-burgundy-50 hover:text-burgundy-700 dark:text-charcoal-400 dark:hover:bg-charcoal-800"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </li>
  );
}

export function CategoryManager({
  categories,
  vehicleCounts,
}: {
  categories: VehicleCategory[];
  vehicleCounts: Record<string, number>;
}) {
  const [adding, setAdding] = useState(categories.length === 0);

  return (
    <div className="max-w-2xl space-y-6">
      {adding ? (
        <div className={cardClasses}>
          <div className="mb-4 flex items-center justify-between">
            <p className="font-medium text-charcoal-950 dark:text-white">New category</p>
            {categories.length > 0 ? (
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
          <CategoryForm />
        </div>
      ) : (
        <Button onClick={() => setAdding(true)}>Add Category</Button>
      )}

      <ul className="space-y-3">
        {categories.map((category) => (
          <CategoryRow key={category.id} category={category} vehicleCount={vehicleCounts[category.id] ?? 0} />
        ))}
      </ul>

      {categories.length === 0 ? (
        <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
          No categories yet. Add one, then assign vehicles to it from each vehicle&apos;s edit page.
        </p>
      ) : null}
    </div>
  );
}
