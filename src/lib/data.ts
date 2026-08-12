import "server-only";
import { isSupabaseConfigured } from "./supabase/env";
import { createClient } from "./supabase/server";
import { PLACEHOLDER_REVIEWS, PLACEHOLDER_VEHICLES } from "./placeholder-data";
import type { Review, Vehicle } from "./types";

export async function getVehicles(): Promise<Vehicle[]> {
  if (!isSupabaseConfigured) return PLACEHOLDER_VEHICLES;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("is_available", true)
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return PLACEHOLDER_VEHICLES;
  return data as Vehicle[];
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
