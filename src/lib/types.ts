export type PriceUnit = "day" | "month" | "custom";

export type Vehicle = {
  id: string;
  // Every descriptive field is optional when adding a vehicle — blank text
  // is stored as "", blank numbers as null. Use vehicleTitle() to display.
  name: string;
  make: string;
  year: number | null;
  transmission: "Automatic" | "Manual";
  seats: number | null;
  fuel_type: string;
  engine_capacity: string;
  // No longer collected or shown (engine capacity replaced it); kept for old rows.
  luggage_capacity: string;
  image_url: string;
  // What the vehicle is charged at — see formatPrice() in lib/vehicle-display.ts.
  price: number | null;
  price_unit: PriceUnit | null;
  price_custom_label: string | null;
  is_available: boolean;
  sort_order: number;
  created_at: string;
  // Staff-only detail, collected via car-owner applications or entered
  // directly by admins — never selected on the public homepage query.
  mileage: number | null;
  chassis_number: string | null;
  registration_number: string | null;
  owner_name: string | null;
  owner_phone: string | null;
  owner_email: string | null;
  logbook_path: string | null;
  additional_features: string[];
  // Public media — safe to expose on the fleet slider / vehicle detail page.
  gallery_urls: string[];
  video_url: string | null;
  hover_sound_url: string | null;
};

// Fields safe to send to the browser on public pages — excludes ownership
// and document data that's staff-only in the admin dashboard (mileage is
// kept, since it's normal to show on a vehicle listing).
export type PublicVehicle = Omit<
  Vehicle,
  "chassis_number" | "registration_number" | "owner_name" | "owner_phone" | "owner_email" | "logbook_path"
>;

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type VehicleApplication = {
  id: string;
  name: string;
  make: string;
  year: number | null;
  transmission: "Automatic" | "Manual";
  seats: number | null;
  fuel_type: string;
  engine_capacity: string;
  luggage_capacity: string;
  mileage: number | null;
  chassis_number: string | null;
  registration_number: string | null;
  additional_features: string[];
  logbook_path: string | null;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  status: ApplicationStatus;
  admin_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type EnquiryStatus = "new" | "contacted" | "closed";

// Which form an enquiry came from — null is the general contact form.
export type EnquiryService = "corporate_leasing";

export type Enquiry = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  hear_about_us: string | null;
  message: string | null;
  service: EnquiryService | null;
  company: string | null;
  status: EnquiryStatus;
  created_at: string;
};

export type Review = {
  id: string;
  author_name: string;
  rating: number;
  body: string;
  days_ago_label: string;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  vehicle_id: string | null;
};

export type AdminProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "staff";
};

export type Client = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  created_at: string;
};

export type LeaseStatus = "active" | "ended";

export type Lease = {
  id: string;
  client_id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  cost: number;
  status: LeaseStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  // portal_token_hash intentionally omitted — write-only from app code
  // (set on registration, overwritten on regenerate), never read back as a
  // value; only ever compared inside the SQL functions in
  // supabase/migrations/0006_client_portal.sql.
};

export type LeaseWithRelations = Lease & {
  client: Client;
  vehicle: Pick<Vehicle, "id" | "name" | "make" | "year" | "image_url">;
};

export type ExtensionRequestStatus = "pending" | "approved" | "declined";

export type ExtensionRequest = {
  id: string;
  lease_id: string;
  requested_end_date: string;
  reason: string | null;
  status: ExtensionRequestStatus;
  // Charge for the extra days, set by the admin on approval.
  amount: number | null;
  admin_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type ExtensionRequestWithLease = ExtensionRequest & { lease: LeaseWithRelations };

export type BookingStatus = "pending" | "confirmed" | "declined" | "cancelled";

// A date-range request from the calendar on /fleet/[id].
export type Booking = {
  id: string;
  vehicle_id: string;
  full_name: string;
  phone: string;
  email: string | null;
  start_date: string;
  end_date: string;
  // Price breakdown when booked — see quoteBooking() in lib/vehicle-display.ts.
  // estimated_total is the amount due, after the discount.
  subtotal: number | null;
  discount: number;
  estimated_total: number | null;
  notes: string | null;
  status: BookingStatus;
  created_at: string;
};

export type BookingWithVehicle = Booking & {
  vehicle: Pick<Vehicle, "id" | "name" | "make" | "year">;
  payments: Pick<Payment, "amount" | "status" | "mpesa_receipt">[];
};

// A blocked date range on the public calendar (inclusive, YYYY-MM-DD) —
// dates only, from the get_vehicle_unavailable_ranges RPC.
export type UnavailableRange = { start_date: string; end_date: string };

export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled";

// One M-Pesa STK Push attempt (till 8999944) — against either a lease
// balance (client portal) or a booking (calendar on /fleet/[id]).
export type Payment = {
  id: string;
  lease_id: string | null;
  booking_id: string | null;
  amount: number;
  phone: string;
  status: PaymentStatus;
  merchant_request_id: string | null;
  checkout_request_id: string | null;
  mpesa_receipt: string | null;
  result_code: number | null;
  result_desc: string | null;
  paid_at: string | null;
  invoice_sent_at: string | null;
  created_at: string;
};

export type PaymentWithLease = Payment & {
  lease: LeaseWithRelations | null;
  booking: Omit<BookingWithVehicle, "payments"> | null;
};

// Lease Records list: a lease plus just enough of its extensions/payments
// to compute total due and balance.
export type LeaseWithBalance = LeaseWithRelations & {
  extension_requests: Pick<ExtensionRequest, "amount" | "status">[];
  payments: Pick<Payment, "amount" | "status">[];
};

// What /portal/[token] receives via the get_portal_view RPC — never a raw
// table select. Excludes client phone/email, admin_notes, and the token
// hash: the portal only ever shows lease facts back to whoever holds the link.
export type ClientPortalView = {
  leaseId: string;
  clientFirstName: string;
  vehicleName: string;
  vehicleMake: string;
  vehicleYear: number | null;
  vehicleImageUrl: string;
  startDate: string;
  endDate: string;
  cost: number;
  status: LeaseStatus;
  hasPendingExtensionRequest: boolean;
  extensionCharges: number;
  amountPaid: number;
};
