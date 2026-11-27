"use client";

import Image from "next/image";
import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { ExternalLink, Pencil, Wine } from "lucide-react";
import { toggleLiquorProduct } from "@/lib/actions/liquor-admin";
import { cn } from "@/lib/cn";
import { LIQUOR_SHOP_URL } from "@/lib/liquor-shop";
import { formatKes } from "@/lib/payments/balance";
import type { LiquorProduct } from "@/lib/types";

type ToggleField = "is_active" | "in_stock" | "is_featured";

function Toggle({ label, on, onChange, disabled }: { label: string; on: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "relative h-5 w-9 flex-shrink-0 rounded-full transition-colors disabled:opacity-50",
        on ? "bg-burgundy-600" : "bg-charcoal-200 dark:bg-charcoal-700"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
          on ? "translate-x-4.5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

function ProductRow({ product }: { product: LiquorProduct }) {
  const [pending, startTransition] = useTransition();
  const [state, setOptimistic] = useOptimistic(product, (current, patch: Partial<LiquorProduct>) => ({
    ...current,
    ...patch,
  }));

  const flip = (field: ToggleField) => {
    const value = !state[field];
    startTransition(async () => {
      setOptimistic({ [field]: value });
      await toggleLiquorProduct(product.id, field, value);
    });
  };

  return (
    <tr className="border-t border-charcoal-100 dark:border-charcoal-800">
      <td className="py-2.5 pl-4 pr-3">
        <div className="flex items-center gap-3">
          <span className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-charcoal-50 dark:bg-charcoal-800">
            {product.image_url ? (
              <Image src={product.image_url} alt="" fill sizes="44px" className="object-contain p-0.5" />
            ) : (
              <Wine size={18} className="absolute inset-0 m-auto text-charcoal-300" />
            )}
          </span>
          <div className="min-w-0">
            <Link
              href={`/kifaruadmin/liquor/products/${product.id}`}
              className="line-clamp-2 text-sm font-medium text-charcoal-900 hover:text-burgundy-700 dark:text-white"
            >
              {product.name}
            </Link>
            {product.sku ? <p className="text-xs text-charcoal-400">{product.sku}</p> : null}
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 text-sm tabular-nums">
        {formatKes(product.price)}
        {product.regular_price ? (
          <span className="ml-1.5 text-xs text-charcoal-400 line-through">{formatKes(product.regular_price)}</span>
        ) : null}
      </td>
      <td className="px-3">
        <Toggle label="Shown in shop" on={state.is_active} disabled={pending} onChange={() => flip("is_active")} />
      </td>
      <td className="px-3">
        <Toggle label="In stock" on={state.in_stock} disabled={pending} onChange={() => flip("in_stock")} />
      </td>
      <td className="px-3">
        <Toggle label="Featured on home page" on={state.is_featured} disabled={pending} onChange={() => flip("is_featured")} />
      </td>
      <td className="whitespace-nowrap py-2.5 pl-3 pr-4 text-right">
        <Link
          href={`/kifaruadmin/liquor/products/${product.id}`}
          aria-label={`Edit ${product.name}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-charcoal-500 hover:bg-charcoal-50 hover:text-burgundy-700 dark:hover:bg-charcoal-800"
        >
          <Pencil size={15} />
        </Link>
        {state.is_active ? (
          <a
            href={`${LIQUOR_SHOP_URL}/product/${product.slug}`}
            target="_blank"
            rel="noopener"
            aria-label={`View ${product.name} in the shop`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-charcoal-500 hover:bg-charcoal-50 hover:text-burgundy-700 dark:hover:bg-charcoal-800"
          >
            <ExternalLink size={15} />
          </a>
        ) : null}
      </td>
    </tr>
  );
}

export function LiquorProductsTable({ products }: { products: LiquorProduct[] }) {
  if (products.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-charcoal-200 p-8 text-center text-sm text-charcoal-500 dark:border-charcoal-700 dark:text-charcoal-400">
        No products match.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-charcoal-100 bg-white dark:border-charcoal-800 dark:bg-charcoal-900">
      <table className="w-full min-w-[640px] text-left">
        <thead className="text-xs font-semibold uppercase tracking-wide text-charcoal-500 dark:text-charcoal-400">
          <tr>
            <th className="py-3 pl-4 pr-3">Product</th>
            <th className="px-3">Price</th>
            <th className="px-3">In shop</th>
            <th className="px-3">In stock</th>
            <th className="px-3">Featured</th>
            <th className="pr-4" />
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <ProductRow key={product.id} product={product} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
