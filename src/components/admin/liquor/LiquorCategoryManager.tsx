"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { deleteLiquorCategory, saveLiquorCategory, type LiquorCategoryFormState } from "@/lib/actions/liquor-admin";
import type { LiquorCategory } from "@/lib/types";

type CategoryWithCount = LiquorCategory & { productCount: number };

const inputClasses =
  "mt-1.5 w-full rounded-lg border border-charcoal-200 bg-white px-4 py-2.5 text-sm text-charcoal-900 focus:border-burgundy-500 focus:outline-none dark:border-charcoal-700 dark:bg-charcoal-900 dark:text-charcoal-50";
const labelClasses = "text-sm font-medium text-charcoal-700 dark:text-charcoal-300";
const cardClasses =
  "rounded-2xl border-2 border-gold-500/60 bg-white p-5 shadow-[0_0_18px_-6px_rgba(201,162,39,0.45)] dark:border-gold-400/50 dark:bg-charcoal-900";

const label = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

function CategoryForm({
  category,
  parents,
  onDone,
}: {
  category?: CategoryWithCount;
  parents: CategoryWithCount[];
  onDone?: () => void;
}) {
  const [state, formAction, pending] = useActionState(saveLiquorCategory, { status: "idle" } as LiquorCategoryFormState);
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
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem_6rem]">
        <div>
          <label className={labelClasses}>Name</label>
          <input name="name" required defaultValue={category?.name} placeholder="e.g. Tequila" className={inputClasses} />
          {errors?.name ? <p className="mt-1 text-xs text-burgundy-600">{errors.name[0]}</p> : null}
        </div>
        <div>
          <label className={labelClasses}>Inside</label>
          <select name="parentId" defaultValue={category?.parent_id ?? ""} className={inputClasses}>
            <option value="">— Top level —</option>
            {parents
              .filter((p) => p.id !== category?.id)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {label(p.name)}
                </option>
              ))}
          </select>
          {errors?.parentId ? <p className="mt-1 text-xs text-burgundy-600">{errors.parentId[0]}</p> : null}
        </div>
        <div>
          <label className={labelClasses}>Order</label>
          <input type="number" name="sortOrder" min={0} defaultValue={category?.sort_order ?? ""} placeholder="0" className={inputClasses} />
        </div>
      </div>
      <div>
        <label className={labelClasses}>Description</label>
        <input
          name="description"
          defaultValue={category?.description}
          placeholder="Optional — shown at the top of the category page"
          className={inputClasses}
        />
      </div>
      {state.status === "error" && state.message ? <p className="text-sm text-burgundy-600">{state.message}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving..." : category ? "Save" : "Add category"}
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

function CategoryRow({ category, parents }: { category: CategoryWithCount; parents: CategoryWithCount[] }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  if (editing) {
    return (
      <li className={cardClasses}>
        <CategoryForm category={category} parents={parents} onDone={() => setEditing(false)} />
      </li>
    );
  }

  return (
    <li className={`${cardClasses} ${category.parent_id ? "ml-6" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-charcoal-950 dark:text-white">
            <span className="mr-2 text-xs tabular-nums text-charcoal-400">#{category.sort_order}</span>
            {label(category.name)}
          </p>
          {category.description ? (
            <p className="mt-0.5 text-sm text-charcoal-600 dark:text-charcoal-300">{category.description}</p>
          ) : null}
          <Link
            href={`/kifaruadmin/liquor/products?category=${category.id}`}
            className="mt-1 inline-block text-xs text-charcoal-500 hover:text-burgundy-700 dark:text-charcoal-400"
          >
            {category.productCount} {category.productCount === 1 ? "product" : "products"}
          </Link>
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
            disabled={pending}
            aria-label={`Delete ${category.name}`}
            onClick={() => {
              const note = category.productCount > 0 ? ` Its ${category.productCount} product(s) stay in the shop, just without this category.` : "";
              if (confirm(`Delete the "${label(category.name)}" category?${note}`)) {
                startTransition(() => deleteLiquorCategory(category.id));
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

export function LiquorCategoryManager({ categories }: { categories: CategoryWithCount[] }) {
  const parents = categories.filter((c) => !c.parent_id);
  // Each parent followed by its sub-categories.
  const ordered = [
    ...parents.flatMap((p) => [p, ...categories.filter((c) => c.parent_id === p.id)]),
    ...categories.filter((c) => c.parent_id && !parents.some((p) => p.id === c.parent_id)),
  ];

  return (
    <div className="grid max-w-3xl gap-6">
      <div className={cardClasses}>
        <h2 className="mb-4 font-display text-lg text-charcoal-950 dark:text-white">Add a category</h2>
        <CategoryForm parents={parents} />
      </div>
      <ul className="space-y-3">
        {ordered.map((category) => (
          <CategoryRow key={category.id} category={category} parents={parents} />
        ))}
      </ul>
    </div>
  );
}
