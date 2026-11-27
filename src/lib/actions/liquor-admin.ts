"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { verifyAdmin } from "@/lib/admin/dal";
import { createClient } from "@/lib/supabase/server";
import type { LiquorOrderStatus } from "@/lib/types";

// Kifaru Liquor admin actions (Orders / Products / Categories under
// /kifaruadmin/liquor). Run as the signed-in staff user; the liquor_*
// tables' RLS only lets staff write. The shop (liqour.kifaru.ke) reads the
// same tables on every request, so changes show there straight away.

function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "item"
  );
}

async function uniqueSlug(table: "liquor_products" | "liquor_categories", base: string) {
  const supabase = await createClient();
  const { data } = await supabase.from(table).select("slug").like("slug", `${base}%`);
  const taken = new Set((data ?? []).map((r) => r.slug));
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
}

// ── Orders ────────────────────────────────────────────────────────────

const ORDER_STATUSES: LiquorOrderStatus[] = ["pending_payment", "paid", "processing", "delivered", "cancelled"];

export async function updateLiquorOrderStatus(id: string, status: LiquorOrderStatus) {
  await verifyAdmin();
  if (!ORDER_STATUSES.includes(status)) return;
  const supabase = await createClient();
  await supabase.from("liquor_orders").update({ status }).eq("id", id);
  revalidatePath("/kifaruadmin/liquor/orders");
  revalidatePath("/kifaruadmin/bookings");
}

// ── Products ──────────────────────────────────────────────────────────

const optionalMoney = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.coerce.number().min(0, "Can't be negative.").max(10_000_000).optional()
);

const ProductSchema = z.object({
  name: z.string().trim().min(2, "Enter the product name.").max(200),
  sku: z.string().trim().max(60),
  price: z.coerce.number({ message: "Enter the selling price." }).min(1, "Enter the selling price.").max(10_000_000),
  regularPrice: optionalMoney,
  shortDescription: z.string().trim().max(500),
  description: z.string().trim().max(5000),
  imageUrl: z.union([z.literal(""), z.url("The photo link isn't valid.")]),
  categoryIds: z.array(z.uuid()).max(10),
  isActive: z.boolean(),
  inStock: z.boolean(),
  isFeatured: z.boolean(),
});

export type LiquorProductFormState =
  | { status: "idle" }
  | { status: "error"; message?: string; errors?: Partial<Record<keyof z.infer<typeof ProductSchema>, string[]>> };

export async function saveLiquorProduct(
  _prev: LiquorProductFormState,
  formData: FormData
): Promise<LiquorProductFormState> {
  await verifyAdmin();

  const validated = ProductSchema.safeParse({
    name: formData.get("name") ?? "",
    sku: formData.get("sku") ?? "",
    price: formData.get("price"),
    regularPrice: formData.get("regularPrice"),
    shortDescription: formData.get("shortDescription") ?? "",
    description: formData.get("description") ?? "",
    imageUrl: (formData.get("imageUrl") ?? "").toString().trim(),
    categoryIds: formData.getAll("categoryIds").map(String),
    isActive: formData.get("isActive") === "on",
    inStock: formData.get("inStock") === "on",
    isFeatured: formData.get("isFeatured") === "on",
  });
  if (!validated.success) return { status: "error", errors: z.flattenError(validated.error).fieldErrors };
  const v = validated.data;
  if (v.regularPrice !== undefined && v.regularPrice > 0 && v.regularPrice < v.price) {
    return { status: "error", errors: { regularPrice: ["The \"was\" price must be higher than the selling price."] } };
  }

  const id = formData.get("id");
  const isUpdate = typeof id === "string" && id.length > 0;
  const supabase = await createClient();

  const record = {
    name: v.name,
    sku: v.sku,
    price: v.price,
    // Only kept when it's a real discount.
    regular_price: v.regularPrice && v.regularPrice > v.price ? v.regularPrice : null,
    short_description: v.shortDescription,
    description: v.description,
    image_url: v.imageUrl || null,
    is_active: v.isActive,
    in_stock: v.inStock,
    is_featured: v.isFeatured,
    updated_at: new Date().toISOString(),
  };

  let productId: string;
  if (isUpdate) {
    // The slug (web address) never changes on edit, so links keep working.
    const { error } = await supabase.from("liquor_products").update(record).eq("id", id);
    if (error) return { status: "error", message: "Could not save the product. Please try again." };
    productId = id;
  } else {
    const slug = await uniqueSlug("liquor_products", slugify(v.name));
    const { data, error } = await supabase.from("liquor_products").insert({ ...record, slug }).select("id").single();
    if (error || !data) return { status: "error", message: "Could not add the product. Please try again." };
    productId = data.id;
  }

  // Replace the category links.
  await supabase.from("liquor_product_categories").delete().eq("product_id", productId);
  if (v.categoryIds.length > 0) {
    await supabase
      .from("liquor_product_categories")
      .insert(v.categoryIds.map((category_id) => ({ product_id: productId, category_id })));
  }

  revalidatePath("/kifaruadmin/liquor/products");
  redirect("/kifaruadmin/liquor/products?saved=1");
}

