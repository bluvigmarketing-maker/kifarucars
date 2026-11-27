"use client";

import Image from "next/image";
import { useActionState, useState, useTransition } from "react";
import { ExternalLink, ImagePlus, Loader2, Trash2, Wine, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { deleteLiquorProduct, saveLiquorProduct, type LiquorProductFormState } from "@/lib/actions/liquor-admin";
import { LIQUOR_SHOP_URL } from "@/lib/liquor-shop";
import { uploadLiquorImage } from "@/lib/supabase/storage";
import type { LiquorCategory, LiquorProduct } from "@/lib/types";

const inputClasses =
  "mt-1.5 w-full rounded-lg border border-charcoal-200 bg-white px-4 py-2.5 text-sm text-charcoal-900 focus:border-burgundy-500 focus:outline-none dark:border-charcoal-700 dark:bg-charcoal-900 dark:text-charcoal-50";
const labelClasses = "text-sm font-medium text-charcoal-700 dark:text-charcoal-300";
const hintClasses = "mt-1 text-xs text-charcoal-500 dark:text-charcoal-400";
const cardClasses = "rounded-2xl border border-charcoal-100 bg-white p-6 dark:border-charcoal-800 dark:bg-charcoal-900";

function FieldError({ messages }: { messages?: string[] }) {
  return messages?.length ? <p className="mt-1 text-xs text-burgundy-600">{messages[0]}</p> : null;
}

export function LiquorProductForm({ product, categories }: { product?: LiquorProduct; categories: LiquorCategory[] }) {
  const [state, formAction, saving] = useActionState(saveLiquorProduct, { status: "idle" } as LiquorProductFormState);
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleting, startDelete] = useTransition();
  const errors = state.status === "error" ? state.errors : undefined;

  // Parents first, each followed by its sub-categories.
  const topLevel = categories.filter((c) => !c.parent_id);
  const ordered = topLevel.flatMap((parent) => [parent, ...categories.filter((c) => c.parent_id === parent.id)]);
  const orphans = categories.filter((c) => c.parent_id && !categories.some((p) => p.id === c.parent_id));

  return (
    <form action={formAction} className="grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <input type="hidden" name="imageUrl" value={imageUrl} />

      <div className="space-y-6">
        <section className={`${cardClasses} space-y-4`}>
          <div>
            <label htmlFor="name" className={labelClasses}>
              Product name
            </label>
            <input id="name" name="name" required defaultValue={product?.name} className={inputClasses} placeholder="e.g. Jameson 750ml" />
            <FieldError messages={errors?.name} />
            {product ? (
              <p className={hintClasses}>
                Shop address:{" "}
                <a
                  href={`${LIQUOR_SHOP_URL}/product/${product.slug}`}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-1 hover:text-burgundy-700"
                >
                  /product/{product.slug} <ExternalLink size={11} />
                </a>{" "}
                (stays the same if you rename it)
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="price" className={labelClasses}>
                Selling price (KES)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min={1}
                step="1"
                required
                defaultValue={product?.price || ""}
                className={inputClasses}
              />
              <FieldError messages={errors?.price} />
            </div>
            <div>
              <label htmlFor="regularPrice" className={labelClasses}>
                &ldquo;Was&rdquo; price (KES)
              </label>
              <input
                id="regularPrice"
                name="regularPrice"
                type="number"
                min={0}
                step="1"
                defaultValue={product?.regular_price ?? ""}
                placeholder="Optional"
                className={inputClasses}
              />
              <FieldError messages={errors?.regularPrice} />
              <p className={hintClasses}>Shows a discount badge when higher than the selling price.</p>
            </div>
            <div>
              <label htmlFor="sku" className={labelClasses}>
                SKU / code
              </label>
              <input id="sku" name="sku" defaultValue={product?.sku} placeholder="Optional" className={inputClasses} />
            </div>
          </div>

          <div>
            <label htmlFor="shortDescription" className={labelClasses}>
              Short description
            </label>
            <input
              id="shortDescription"
              name="shortDescription"
              defaultValue={product?.short_description}
              placeholder="One line shown under the price — e.g. Smooth Irish whiskey, triple distilled."
              className={inputClasses}
            />
            <FieldError messages={errors?.shortDescription} />
          </div>
          <div>
            <label htmlFor="description" className={labelClasses}>
              Full description
            </label>
            <textarea id="description" name="description" rows={5} defaultValue={product?.description} className={inputClasses} />
            <FieldError messages={errors?.description} />
          </div>
        </section>

        <section className={cardClasses}>
          <h2 className="font-display text-lg text-charcoal-950 dark:text-white">Categories</h2>
          <div className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-2">
            {[...ordered, ...orphans].map((c) => (
              <label key={c.id} className={`flex items-center gap-2 text-sm ${c.parent_id ? "pl-5" : "font-medium"}`}>
                <input
                  type="checkbox"
                  name="categoryIds"
                  value={c.id}
                  defaultChecked={product?.category_ids.includes(c.id)}
                  className="h-4 w-4 accent-burgundy-600"
                />
                {c.name.charAt(0).toUpperCase() + c.name.slice(1)}
              </label>
            ))}
          </div>
          <p className={hintClasses}>Tick the most specific one (e.g. Whisky) — it also appears under its parent (Spirits).</p>
        </section>
      </div>

      <div className="space-y-6">
        <section className={cardClasses}>
          <h2 className="font-display text-lg text-charcoal-950 dark:text-white">Photo</h2>
          <div className="relative mt-3 aspect-square overflow-hidden rounded-xl bg-charcoal-50 dark:bg-charcoal-800">
            {imageUrl ? (
              <Image src={imageUrl} alt="" fill sizes="320px" className="object-contain p-3" />
            ) : (
              <Wine className="absolute inset-0 m-auto text-charcoal-300" size={48} />
            )}
            {uploading ? (
              <span className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-charcoal-900/70">
                <Loader2 className="animate-spin text-burgundy-600" />
              </span>
            ) : null}
          </div>
          <div className="mt-3 flex gap-2">
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-charcoal-200 px-3 py-2 text-sm font-medium hover:border-burgundy-400 dark:border-charcoal-700">
              <ImagePlus size={15} /> {imageUrl ? "Replace" : "Upload"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="sr-only"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  setUploading(true);
                  setUploadError(null);
                  const result = await uploadLiquorImage(file);
                  setUploading(false);
                  if ("url" in result) setImageUrl(result.url);
                  else setUploadError(result.error);
                }}
              />
            </label>
            {imageUrl ? (
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-charcoal-500 hover:text-burgundy-700"
              >
                <X size={15} /> Remove
              </button>
            ) : null}
          </div>
          {uploadError ? <p className="mt-2 text-xs text-burgundy-600">{uploadError}</p> : null}
          <FieldError messages={errors?.imageUrl} />
          <p className={hintClasses}>Square photos on a plain background look best. Max 8MB.</p>
        </section>

        <section className={`${cardClasses} space-y-3`}>
          <h2 className="font-display text-lg text-charcoal-950 dark:text-white">Visibility</h2>
          {[
            { name: "isActive", label: "Show in the shop", checked: product?.is_active ?? true },
            { name: "inStock", label: "In stock (can be ordered)", checked: product?.in_stock ?? true },
            { name: "isFeatured", label: "Feature on the home page", checked: product?.is_featured ?? false },
          ].map((opt) => (
            <label key={opt.name} className="flex items-center gap-2.5 text-sm">
              <input type="checkbox" name={opt.name} defaultChecked={opt.checked} className="h-4 w-4 accent-burgundy-600" />
              {opt.label}
            </label>
          ))}
        </section>

        {state.status === "error" && state.message ? <p className="text-sm text-burgundy-600">{state.message}</p> : null}
        {state.status === "error" && state.errors ? (
          <p className="text-sm text-burgundy-600">Please fix the highlighted fields.</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={saving || uploading}>
            {saving ? "Saving..." : product ? "Save changes" : "Add product"}
          </Button>
          <Button href="/kifaruadmin/liquor/products" variant="outline">
            Cancel
          </Button>
        </div>

        {product ? (
          <button
            type="button"
            disabled={deleting}
            onClick={() => {
              if (confirm(`Delete "${product.name}"? Past orders keep their details. To just stop selling it, untick "Show in the shop" instead.`)) {
                startDelete(() => deleteLiquorProduct(product.id));
              }
            }}
            className="inline-flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-burgundy-700"
          >
            <Trash2 size={14} /> {deleting ? "Deleting..." : "Delete product"}
          </button>
        ) : null}
      </div>
    </form>
  );
}
