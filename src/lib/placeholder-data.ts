/**
 * Placeholder content shown until real data is added via the Supabase-backed
 * admin dashboard (/kifaruadmin) or the business supplies real copy. Search
 * this file's exports to find everything that still needs replacing.
 */
import type { Review, Vehicle, VehicleCategory } from "./types";

export const BUSINESS = {
  name: "Kifaru Car Hire",
  tagline: "Reliable Prado Car Hire & Leasing Across Kenya",
  yearsInBusiness: 15, // PLACEHOLDER
  vehicleCount: "20+", // PLACEHOLDER
  driverCount: "15", // PLACEHOLDER
  googleRating: 4.8, // PLACEHOLDER
  googleReviewCount: 120, // PLACEHOLDER
  phone: "+254 721 478316",
  whatsapp: "254721478316", // no leading +, for wa.me links
  // Call-to-action number (Nick, sales) — used on the public "call us" buttons.
  salesPhone: "+254 721 478316",
  email: "info@kifaru.ke",
  locations: ["Nairobi", "Kisumu", "Mombasa", "Nanyuki", "Nakuru"],
};

const PLACEHOLDER_VEHICLE_STAFF_FIELDS: Pick<
  Vehicle,
  | "mileage"
  | "chassis_number"
  | "registration_number"
  | "owner_name"
  | "owner_phone"
  | "owner_email"
  | "logbook_path"
  | "additional_features"
  | "gallery_urls"
  | "video_url"
  | "hover_sound_url"
> = {
  mileage: null,
  chassis_number: null,
  registration_number: null,
  owner_name: null,
  owner_phone: null,
  owner_email: null,
  logbook_path: null,
  additional_features: [],
  gallery_urls: [],
  video_url: null,
  hover_sound_url: null,
};

// Mirrors supabase/migrations/0011_vehicle_categories.sql.
export const PLACEHOLDER_CATEGORIES: VehicleCategory[] = [
  { id: "cat-luxury", name: "Luxury SUV", description: "Top-of-the-range comfort for VIP and executive travel.", sort_order: 1, created_at: new Date().toISOString() },
  { id: "cat-prado", name: "Land Cruiser Prado", description: "Our signature Prado fleet — rugged, comfortable, built for Kenyan roads.", sort_order: 2, created_at: new Date().toISOString() },
  { id: "cat-midsize", name: "Mid-Size SUV", description: "Capable seven-seaters for families and upcountry trips.", sort_order: 3, created_at: new Date().toISOString() },
  { id: "cat-crossover", name: "Crossover", description: "Economical, easy-to-drive SUVs for town and highway.", sort_order: 4, created_at: new Date().toISOString() },
];

// The rate card ("Kifaru_Car_Hire Rates.pdf") — mirrors
// supabase/migrations/0012_seed_rate_card_fleet.sql. Daily rates and
// photos are real; other specs are left blank until staff fill them in.
function rateCardVehicle(
  id: string,
  make: string,
  name: string,
  fuelType: string,
  price: number,
  image: string,
  categoryId: string,
  sortOrder: number
): Vehicle {
  return {
    id,
    name,
    make,
    year: null,
    transmission: "Automatic",
    seats: null,
    fuel_type: fuelType,
    engine_capacity: "",
    luggage_capacity: "",
    image_url: `/vehicles/${image}.jpg`,
    price,
    price_unit: "day",
    price_custom_label: null,
    category_id: categoryId,
    is_available: true,
    sort_order: sortOrder,
    created_at: new Date().toISOString(),
    ...PLACEHOLDER_VEHICLE_STAFF_FIELDS,
  };
}

export const PLACEHOLDER_VEHICLES: Vehicle[] = [
  {
    ...rateCardVehicle("ph-1", "Lexus", "LX 570", "Petrol", 22500, "lexus-lx-570", "cat-luxury", 1),
    year: 2021,
    seats: 8,
    engine_capacity: "5.7L V8",
    additional_features: ["Full-time 4WD", "Leather seats", "Third-row seating"],
  },
  rateCardVehicle("ph-2", "Toyota", "Prado VXL (Diesel)", "Diesel", 15000, "toyota-prado-vxl-diesel", "cat-prado", 2),
  rateCardVehicle("ph-3", "Toyota", "Prado VXL (Petrol)", "Petrol", 14000, "toyota-prado-vxl-petrol", "cat-prado", 3),
  rateCardVehicle("ph-4", "Toyota", "Land Cruiser Prado TX", "", 13000, "toyota-prado-tx", "cat-prado", 4),
  rateCardVehicle("ph-5", "Toyota", "Fortuner", "", 13000, "toyota-fortuner", "cat-midsize", 5),
  rateCardVehicle("ph-6", "Mazda", "CX-5", "", 8500, "mazda-cx-5", "cat-crossover", 6),
];

export const PLACEHOLDER_REVIEWS: Review[] = [
  {
    id: "phr-1",
    author_name: "Jane W.", // PLACEHOLDER
    rating: 5,
    body: "Excellent service and very well-maintained vehicles. The driver was professional and on time.", // PLACEHOLDER
    days_ago_label: "2 weeks ago",
    is_featured: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    vehicle_id: null,
  },
  {
    id: "phr-2",
    author_name: "David K.", // PLACEHOLDER
    rating: 5,
    body: "Kifaru has been our go-to for corporate car hire for over a year now. Reliable every time.", // PLACEHOLDER
    days_ago_label: "1 month ago",
    is_featured: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
    vehicle_id: null,
  },
  {
    id: "phr-3",
    author_name: "Amina H.", // PLACEHOLDER
    rating: 4,
    body: "Great fleet selection and friendly staff. Booking process was smooth from start to finish.", // PLACEHOLDER
    days_ago_label: "1 month ago",
    is_featured: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
    vehicle_id: null,
  },
];

export const FAQS = [
  {
    question: "What types of vehicles do you offer?",
    answer:
      "Our fleet is built around the Toyota Land Cruiser Prado (VXL diesel, VXL petrol and TX), alongside the Lexus LX 570, Toyota Fortuner and Mazda CX-5. See our pricing page for daily rates on every vehicle.",
  },
  {
    question: "Do you own and maintain your fleet?",
    answer:
      "Yes, we own and maintain our entire fleet in-house to ensure reliability, safety and consistently high service standards.",
  },
  {
    question: "Do you offer brand new vehicles on long-term leasing?",
    answer:
      "Yes, our long-term leasing plans can be tailored to include brand new vehicles depending on availability and lead time.",
  },
  {
    question: "Do you offer chauffeur services?",
    answer:
      "Yes, all our vehicles can be booked with an experienced, professional chauffeur, or as a self-drive rental.",
  },
  {
    question: "What durations do you offer for car hire?",
    answer:
      "We offer short-term rentals, long-term leases, and fully managed fleet services tailored to corporate and expat needs.",
  },
  {
    question: "Do you provide roadside assistance?",
    answer:
      "Yes, roadside assistance is available across all our service locations for the duration of your hire or lease.",
  },
];