const TOGGLES = { is_active: true, in_stock: true, is_featured: true } as const;

export async function toggleLiquorProduct(id: string, field: keyof typeof TOGGLES, value: boolean) {
  await verifyAdmin();
  if (!(field in TOGGLES)) return;
  const supabase = await createClient();
  await supabase
    .from("liquor_products")
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/kifaruadmin/liquor/products");
}

// Past orders keep their item names and prices (order items are copies).
export async function deleteLiquorProduct(id: string) {
  await verifyAdmin();
  const supabase = await createClient();
  await supabase.from("liquor_products").delete().eq("id", id);
  revalidatePath("/kifaruadmin/liquor/products");
  redirect("/kifaruadmin/liquor/products");
}

// ── Categories ────────────────────────────────────────────────────────

const CategorySchema = z.object({
  name: z.string().trim().min(2, "Enter a name.").max(80),
  description: z.string().trim().max(300),
  parentId: z.union([z.literal(""), z.uuid()]),
  sortOrder: z.preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.number().int().min(0).max(9999).optional()),
});

export type LiquorCategoryFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message?: string; errors?: Partial<Record<keyof z.infer<typeof CategorySchema>, string[]>> };

export async function saveLiquorCategory(
  _prev: LiquorCategoryFormState,
  formData: FormData
): Promise<LiquorCategoryFormState> {
  await verifyAdmin();
  const validated = CategorySchema.safeParse({
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? "",
    parentId: (formData.get("parentId") ?? "").toString(),
    sortOrder: formData.get("sortOrder"),
  });
  if (!validated.success) return { status: "error", errors: z.flattenError(validated.error).fieldErrors };
  const v = validated.data;

  const id = formData.get("id");
  const isUpdate = typeof id === "string" && id.length > 0;
  if (isUpdate && v.parentId === id) {
    return { status: "error", errors: { parentId: ["A category can't be inside itself."] } };
  }
  const supabase = await createClient();

  const record = {
    name: v.name,
    description: v.description,
    parent_id: v.parentId || null,
    ...(v.sortOrder !== undefined ? { sort_order: v.sortOrder } : {}),
  };
  const { error } = isUpdate
    ? await supabase.from("liquor_categories").update(record).eq("id", id)
    : await supabase
        .from("liquor_categories")
        .insert({ ...record, slug: await uniqueSlug("liquor_categories", slugify(v.name)) });
  if (error) return { status: "error", message: "Could not save the category. Please try again." };

  revalidatePath("/kifaruadmin/liquor/categories");
  revalidatePath("/kifaruadmin/liquor/products");
  return { status: "success" };
}

// Products in it stay in the shop, just without this category; any
// sub-categories move up to the top level.
export async function deleteLiquorCategory(id: string) {
  await verifyAdmin();
  const supabase = await createClient();
  await supabase.from("liquor_categories").delete().eq("id", id);
  revalidatePath("/kifaruadmin/liquor/categories");
  revalidatePath("/kifaruadmin/liquor/products");
}
