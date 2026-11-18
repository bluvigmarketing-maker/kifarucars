import "server-only";
import { isSupabaseConfigured } from "./supabase/env";
import { createClient } from "./supabase/server";
import { PLACEHOLDER_CATEGORIES, PLACEHOLDER_REVIEWS, PLACEHOLDER_VEHICLES } from "./placeholder-data";
import type { PublicVehicle, Review, UnavailableRange, Vehicle, VehicleCategory } from "./types";

// Columns safe to send to the browser — excludes ownership/document data
// that's staff-only in the admin dashboard (see PublicVehicle in types.ts).
const PUBLIC_VEHICLE_COLUMNS =
  "id, name, make, year, transmission, seats, fuel_type, engine_capacity, luggage_capacity, mileage, additional_features, image_url, price, price_unit, price_custom_label, category_id, gallery_urls, video_url, hover_sound_url, is_available, sort_order, created_at";

// Strips staff-only fields before a Vehicle is sent to a client component —
// used for the placeholder fallback, which is otherwise shaped like the full
// admin `Vehicle` type.
function toPublicVehicle(vehicle: Vehicle): PublicVehicle {
  return {
    id: vehicle.id,
    name: vehicle.name,
    make: vehicle.make,
    year: vehicle.year,
    transmission: vehicle.transmission,
    seats: vehicle.seats,
    fuel_type: vehicle.fuel_type,
    engine_capacity: vehicle.engine_capacity,
    luggage_capacity: vehicle.luggage_capacity,
    mileage: vehicle.mileage,
    additional_features: vehicle.additional_features,
    image_url: vehicle.image_url,
    price: vehicle.price,
    price_unit: vehicle.price_unit,
    price_custom_label: vehicle.price_custom_label,
    category_id: vehicle.category_id,
    gallery_urls: vehicle.gallery_urls,
    video_url: vehicle.video_url,
    hover_sound_url: vehicle.hover_sound_url,
    is_available: vehicle.is_available,
    sort_order: vehicle.sort_order,
    created_at: vehicle.created_at,
  };
}

// Public vehicles plus the categories that group them (homepage filters,
// /pricing). When the placeholder fleet is shown, the placeholder
// categories come with it so every category_id resolves.
export async function getFleet(): Promise<{ vehicles: PublicVehicle[]; categories: VehicleCategory[] }> {
  const placeholder = {
    vehicles: PLACEHOLDER_VEHICLES.map(toPublicVehicle),
    categories: PLACEHOLDER_CATEGORIES,
  };
  if (!isSupabaseConfigured) return placeholder;

  const supabase = await createClient();
  const [vehiclesResult, categoriesResult] = await Promise.all([
    supabase
      .from("vehicles")
      .select(PUBLIC_VEHICLE_COLUMNS)
      .eq("is_available", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("vehicle_categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
  ]);

  const { data, error } = vehiclesResult;
  if (error || !data || data.length === 0) return placeholder;
  return {
    vehicles: data as PublicVehicle[],
    // Missing table (0011 not run yet) just means no grouping.
    categories: (categoriesResult.data ?? []) as VehicleCategory[],
  };
}

export async function getVehicleForDetail(id: string): Promise<PublicVehicle | null> {
  if (!isSupabaseConfigured) {
    const match = PLACEHOLDER_VEHICLES.find((v) => v.id === id);
    return match ? toPublicVehicle(match) : null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicles")
    .select(PUBLIC_VEHICLE_COLUMNS)
    .eq("id", id)
    .eq("is_available", true)
    .maybeSingle();

  return (data as PublicVehicle) ?? null;
}

export async function getFeaturedReviews(): Promise<Review[]> {
  if (!isSupabaseConfigured) return PLACEHOLDER_REVIEWS;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("is_featured", true)
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return PLACEHOLDER_REVIEWS;
  return data as Review[];
}

export async function getReviewsForVehicle(vehicleId: string): Promise<Review[]> {
  if (!isSupabaseConfigured) {
    // Demo fallback: placeholder reviews aren't tied to a specific vehicle,
    // so show the general placeholder reviews rather than nothing.
    return PLACEHOLDER_REVIEWS;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data as Review[];
}

// Dates the booking calendar on /fleet/[id] greys out. Dates only — the
// RPC never returns who booked (see 0008_pricing_bookings.sql).
export async function getUnavailableRanges(vehicleId: string): Promise<UnavailableRange[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_vehicle_unavailable_ranges", {
    p_vehicle_id: vehicleId,
  });

  if (error || !data) return [];
  return data as UnavailableRange[];
}
