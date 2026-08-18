"use server";

import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/admin/dal";
import { createClient } from "@/lib/supabase/server";
import { getApplicationById } from "@/lib/admin/data";

export async function approveApplication(id: string) {
  await verifyAdmin();
  const application = await getApplicationById(id);
  if (!application || application.status !== "pending") return;

  const supabase = await createClient();

  const { error: insertError } = await supabase.from("vehicles").insert({
    name: application.name,
    make: application.make,
    year: application.year,
    transmission: application.transmission,
    seats: application.seats,
    fuel_type: application.fuel_type,
    luggage_capacity: application.luggage_capacity,
    image_url: "/vehicles/placeholder-suv.svg",
    is_available: false,
    mileage: application.mileage,
    chassis_number: application.chassis_number,
    registration_number: application.registration_number,
    additional_features: application.additional_features,
    logbook_path: application.logbook_path,
    owner_name: application.owner_name,
    owner_phone: application.owner_phone,
    owner_email: application.owner_email,
  });

  if (insertError) return;

  await supabase
    .from("vehicle_applications")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/kifaruadmin/applications");
  revalidatePath("/kifaruadmin/fleet");
}

export async function rejectApplication(id: string, notes?: string) {
  await verifyAdmin();
  const supabase = await createClient();
  await supabase
    .from("vehicle_applications")
    .update({
      status: "rejected",
      admin_notes: notes || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath("/kifaruadmin/applications");
}
