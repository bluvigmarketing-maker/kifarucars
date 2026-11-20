"use server";

import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/admin/dal";
import { createClient } from "@/lib/supabase/server";
import { ExtraSchema, type ExtraFormState } from "@/lib/validations";

// The menu shows on every vehicle's booking panel.
function revalidateExtrasPages() {
  revalidatePath("/kifaruadmin/extras");
  revalidatePath("/fleet/[id]", "page");
}

// Creates an extra, or updates one when the form carries an `id`.
export async function saveExtra(_prevState: ExtraFormState, formData: FormData): Promise<ExtraFormState> {
  await verifyAdmin();

  const validated = ExtraSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? undefined,
    price: formData.get("price"),
    imageUrl: formData.get("imageUrl") ?? undefined,
    isActive: formData.get("isActive") === "on",
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
    // New items go to the end unless an order was given.
    const { data } = await supabase
      .from("extras")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    sortOrder = (data?.sort_order ?? 0) + 1;
  }

  const record = {
    name: validated.data.name,
    description: validated.data.description,
    price: validated.data.price,
    image_url: validated.data.imageUrl || null,
    is_active: validated.data.isActive ?? false,
    ...(sortOrder !== undefined ? { sort_order: sortOrder } : {}),
  };

  const { error } = isUpdate
    ? await supabase.from("extras").update(record).eq("id", id)
    : await supabase.from("extras").insert(record);

  if (error) return { status: "error", message: "Could not save this extra. Please try again." };

  revalidateExtrasPages();
  return { status: "success" };
}

export async function toggleExtraActive(id: string, nextValue: boolean) {
  await verifyAdmin();
  const supabase = await createClient();
  await supabase.from("extras").update({ is_active: nextValue }).eq("id", id);
  revalidateExtrasPages();
}

// Bookings that already include this extra keep their copy of its name
// and price (booking_extras.extra_id is set to null).
export async function deleteExtra(id: string) {
  await verifyAdmin();
  const supabase = await createClient();
  await supabase.from("extras").delete().eq("id", id);
  revalidateExtrasPages();
}
