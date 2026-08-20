import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  Enquiry,
  ExtensionRequestWithLease,
  LeaseWithRelations,
  Review,
  Vehicle,
  VehicleApplication,
} from "@/lib/types";

const LEASE_RELATIONS_SELECT = "*, client:clients(*), vehicle:vehicles(id, name, make, year, image_url)";

export async function listAllVehicles(): Promise<Vehicle[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicles")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data ?? []) as Vehicle[];
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("vehicles").select("*").eq("id", id).maybeSingle();
  return (data as Vehicle) ?? null;
}

export async function listAllEnquiries(): Promise<Enquiry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as Enquiry[];
}

export async function listAllReviews(): Promise<Review[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data ?? []) as Review[];
}

export async function getReviewById(id: string): Promise<Review | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("reviews").select("*").eq("id", id).maybeSingle();
  return (data as Review) ?? null;
}

export async function listAllApplications(): Promise<VehicleApplication[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicle_applications")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as VehicleApplication[];
}

export async function getApplicationById(id: string): Promise<VehicleApplication | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicle_applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as VehicleApplication) ?? null;
}

export async function listAllLeases(): Promise<LeaseWithRelations[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leases")
    .select(LEASE_RELATIONS_SELECT)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as LeaseWithRelations[];
}

export async function getLeaseById(id: string): Promise<LeaseWithRelations | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leases")
    .select(LEASE_RELATIONS_SELECT)
    .eq("id", id)
    .maybeSingle();
  return (data as unknown as LeaseWithRelations) ?? null;
}

export async function listAllExtensionRequests(): Promise<ExtensionRequestWithLease[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("extension_requests")
    .select(`*, lease:leases(${LEASE_RELATIONS_SELECT})`)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as ExtensionRequestWithLease[];
}

export async function getExtensionRequestById(id: string): Promise<ExtensionRequestWithLease | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("extension_requests")
    .select(`*, lease:leases(${LEASE_RELATIONS_SELECT})`)
    .eq("id", id)
    .maybeSingle();
  return (data as unknown as ExtensionRequestWithLease) ?? null;
}

export async function getDashboardStats() {
  const [vehicles, enquiries, reviews, applications, leases, extensionRequests] = await Promise.all([
    listAllVehicles(),
    listAllEnquiries(),
    listAllReviews(),
    listAllApplications(),
    listAllLeases(),
    listAllExtensionRequests(),
  ]);

  return {
    vehicleCount: vehicles.length,
    availableVehicleCount: vehicles.filter((v) => v.is_available).length,
    newEnquiryCount: enquiries.filter((e) => e.status === "new").length,
    totalEnquiryCount: enquiries.length,
    reviewCount: reviews.length,
    pendingApplicationCount: applications.filter((a) => a.status === "pending").length,
    totalApplicationCount: applications.length,
    activeLeaseCount: leases.filter((l) => l.status === "active").length,
    totalLeaseCount: leases.length,
    pendingExtensionRequestCount: extensionRequests.filter((r) => r.status === "pending").length,
  };
}
