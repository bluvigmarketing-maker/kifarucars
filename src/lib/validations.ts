import * as z from "zod";

export const EnquirySchema = z.object({
  firstName: z.string().trim().min(1, { error: "First name is required." }),
  lastName: z.string().trim().min(1, { error: "Last name is required." }),
  email: z.email({ error: "Enter a valid email address." }).trim(),
  phone: z.string().trim().min(7, { error: "Enter a valid phone number." }),
  hearAboutUs: z.string().trim().optional(),
  message: z.string().trim().optional(),
});

export type EnquiryFormState =
  | {
      status: "idle";
    }
  | {
      status: "error";
      errors: Partial<Record<keyof z.infer<typeof EnquirySchema>, string[]>>;
      message?: string;
    }
  | {
      status: "success";
    };

export const LoginSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }),
  password: z.string().min(1, { error: "Password is required." }),
});

export type LoginFormState = {
  status: "idle" | "error";
  message?: string;
};

// Comma-separated free text (e.g. "Sunroof, Reverse camera, Leather seats")
// parsed into a string array for the additional_features column.
const FeaturesListField = z
  .string()
  .trim()
  .optional()
  .transform((value) =>
    value
      ? value
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean)
      : []
  );

// Blank form fields arrive as "" from FormData — treat that as "not provided"
// rather than coercing to 0, since these fields are genuinely optional.
const OptionalMileageField = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.coerce.number().int().min(0).optional()
);

// A JSON-encoded array of URL strings (built client-side as gallery photos
// are uploaded), capped at 9 so cover image + gallery = 10 images total.
const GalleryUrlsField = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((v): v is string => typeof v === "string").slice(0, 9);
    } catch {
      return [];
    }
  });

export const VehicleSchema = z.object({
  name: z.string().trim().min(1, { error: "Name is required." }),
  make: z.string().trim().min(1, { error: "Make is required." }),
  year: z.coerce.number().int().min(1990).max(2100),
  transmission: z.enum(["Automatic", "Manual"]),
  seats: z.coerce.number().int().min(1).max(60),
  fuelType: z.string().trim().min(1, { error: "Fuel type is required." }),
  luggageCapacity: z.string().trim().min(1, { error: "Luggage capacity is required." }),
  imageUrl: z.string().trim().min(1, { error: "Image URL is required." }),
  isAvailable: z.coerce.boolean().optional(),
  mileage: OptionalMileageField,
  chassisNumber: z.string().trim().optional(),
  registrationNumber: z.string().trim().optional(),
  ownerName: z.string().trim().optional(),
  ownerPhone: z.string().trim().optional(),
  ownerEmail: z.string().trim().optional(),
  additionalFeatures: FeaturesListField,
  galleryUrls: GalleryUrlsField,
  videoUrl: z.string().trim().optional(),
  hoverSoundUrl: z.string().trim().optional(),
});

export type VehicleFormState = {
  status: "idle" | "error";
  errors?: Partial<Record<keyof z.infer<typeof VehicleSchema>, string[]>>;
  message?: string;
};

export const VehicleApplicationSchema = z.object({
  name: z.string().trim().min(1, { error: "Vehicle name is required." }),
  make: z.string().trim().min(1, { error: "Make is required." }),
  year: z.coerce.number().int().min(1990).max(2100),
  transmission: z.enum(["Automatic", "Manual"]),
  seats: z.coerce.number().int().min(1).max(60),
  fuelType: z.string().trim().min(1, { error: "Fuel type is required." }),
  luggageCapacity: z.string().trim().min(1, { error: "Luggage capacity is required." }),
  mileage: OptionalMileageField,
  chassisNumber: z.string().trim().optional(),
  registrationNumber: z.string().trim().optional(),
  additionalFeatures: FeaturesListField,
  logbookPath: z.string().trim().optional(),
  ownerName: z.string().trim().min(1, { error: "Your name is required." }),
  ownerPhone: z.string().trim().min(7, { error: "Enter a valid phone number." }),
  ownerEmail: z.email({ error: "Enter a valid email address." }).trim(),
});

export type VehicleApplicationFormState =
  | { status: "idle" }
  | {
      status: "error";
      errors: Partial<Record<keyof z.infer<typeof VehicleApplicationSchema>, string[]>>;
      message?: string;
    }
  | { status: "success" };

export const ReviewSchema = z.object({
  authorName: z.string().trim().min(1, { error: "Author name is required." }),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().min(1, { error: "Review body is required." }),
  daysAgoLabel: z.string().trim().optional(),
  isFeatured: z.coerce.boolean().optional(),
  vehicleId: z.string().trim().optional(),
});

export type ReviewFormState = {
  status: "idle" | "error";
  errors?: Partial<Record<keyof z.infer<typeof ReviewSchema>, string[]>>;
  message?: string;
};

export const RegisterClientSchema = z
  .object({
    fullName: z.string().trim().min(1, { error: "Client name is required." }),
    phone: z.string().trim().min(7, { error: "Enter a valid phone number." }),
    email: z.email({ error: "Enter a valid email address." }).trim().optional().or(z.literal("")),
    vehicleId: z.string().trim().min(1, { error: "Select a vehicle." }),
    startDate: z.string().trim().min(1, { error: "Start date is required." }),
    endDate: z.string().trim().min(1, { error: "End date is required." }),
    cost: z.coerce.number().min(0, { error: "Enter a valid cost." }),
    notes: z.string().trim().optional(),
  })
  .refine((v) => v.endDate >= v.startDate, {
    error: "End date must be on or after the start date.",
    path: ["endDate"],
  });

export type RegisterClientFormState =
  | { status: "idle" }
  | {
      status: "error";
      errors?: Partial<Record<keyof z.infer<typeof RegisterClientSchema>, string[]>>;
      message?: string;
    }
  | { status: "success"; portalUrl: string };

// Portal-side: submitted with the raw token as a hidden field, but the
// request_lease_extension RPC (see supabase/migrations/0006_client_portal.sql)
// is the real authority — this schema is just fast client-visible feedback.
export const ExtensionRequestSchema = z.object({
  token: z.string().trim().min(20, { error: "Invalid link." }),
  requestedEndDate: z.string().trim().min(1, { error: "Pick a new end date." }),
  reason: z.string().trim().optional(),
});

export type ExtensionRequestFormState =
  | { status: "idle" }
  | { status: "error"; message?: string }
  | { status: "success" };
