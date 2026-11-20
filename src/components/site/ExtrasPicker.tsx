"use client";

import Image from "next/image";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatKes } from "@/lib/payments/balance";
import { MAX_EXTRA_QUANTITY } from "@/lib/vehicle-display";
import type { PublicExtra } from "@/lib/types";

export type ExtraQuantities = Record<string, number>;

export function selectedExtras(extras: PublicExtra[], quantities: ExtraQuantities) {
  const lines = extras
    .filter((e) => (quantities[e.id] ?? 0) > 0)
    .map((e) => ({ ...e, quantity: quantities[e.id], lineTotal: e.price * quantities[e.id] }));
  return { lines, total: lines.reduce((sum, l) => sum + l.lineTotal, 0) };
}

const stepperButton =
  "flex h-7 w-7 items-center justify-center rounded-full border border-charcoal-200 text-charcoal-700 hover:border-burgundy-400 hover:text-burgundy-700 disabled:pointer-events-none disabled:opacity-30 dark:border-charcoal-700 dark:text-charcoal-300";

// Drinks, snacks etc. the client can have waiting with the car. Paid at
// pickup — never added to the M-Pesa amount.
export function ExtrasPicker({
  extras,
  quantities,
  onChange,
}: {
  extras: PublicExtra[];
  quantities: ExtraQuantities;
  onChange: (next: ExtraQuantities) => void;
}) {
  if (extras.length === 0) return null;
  const { total } = selectedExtras(extras, quantities);

  const setQuantity = (id: string, quantity: number) =>
    onChange({ ...quantities, [id]: Math.max(0, Math.min(MAX_EXTRA_QUANTITY, quantity)) });

  return (
    <fieldset>
      <legend className="flex items-center gap-1.5 text-sm font-medium text-charcoal-700 dark:text-charcoal-300">
        <ShoppingBag size={15} className="text-gold-600 dark:text-gold-400" />
        Add extras <span className="font-normal text-charcoal-500 dark:text-charcoal-400">(optional)</span>
      </legend>
      <p className="mt-0.5 text-xs text-charcoal-500 dark:text-charcoal-400">
        We&apos;ll have these ready with your car. Pay for them at pickup — they&apos;re not part of the M-Pesa
        payment.
      </p>

      <ul className="mt-3 divide-y divide-charcoal-100 rounded-xl border border-charcoal-100 dark:divide-charcoal-800 dark:border-charcoal-800">
        {extras.map((extra) => {
          const quantity = quantities[extra.id] ?? 0;
          return (
            <li key={extra.id} className={cn("flex items-center gap-3 px-3 py-2.5", quantity > 0 && "bg-gold-300/10")}>
              {extra.image_url ? (
                <span className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-charcoal-50 dark:bg-charcoal-800">
                  <Image src={extra.image_url} alt="" fill sizes="40px" className="object-cover" />
                </span>
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-charcoal-950 dark:text-white">{extra.name}</p>
                <p className="truncate text-xs text-charcoal-500 dark:text-charcoal-400">
                  {formatKes(extra.price)}
                  {extra.description ? ` · ${extra.description}` : ""}
                </p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <button
                  type="button"
                  aria-label={`Fewer ${extra.name}`}
                  disabled={quantity === 0}
                  onClick={() => setQuantity(extra.id, quantity - 1)}
                  className={stepperButton}
                >
                  <Minus size={13} />
                </button>
                <span className="w-5 text-center text-sm tabular-nums text-charcoal-950 dark:text-white" aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label={`More ${extra.name}`}
                  disabled={quantity >= MAX_EXTRA_QUANTITY}
                  onClick={() => setQuantity(extra.id, quantity + 1)}
                  className={stepperButton}
                >
                  <Plus size={13} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {total > 0 ? (
        <p className="mt-2 flex justify-between text-sm text-charcoal-700 dark:text-charcoal-300">
          <span>Extras — pay at pickup</span>
          <span className="font-medium">{formatKes(total)}</span>
        </p>
      ) : null}
    </fieldset>
  );
}
