import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  BookingWithVehicle,
  Enquiry,
  ExtensionRequestWithLease,
  LeaseWithBalance,
  LeaseWithRelations,
  PaymentWithLease,
  Review,
  Vehicle,
  VehicleApplication,
  VehicleCategory,
  Extra,
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

export async function listAllCategories(): Promise<VehicleCategory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicle_categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  return (data ?? []) as VehicleCategory[];
}

export async function listAllExtras(): Promise<Extra[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("extras")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  return (data ?? []) as Extra[];
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

export async function listAllLeases(): Promise<LeaseWithBalance[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leases")
    .select(`${LEASE_RELATIONS_SELECT}, extension_requests(amount, status), payments(amount, status)`)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as LeaseWithBalance[];
}

export async function listAllPayments(): Promise<PaymentWithLease[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select(`*, lease:leases(${LEASE_RELATIONS_SELECT}), booking:bookings(*, vehicle:vehicles(id, name, make, year))`)
    // The payments table is shared with Kifaru Liquor; its own shop orders
    // are managed in the liquor admin, so only show car-hire payments here.
    .or("lease_id.not.is.null,booking_id.not.is.null")
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as PaymentWithLease[];
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

export async function listAllBookings(): Promise<BookingWithVehicle[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("*, vehicle:vehicles(id, name, make, year), payments(amount, status, mpesa_receipt)")
    .order("created_at", { ascending: false });
  const bookings = (data ?? []) as Omit<BookingWithVehicle, "extras" | "drinks">[];
  if (bookings.length === 0) return [];

  // Extras fetched separately so the bookings list still loads if this
  // query fails (e.g. migration 0013 not run yet).
  const { data: extras } = await supabase
    .from("booking_extras")
    .select("booking_id, name, unit_price, quantity")
    .in("booking_id", bookings.map((b) => b.id));
  const byBooking = new Map<string, BookingWithVehicle["extras"]>();
  for (const extra of extras ?? []) {
    const list = byBooking.get(extra.booking_id) ?? [];
    list.push({ name: extra.name, unit_price: Number(extra.unit_price), quantity: extra.quantity });
    byBooking.set(extra.booking_id, list);
  }
  // Kifaru Liquor drinks paid with each booking (empty if the liquor
  // migrations haven't been run).
  const { data: drinkOrders } = await supabase
    .from("liquor_orders")
    .select("booking_id, status, items:liquor_order_items(name, unit_price, quantity)")
    .in("booking_id", bookings.map((b) => b.id))
    .neq("status", "cancelled");
  const drinksByBooking = new Map<string, BookingWithVehicle["drinks"]>();
  for (const order of (drinkOrders ?? []) as {
    booking_id: string;
    items: { name: string; unit_price: number; quantity: number }[];
  }[]) {
    const list = drinksByBooking.get(order.booking_id) ?? [];
    for (const item of order.items) list.push({ ...item, unit_price: Number(item.unit_price) });
    drinksByBooking.set(order.booking_id, list);
  }

  return bookings.map((b) => ({ ...b, extras: byBooking.get(b.id) ?? [], drinks: drinksByBooking.get(b.id) ?? [] }));
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
