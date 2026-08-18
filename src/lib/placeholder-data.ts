/**
 * Placeholder content shown until real data is added via the Supabase-backed
 * admin dashboard (/kifaruadmin) or the business supplies real copy. Search
 * this file's exports to find everything that still needs replacing.
 */
import type { Review, Vehicle } from "./types";

export const BUSINESS = {
  name: "Kifaru Car Hire",
  tagline: "Reliable Prado Car Hire & Leasing Across Kenya",
  yearsInBusiness: 15, // PLACEHOLDER
  vehicleCount: "20+", // PLACEHOLDER
  driverCount: "15", // PLACEHOLDER
  googleRating: 4.8, // PLACEHOLDER
  googleReviewCount: 120, // PLACEHOLDER
  phone: "+254 700 000 000", // PLACEHOLDER
  whatsapp: "254700000000", // PLACEHOLDER (no leading +, for wa.me links)
  email: "info@kifarucarhire.example", // PLACEHOLDER
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

export const PLACEHOLDER_VEHICLES: Vehicle[] = [
  {
    id: "ph-1",
    name: "Land Cruiser Prado",
    make: "Toyota",
    year: 2023,
    transmission: "Automatic",
    seats: 7,
    fuel_type: "Diesel",
    luggage_capacity: "3 Big, 2 Small",
    image_url: "/vehicles/placeholder-suv.svg",
    is_available: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    ...PLACEHOLDER_VEHICLE_STAFF_FIELDS,
  },
  {
    id: "ph-2",
    name: "Land Cruiser Prado",
    make: "Toyota",
    year: 2022,
    transmission: "Automatic",
    seats: 7,
    fuel_type: "Diesel",
    luggage_capacity: "3 Big, 2 Small",
    image_url: "/vehicles/placeholder-suv.svg",
    is_available: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
    ...PLACEHOLDER_VEHICLE_STAFF_FIELDS,
  },
  {
    id: "ph-3",
    name: "Land Cruiser Prado",
    make: "Toyota",
    year: 2021,
    transmission: "Manual",
    seats: 7,
    fuel_type: "Diesel",
    luggage_capacity: "3 Big, 2 Small",
    image_url: "/vehicles/placeholder-suv.svg",
    is_available: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
    ...PLACEHOLDER_VEHICLE_STAFF_FIELDS,
  },
  {
    id: "ph-4",
    name: "Land Cruiser Prado",
    make: "Toyota",
    year: 2020,
    transmission: "Automatic",
    seats: 5,
    fuel_type: "Petrol",
    luggage_capacity: "2 Big, 2 Small",
    image_url: "/vehicles/placeholder-suv.svg",
    is_available: true,
    sort_order: 4,
    created_at: new Date().toISOString(),
    ...PLACEHOLDER_VEHICLE_STAFF_FIELDS,
  },
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
      "We specialize exclusively in the Toyota Land Cruiser Prado — a rugged, comfortable SUV well-suited to Kenyan roads and long-distance travel. We maintain several Prado units across different model years so there's always one available for your dates.",
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
