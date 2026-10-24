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

// /corporate-leasing — the only place the site asks for a quote. Saved as
// an enquiry with service = 'corporate_leasing'.
export const CorporateQuoteSchema = z.object({
  fullName: z.string().trim().min(1, { error: "Your name is required." }),
  company: z.string().trim().min(1, { error: "Company name is required." }),
  email: z.email({ error: "Enter a valid email address." }).trim(),
  phone: z.string().trim().min(7, { error: "Enter a valid phone number." }),
  vehicleCount: z.string().trim().optional(),
  leaseTerm: z.string().trim().optional(),
  message: z.string().trim().optional(),
});

export type CorporateQuoteFormState =
  | { status: "idle" }
  | {
      status: "error";
      errors: Partial<Record<keyof z.infer<typeof CorporateQuoteSchema>, string[]>>;
      message?: string;
    }
  | { status: "success" };

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
const blankToUndefined = (value: unknown) =>
  value === "" || value === null || value === undefined ? undefined : value;

const OptionalMileageField = z.preprocess(blankToUndefined, z.coerce.number().int().min(0).optional());

const OptionalYearField = z.preprocess(
  blankToUndefined,
  z.coerce.number().int().min(1950, { error: "Enter a valid year." }).max(2100, { error: "Enter a valid year." }).optional()
);

const OptionalSeatsField = z.preprocess(
  blankToUndefined,
  z.coerce.number().int().min(1, { error: "Enter a valid number of seats." }).max(60).optional()
);

const OptionalPriceField = z.preprocess(
  blankToUndefined,
  z.coerce.number().min(0, { error: "Enter a valid price." }).optional()
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

// Every vehicle detail is optional — staff can add a car with whatever
// they know and fill the rest in later.
export const VehicleSchema = z.object({
  name: z.string().trim().optional().default(""),
  make: z.string().trim().optional().default(""),
  year: OptionalYearField,
  transmission: z.enum(["Automatic", "Manual"]).catch("Automatic"),
  seats: OptionalSeatsField,
  fuelType: z.string().trim().optional().default(""),
  engineCapacity: z.string().trim().optional().default(""),
  imageUrl: z.string().trim().optional(),
  price: OptionalPriceField,
  priceUnit: z.preprocess(blankToUndefined, z.enum(["day", "month", "custom"]).optional()),
  priceCustomLabel: z.string().trim().optional(),
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

// Vehicle details are all optional; only the owner's contact details are
// required, so staff can follow up.
export const VehicleApplicationSchema = z.object({
  name: z.string().trim().optional().default(""),
  make: z.string().trim().optional().default(""),
  year: OptionalYearField,
  transmission: z.enum(["Automatic", "Manual"]).catch("Automatic"),
  seats: OptionalSeatsField,
  fuelType: z.string().trim().optional().default(""),
  engineCapacity: z.string().trim().optional().default(""),
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

// Public calendar booking request from /fleet/[id]. Overlap with already
// booked dates is re-checked server-side in src/lib/actions/bookings.ts.
export const BookingSchema = z
  .object({
    vehicleId: z.string().trim().min(1, { error: "Missing vehicle." }),
    startDate: z.iso.date({ error: "Pick your start date." }),
    endDate: z.iso.date({ error: "Pick your end date." }),
    fullName: z.string().trim().min(1, { error: "Your name is required." }),
    phone: z.string().trim().min(7, { error: "Enter a valid phone number." }),
    // Required: the PDF invoice is emailed here once they pay.
    email: z.email({ error: "Enter a valid email address — your invoice is sent here." }).trim(),
    notes: z.string().trim().optional(),
  })
  .refine((v) => v.endDate >= v.startDate, {
    error: "End date must be on or after the start date.",
    path: ["endDate"],
  });

export type BookingFormState =
  | { status: "idle" }
  | {
      status: "error";
      errors?: Partial<Record<keyof z.infer<typeof BookingSchema>, string[]>>;
      message?: string;
      // Set when the booking was saved but the M-Pesa prompt failed, so the
      // panel can retry payment rather than create a second booking.
      bookingId?: string;
    }
  // M-Pesa prompt sent; the panel polls getBookingPaymentStatus.
  | { status: "sent"; bookingId: string; paymentId: string; amount: number };

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

// Portal-side M-Pesa payment. Whole shillings only — M-Pesa doesn't take
// cents. The upper bound against the actual balance is checked server-side
// in src/lib/actions/payments.ts.
export const PaymentSchema = z.object({
  token: z.string().trim().min(20, { error: "Invalid link." }),
  phone: z.string().trim().min(9, { error: "Enter your M-Pesa phone number." }),
  amount: z.coerce.number().int({ error: "Enter a whole amount in KES." }).min(1, { error: "Enter an amount." }),
});

export type PaymentFormState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "sent"; paymentId: string };
