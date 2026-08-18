"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifyAdmin } from "@/lib/admin/dal";
import { createClient } from "@/lib/supabase/server";
import { VehicleSchema, type VehicleFormState } from "@/lib/validations";

export async function saveVehicle(
  _prevState: VehicleFormState,
  formData: FormData
): Promise<VehicleFormState> {
  await verifyAdmin();

  const validated = VehicleSchema.safeParse({
    name: formData.get("name"),
    make: formData.get("make"),
    year: formData.get("year"),
    transmission: formData.get("transmission"),
    seats: formData.get("seats"),
    fuelType: formData.get("fuelType"),
    luggageCapacity: formData.get("luggageCapacity"),
    imageUrl: formData.get("imageUrl"),
    isAvailable: formData.get("isAvailable") === "on",
    mileage: formData.get("mileage"),
    chassisNumber: formData.get("chassisNumber"),
    registrationNumber: formData.get("registrationNumber"),
    ownerName: formData.get("ownerName"),
    ownerPhone: formData.get("ownerPhone"),
    ownerEmail: formData.get("ownerEmail"),
    additionalFeatures: formData.get("additionalFeatures"),
    galleryUrls: formData.get("galleryUrls"),
    videoUrl: formData.get("videoUrl"),
    hoverSoundUrl: formData.get("hoverSoundUrl"),
  });

  if (!validated.success) {
    return {
      status: "error",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const id = formData.get("id");
  const supabase = await createClient();
  const record = {
    name: validated.data.name,
    make: validated.data.make,
    year: validated.data.year,
    transmission: validated.data.transmission,
    seats: validated.data.seats,
    fuel_type: validated.data.fuelType,
    luggage_capacity: validated.data.luggageCapacity,
    image_url: validated.data.imageUrl,
    is_available: validated.data.isAvailable ?? false,
    mileage: validated.data.mileage ?? null,
    chassis_number: validated.data.chassisNumber || null,
    registration_number: validated.data.registrationNumber || null,
    owner_name: validated.data.ownerName || null,
    owner_phone: validated.data.ownerPhone || null,
    owner_email: validated.data.ownerEmail || null,
    additional_features: validated.data.additionalFeatures,
    gallery_urls: validated.data.galleryUrls,
    video_url: validated.data.videoUrl || null,
    hover_sound_url: validated.data.hoverSoundUrl || null,
  };

  const { error } =
    typeof id === "string" && id.length > 0
      ? await supabase.from("vehicles").update(record).eq("id", id)
      : await supabase.from("vehicles").insert(record);

  if (error) {
    return { status: "error", message: "Could not save vehicle. Please try again." };
  }

  revalidatePath("/kifaruadmin/fleet");
  revalidatePath("/");
  if (typeof id === "string" && id.length > 0) revalidatePath(`/fleet/${id}`);
  redirect("/kifaruadmin/fleet");
}

export async function deleteVehicle(id: string) {
  await verifyAdmin();
  const supabase = await createClient();
  await supabase.from("vehicles").delete().eq("id", id);
  revalidatePath("/kifaruadmin/fleet");
  revalidatePath("/");
}

export async function toggleVehicleAvailability(id: string, nextValue: boolean) {
  await verifyAdmin();
  const supabase = await createClient();
  await supabase.from("vehicles").update({ is_available: nextValue }).eq("id", id);
  revalidatePath("/kifaruadmin/fleet");
  revalidatePath("/");
}
