"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { Loader2, Minus, Plus, Search, Wine } from "lucide-react";
import { getDrinkCategories, searchDrinks, type DrinkCategory, type DrinkResult } from "@/lib/actions/liquor";
import { cn } from "@/lib/cn";
import { formatKes } from "@/lib/payments/balance";

// Kept in sync with MAX_DRINK_QUANTITY in lib/liquor.ts (server-only).
const MAX_QUANTITY = 20;

export type DrinkPicks = Record<string, { name: string; price: number; quantity: number }>;

export function drinksTotal(picks: DrinkPicks) {
  return Object.values(picks).reduce((sum, p) => sum + p.price * p.quantity, 0);
}

const stepperButton =
  "flex h-7 w-7 items-center justify-center rounded-full border border-charcoal-200 text-charcoal-700 hover:border-burgundy-400 hover:text-burgundy-700 disabled:pointer-events-none disabled:opacity-30 dark:border-charcoal-700 dark:text-charcoal-300";

/**
 * Kifaru Liquor's catalogue inside the booking panel. Picked drinks are paid
 * for together with the car in one M-Pesa payment and come with the car.
 */
export function LiquorPicker({ picks, onChange }: { picks: DrinkPicks; onChange: (next: DrinkPicks) => void }) {
  const [categories, setCategories] = useState<DrinkCategory[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DrinkResult[]>([]);
  const [loading, startLoading] = useTransition();

  useEffect(() => {
    getDrinkCategories().then(setCategories);
  }, []);

  // Debounced search whenever the text or category changes.
  useEffect(() => {
    const timer = setTimeout(() => {
      startLoading(async () => setResults(await searchDrinks(query, category)));
    }, 250);
    return () => clearTimeout(timer);
  }, [query, category]);

  const setQuantity = (drink: { id: string; name: string; price: number }, quantity: number) => {
    const next = { ...picks };
    const clamped = Math.max(0, Math.min(MAX_QUANTITY, quantity));
    if (clamped === 0) delete next[drink.id];
    else next[drink.id] = { name: drink.name, price: drink.price, quantity: clamped };
    onChange(next);
  };

  const picked = Object.entries(picks);
  const total = drinksTotal(picks);

  return (
    <div className="rounded-xl border border-charcoal-100 dark:border-charcoal-800">
      <div className="border-b border-charcoal-100 p-3 dark:border-charcoal-800">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Kifaru Liquor — whisky, wine, gin…"
            aria-label="Search drinks"
            className="w-full rounded-lg border border-charcoal-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-burgundy-500 focus:outline-none dark:border-charcoal-700 dark:bg-charcoal-900"
          />
        </div>
        {categories.length > 0 ? (
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
            {[{ slug: null as string | null, name: "All" }, ...categories].map((c) => (
              <button
                key={c.slug ?? "all"}
                type="button"
                onClick={() => setCategory(c.slug)}
                className={cn(
                  "whitespace-nowrap rounded-full border px-3 py-1 text-xs",
                  category === c.slug
                    ? "border-burgundy-600 bg-burgundy-600 text-white"
                    : "border-charcoal-200 text-charcoal-600 hover:border-burgundy-400 dark:border-charcoal-700 dark:text-charcoal-300"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <ul className="max-h-72 divide-y divide-charcoal-100 overflow-y-auto dark:divide-charcoal-800" aria-busy={loading}>
        {results.length === 0 ? (
          <li className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-charcoal-500 dark:text-charcoal-400">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? "Loading drinks…" : "No drinks found."}
          </li>
        ) : (
          results.map((drink) => {
            const quantity = picks[drink.id]?.quantity ?? 0;
            return (
              <li key={drink.id} className={cn("flex items-center gap-3 px-3 py-2", quantity > 0 && "bg-gold-300/10")}>
                <span className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-charcoal-50 dark:bg-charcoal-800">
                  {drink.image_url ? (
                    <Image src={drink.image_url} alt="" fill sizes="40px" className="object-contain p-0.5" />
                  ) : (
                    <Wine size={18} className="absolute inset-0 m-auto text-charcoal-300" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-charcoal-900 dark:text-white">{drink.name}</p>
                  <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
                    {formatKes(drink.price)}
                    {drink.regular_price && drink.regular_price > drink.price ? (
                      <span className="ml-1.5 line-through">{formatKes(drink.regular_price)}</span>
                    ) : null}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Remove one ${drink.name}`}
                    onClick={() => setQuantity(drink, quantity - 1)}
                    disabled={quantity === 0}
                    className={stepperButton}
                  >
                    <Minus size={13} />
                  </button>
                  <span className="w-5 text-center text-sm tabular-nums">{quantity}</span>
                  <button
                    type="button"
                    aria-label={`Add one ${drink.name}`}
                    onClick={() => setQuantity(drink, quantity + 1)}
                    disabled={quantity >= MAX_QUANTITY}
                    className={stepperButton}
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </li>
            );
          })
        )}
      </ul>

      {picked.length > 0 ? (
        <div className="border-t border-charcoal-100 bg-charcoal-50 px-3 py-2.5 text-sm dark:border-charcoal-800 dark:bg-charcoal-800">
          <ul className="space-y-0.5 text-charcoal-700 dark:text-charcoal-300">
            {picked.map(([id, p]) => (
              <li key={id} className="flex justify-between gap-3">
                <span className="truncate">
                  {p.quantity} × {p.name}
                </span>
                <span className="tabular-nums">{formatKes(p.price * p.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-1.5 flex justify-between border-t border-charcoal-200 pt-1.5 font-semibold text-charcoal-950 dark:border-charcoal-700 dark:text-white">
            <span>Drinks</span>
            <span className="tabular-nums">{formatKes(total)}</span>
          </p>
        </div>
      ) : null}
    </div>
  );
}
