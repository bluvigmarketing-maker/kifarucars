"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifyAdmin } from "@/lib/admin/dal";
import { createClient } from "@/lib/supabase/server";
import { ReviewSchema, type ReviewFormState } from "@/lib/validations";

export async function saveReview(
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  await verifyAdmin();

  const validated = ReviewSchema.safeParse({
    authorName: formData.get("authorName"),
    rating: formData.get("rating"),
    body: formData.get("body"),
    daysAgoLabel: formData.get("daysAgoLabel"),
    isFeatured: formData.get("isFeatured") === "on",
    vehicleId: formData.get("vehicleId"),
  });

  if (!validated.success) {
    return { status: "error", errors: validated.error.flatten().fieldErrors };
  }

  const id = formData.get("id");
  const supabase = await createClient();
  const record = {
    author_name: validated.data.authorName,
    rating: validated.data.rating,
    body: validated.data.body,
    days_ago_label: validated.data.daysAgoLabel ?? "",
    is_featured: validated.data.isFeatured ?? false,
    vehicle_id: validated.data.vehicleId || null,
  };

  const { error } =
    typeof id === "string" && id.length > 0
      ? await supabase.from("reviews").update(record).eq("id", id)
      : await supabase.from("reviews").insert(record);

  if (error) {
    return { status: "error", message: "Could not save review. Please try again." };
  }

  revalidatePath("/kifaruadmin/reviews");
  revalidatePath("/");
  redirect("/kifaruadmin/reviews");
}

export async function deleteReview(id: string) {
  await verifyAdmin();
  const supabase = await createClient();
  await supabase.from("reviews").delete().eq("id", id);
  revalidatePath("/kifaruadmin/reviews");
  revalidatePath("/");
}

export async function toggleReviewFeatured(id: string, nextValue: boolean) {
  await verifyAdmin();
  const supabase = await createClient();
  await supabase.from("reviews").update({ is_featured: nextValue }).eq("id", id);
  revalidatePath("/kifaruadmin/reviews");
  revalidatePath("/");
}
