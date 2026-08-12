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
};

export type AdminProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "staff";
};
