"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type DrinkResult = { id: string; name: string; price: number; regular_price: number | null; image_url: string | null };
export type DrinkCategory = { slug: string; name: string };

const RESULT_LIMIT = 30;

/** Top-level Kifaru Liquor categories for the booking drinks picker. */
export async function getDrinkCategories(): Promise<DrinkCategory[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("liquor_categories")
    .select("slug, name, parent_id")
    .neq("slug", "uncategorized")
    .is("parent_id", null)
    .order("sort_order");
  return (data ?? []).map((c) => ({ slug: c.slug, name: c.name.charAt(0).toUpperCase() + c.name.slice(1) }));
}

/** Searches the Kifaru Liquor catalogue from the booking panel. */
export async function searchDrinks(query: string, categorySlug: string | null): Promise<DrinkResult[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const term = query.trim().slice(0, 60).replace(/[%,()]/g, " ");

  let categoryIds: string[] | null = null;
  if (categorySlug) {
    // A category plus its sub-categories (Spirits → Whisky, Gin, Vodka).
    const { data: categories } = await supabase.from("liquor_categories").select("id, slug, parent_id");
    const root = categories?.find((c) => c.slug === categorySlug);
    if (root) {
      const ids = new Set([root.id]);
      for (const c of categories ?? []) if (c.parent_id && ids.has(c.parent_id)) ids.add(c.id);
      categoryIds = [...ids];
    }
  }

  let request = categoryIds
    ? supabase
        .from("liquor_products")
        .select("id, name, price, regular_price, image_url, liquor_product_categories!inner(category_id)")
        .in("liquor_product_categories.category_id", categoryIds)
    : supabase.from("liquor_products").select("id, name, price, regular_price, image_url");

  request = request.eq("is_active", true).eq("in_stock", true).gt("price", 0);
  if (term) request = request.ilike("name", `%${term}%`);
  const { data } = await request.order("name").limit(RESULT_LIMIT);

  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    regular_price: p.regular_price == null ? null : Number(p.regular_price),
    image_url: p.image_url,
  }));
}
