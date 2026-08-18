export type Vehicle = {
  id: string;
  name: string;
  make: string;
  year: number;
  transmission: "Automatic" | "Manual";
  seats: number;
  fuel_type: string;
  luggage_capacity: string;
  image_url: string;
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
  year: number;
  transmission: "Automatic" | "Manual";
  seats: number;
  fuel_type: string;
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

export type Enquiry = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  hear_about_us: string | null;
  message: string | null;
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
