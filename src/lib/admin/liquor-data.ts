import "server-only";
import { verifyAdmin } from "@/lib/admin/dal";
import { createClient } from "@/lib/supabase/server";
import type { LiquorCategory, LiquorOrder, LiquorOrderStatus, LiquorProduct } from "@/lib/types";

// Kifaru Liquor admin queries. They run as the signed-in staff user, so the
// liquor_* tables' "staff manage" RLS policies apply (see the kifaru-liqour
// repo, migrations 0001/0002).

export const LIQUOR_PRODUCTS_PAGE_SIZE = 30;

const num = (v: unknown) => (v == null ? null : Number(v));

export async function listLiquorCategories(): Promise<(LiquorCategory & { productCount: number })[]> {
  await verifyAdmin();
  const supabase = await createClient();
  const [{ data: categories }, { data: links }] = await Promise.all([
    supabase.from("liquor_categories").select("id, name, slug, parent_id, description, sort_order").order("sort_order").order("name"),
    supabase.from("liquor_product_categories").select("category_id"),
  ]);
  const counts = new Map<string, number>();
  for (const l of links ?? []) counts.set(l.category_id, (counts.get(l.category_id) ?? 0) + 1);
  return ((categories ?? []) as LiquorCategory[]).map((c) => ({ ...c, productCount: counts.get(c.id) ?? 0 }));
}

export type ProductFilter = "all" | "live" | "hidden" | "out-of-stock" | "featured" | "no-photo";

export async function listLiquorProducts({
  q,
  categoryId,
  filter = "all",
  page = 1,
}: {
  q?: string;
  categoryId?: string;
  filter?: ProductFilter;
  page?: number;
}): Promise<{ products: LiquorProduct[]; total: number }> {
  await verifyAdmin();
  const supabase = await createClient();

  const fields =
    "id, slug, name, sku, short_description, description, price, regular_price, image_url, in_stock, is_active, is_featured, sort_order, updated_at";
  let query = categoryId
    ? supabase
        .from("liquor_products")
        .select(`${fields}, links:liquor_product_categories!inner(category_id)`, { count: "exact" })
        .eq("links.category_id", categoryId)
    : supabase.from("liquor_products").select(`${fields}, links:liquor_product_categories(category_id)`, { count: "exact" });

  const term = q?.trim().replace(/[%,()]/g, " ");
  if (term) query = query.or(`name.ilike.%${term}%,sku.ilike.%${term}%`);
  if (filter === "live") query = query.eq("is_active", true);
  if (filter === "hidden") query = query.eq("is_active", false);
  if (filter === "out-of-stock") query = query.eq("in_stock", false);
  if (filter === "featured") query = query.eq("is_featured", true);
  if (filter === "no-photo") query = query.is("image_url", null);

  const from = (Math.max(1, page) - 1) * LIQUOR_PRODUCTS_PAGE_SIZE;
  const { data, count } = await query.order("name").range(from, from + LIQUOR_PRODUCTS_PAGE_SIZE - 1);

  const products = (data ?? []).map((row) => {
    const { links, ...rest } = row as typeof row & { links: { category_id: string }[] };
    return {
      ...rest,
      price: Number(rest.price),
      regular_price: num(rest.regular_price),
      category_ids: links.map((l) => l.category_id),
    } as LiquorProduct;
  });
  return { products, total: count ?? 0 };
}

export async function getLiquorProduct(id: string): Promise<LiquorProduct | null> {
  await verifyAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("liquor_products")
    .select("*, links:liquor_product_categories(category_id)")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const { links, ...rest } = data as LiquorProduct & { links: { category_id: string }[] };
  return {
    ...rest,
    price: Number(rest.price),
    regular_price: num(rest.regular_price),
    category_ids: links.map((l) => l.category_id),
  };
}

export async function listLiquorOrders(status?: LiquorOrderStatus | "open"): Promise<LiquorOrder[]> {
  await verifyAdmin();
  const supabase = await createClient();

  let query = supabase
    .from("liquor_orders")
    .select(
      "id, order_number, source, booking_id, full_name, phone, email, delivery_address, notes, subtotal, status, paid_at, created_at, items:liquor_order_items(name, unit_price, quantity)"
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (status === "open") query = query.in("status", ["paid", "processing"]);
  else if (status) query = query.eq("status", status);
  const { data } = await query;
  const orders = (data ?? []) as Omit<LiquorOrder, "mpesa_receipt" | "booking">[];
  if (orders.length === 0) return [];

  // Receipts: a shop order has its own payment; drinks bought with a car
  // were paid by the booking's payment.
  const orderIds = orders.filter((o) => o.source === "liquor").map((o) => o.id);
  const bookingIds = orders.flatMap((o) => (o.booking_id ? [o.booking_id] : []));
  const [{ data: orderPayments }, { data: bookingPayments }, { data: bookings }] = await Promise.all([
    orderIds.length
      ? supabase.from("payments").select("liquor_order_id, mpesa_receipt").eq("status", "paid").in("liquor_order_id", orderIds)
      : Promise.resolve({ data: [] as { liquor_order_id: string; mpesa_receipt: string | null }[] }),
    bookingIds.length
      ? supabase.from("payments").select("booking_id, mpesa_receipt").eq("status", "paid").in("booking_id", bookingIds)
      : Promise.resolve({ data: [] as { booking_id: string; mpesa_receipt: string | null }[] }),
    bookingIds.length
      ? supabase.from("bookings").select("id, start_date, end_date, vehicle:vehicles(name, make)").in("id", bookingIds)
      : Promise.resolve({ data: [] }),
  ]);
  const receiptByOrder = new Map((orderPayments ?? []).map((p) => [p.liquor_order_id, p.mpesa_receipt]));
  const receiptByBooking = new Map((bookingPayments ?? []).map((p) => [p.booking_id, p.mpesa_receipt]));
  const bookingById = new Map(
    ((bookings ?? []) as unknown as {
      id: string;
      start_date: string;
      end_date: string;
      vehicle: { name: string; make: string } | null;
    }[]).map((b) => [
      b.id,
      {
        start_date: b.start_date,
        end_date: b.end_date,
        vehicle_name: b.vehicle ? [b.vehicle.make, b.vehicle.name].filter(Boolean).join(" ") : "Car",
      },
    ])
  );

  return orders.map((o) => ({
    ...o,
    subtotal: Number(o.subtotal),
    items: o.items.map((i) => ({ ...i, unit_price: Number(i.unit_price) })),
    mpesa_receipt: (o.source === "liquor" ? receiptByOrder.get(o.id) : receiptByBooking.get(o.booking_id ?? "")) ?? null,
    booking: o.booking_id ? (bookingById.get(o.booking_id) ?? null) : null,
  }));
}

/** Paid or processing orders still to deliver — for the dashboard overview. */
export async function countOpenLiquorOrders(): Promise<{ open: number; total: number }> {
  await verifyAdmin();
  const supabase = await createClient();
  const [{ count: open }, { count: total }] = await Promise.all([
    supabase.from("liquor_orders").select("id", { count: "exact", head: true }).in("status", ["paid", "processing"]),
    supabase.from("liquor_orders").select("id", { count: "exact", head: true }).neq("status", "pending_payment"),
  ]);
  return { open: open ?? 0, total: total ?? 0 };
}
