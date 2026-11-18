"use server";

import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/admin/dal";
import { createClient } from "@/lib/supabase/server";
import { CategorySchema, type CategoryFormState } from "@/lib/validations";

// Everything that groups or filters vehicles by category.
function revalidateCategoryPages() {
  revalidatePath("/kifaruadmin/categories");
  revalidatePath("/kifaruadmin/fleet");
  revalidatePath("/");
  revalidatePath("/pricing");
}

// Creates a category, or updates one when the form carries an `id`.
export async function saveCategory(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  await verifyAdmin();

  const validated = CategorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? undefined,
    sortOrder: formData.get("sortOrder"),
  });

  if (!validated.success) {
    return { status: "error", errors: validated.error.flatten().fieldErrors };
  }

  const id = formData.get("id");
  const isUpdate = typeof id === "string" && id.length > 0;
  const supabase = await createClient();

  let sortOrder = validated.data.sortOrder;
  if (sortOrder === undefined && !isUpdate) {
    // New categories go to the end unless an order was given.
    const { data } = await supabase
      .from("vehicle_categories")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    sortOrder = (data?.sort_order ?? 0) + 1;
  }

  const record = {
    name: validated.data.name,
    description: validated.data.description,
    ...(sortOrder !== undefined ? { sort_order: sortOrder } : {}),
  };

  const { error } = isUpdate
    ? await supabase.from("vehicle_categories").update(record).eq("id", id)
    : await supabase.from("vehicle_categories").insert(record);

  if (error) {
    // 23505 = unique_violation on the name column.
    return {
      status: "error",
      message:
        error.code === "23505"
          ? `A category called "${validated.data.name}" already exists.`
          : "Could not save category. Please try again.",
    };
  }

  revalidateCategoryPages();
  return { status: "success" };
}

// Vehicles in the category become uncategorised (FK is on delete set null).
export async function deleteCategory(id: string) {
  await verifyAdmin();
  const supabase = await createClient();
  await supabase.from("vehicle_categories").delete().eq("id", id);
  revalidateCategoryPages();
}
