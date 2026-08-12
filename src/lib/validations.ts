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

export const VEHICLE_CATEGORY_VALUES = [
  "Saloon",
  "Crossover",
  "Mid-Size SUV",
  "Mini Van",
  "Large Size SUV",
] as const;

export const VehicleSchema = z.object({
  name: z.string().trim().min(1, { error: "Name is required." }),
  make: z.string().trim().min(1, { error: "Make is required." }),
  year: z.coerce.number().int().min(1990).max(2100),
  category: z.enum(VEHICLE_CATEGORY_VALUES, { error: "Choose a category." }),
  transmission: z.enum(["Automatic", "Manual"]),
  seats: z.coerce.number().int().min(1).max(60),
  fuelType: z.string().trim().min(1, { error: "Fuel type is required." }),
  luggageCapacity: z.string().trim().min(1, { error: "Luggage capacity is required." }),
  imageUrl: z.string().trim().min(1, { error: "Image URL is required." }),
  isAvailable: z.coerce.boolean().optional(),
});

export type VehicleFormState = {
  status: "idle" | "error";
  errors?: Partial<Record<keyof z.infer<typeof VehicleSchema>, string[]>>;
  message?: string;
};

export const ReviewSchema = z.object({
  authorName: z.string().trim().min(1, { error: "Author name is required." }),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().min(1, { error: "Review body is required." }),
  daysAgoLabel: z.string().trim().optional(),
  isFeatured: z.coerce.boolean().optional(),
});

export type ReviewFormState = {
  status: "idle" | "error";
  errors?: Partial<Record<keyof z.infer<typeof ReviewSchema>, string[]>>;
  message?: string;
};
