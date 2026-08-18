"use server";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { VehicleApplicationSchema, type VehicleApplicationFormState } from "@/lib/validations";

export async function submitVehicleApplication(
  _prevState: VehicleApplicationFormState,
  formData: FormData
): Promise<VehicleApplicationFormState> {
  const validated = VehicleApplicationSchema.safeParse({
    name: formData.get("name"),
    make: formData.get("make"),
    year: formData.get("year"),
    transmission: formData.get("transmission"),
    seats: formData.get("seats"),
    fuelType: formData.get("fuelType"),
    luggageCapacity: formData.get("luggageCapacity"),
    mileage: formData.get("mileage"),
    chassisNumber: formData.get("chassisNumber"),
    registrationNumber: formData.get("registrationNumber"),
    additionalFeatures: formData.get("additionalFeatures"),
    logbookPath: formData.get("logbookPath"),
    ownerName: formData.get("ownerName"),
    ownerPhone: formData.get("ownerPhone"),
    ownerEmail: formData.get("ownerEmail"),
  });

  if (!validated.success) {
    return { status: "error", errors: validated.error.flatten().fieldErrors };
  }

  if (!isSupabaseConfigured) {
    return {
      status: "error",
      errors: {},
      message:
        "Vehicle applications aren't connected yet — set up Supabase to start receiving submissions (see README).",
    };
  }

  const { logbookPath, ...rest } = validated.data;
  const supabase = await createClient();
  const { error } = await supabase.from("vehicle_applications").insert({
    name: rest.name,
    make: rest.make,
    year: rest.year,
    transmission: rest.transmission,
    seats: rest.seats,
    fuel_type: rest.fuelType,
    luggage_capacity: rest.luggageCapacity,
    mileage: rest.mileage ?? null,
    chassis_number: rest.chassisNumber || null,
    registration_number: rest.registrationNumber || null,
    additional_features: rest.additionalFeatures,
    logbook_path: logbookPath || null,
    owner_name: rest.ownerName,
    owner_phone: rest.ownerPhone,
    owner_email: rest.ownerEmail,
  });

  if (error) {
    return {
      status: "error",
      errors: {},
      message: "Something went wrong submitting your application. Please try again.",
    };
  }

  return { status: "success" };
}
