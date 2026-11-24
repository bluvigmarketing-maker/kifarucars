import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

// Kifaru Liquor's catalogue lives in the same Supabase project (liquor_*
// tables, managed by the kifaru-liquor app). Car hire reads it so drinks
// can be added to a booking and paid for together with the car.

export const MAX_DRINK_QUANTITY = 20;

export type LiquorPick = { id: string; quantity: number };

export type LiquorLine = { product_id: string; name: string; unit_price: number; quantity: number };

/** Parses the booking form's `drinks` field: JSON [{ id, quantity }]. */
export function parseLiquorPicks(raw: FormDataEntryValue | null): LiquorPick[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const picks = new Map<string, number>();
    for (const item of parsed.slice(0, 100)) {
      const id = typeof item?.id === "string" ? item.id : null;
      const quantity = Number(item?.quantity);
      if (id && Number.isInteger(quantity) && quantity >= 1) picks.set(id, Math.min(quantity, MAX_DRINK_QUANTITY));
    }
    return [...picks].map(([id, quantity]) => ({ id, quantity }));
  } catch {
    return [];
  }
}

/** Unpaid Kifaru Liquor drinks attached to a booking — added to its M-Pesa amount. */
export async function pendingDrinksTotal(admin: SupabaseClient, bookingId: string): Promise<number> {
  const { data } = await admin
    .from("liquor_orders")
    .select("subtotal")
    .eq("booking_id", bookingId)
    .eq("status", "pending_payment");
  return ((data ?? []) as { subtotal: number }[]).reduce((sum, o) => sum + Number(o.subtotal), 0);
}

/** Turns picks from the browser into priced lines — prices always from the database. */
export async function priceLiquorPicks(picks: LiquorPick[]): Promise<{ lines: LiquorLine[]; total: number }> {
  if (picks.length === 0 || !isSupabaseConfigured) return { lines: [], total: 0 };
  const supabase = await createClient();
  const { data } = await supabase
    .from("liquor_products")
    .select("id, name, price")
    .eq("is_active", true)
    .eq("in_stock", true)
    .in("id", picks.map((p) => p.id));
  const byId = new Map((data ?? []).map((p) => [p.id, p]));
  const lines = picks.flatMap((pick) => {
    const product = byId.get(pick.id);
    return product && Number(product.price) > 0
      ? [{ product_id: product.id, name: product.name, unit_price: Number(product.price), quantity: pick.quantity }]
      : [];
  });
  return { lines, total: lines.reduce((sum, l) => sum + l.unit_price * l.quantity, 0) };
}
