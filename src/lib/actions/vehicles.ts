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
