"use server";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import {
  CorporateQuoteSchema,
  EnquirySchema,
  type CorporateQuoteFormState,
  type EnquiryFormState,
} from "@/lib/validations";

export async function submitEnquiry(
  _prevState: EnquiryFormState,
  formData: FormData
): Promise<EnquiryFormState> {
  const validated = EnquirySchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    hearAboutUs: formData.get("hearAboutUs"),
    message: formData.get("message"),
  });

  if (!validated.success) {
    return {
      status: "error",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  if (!isSupabaseConfigured) {
    return {
      status: "error",
      errors: {},
      message:
        "Enquiries aren't connected yet — set up Supabase to start receiving submissions (see README).",
    };
  }

  const { firstName, lastName, email, phone, hearAboutUs, message } =
    validated.data;

  const supabase = await createClient();
  const { error } = await supabase.from("enquiries").insert({
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    hear_about_us: hearAboutUs || null,
    message: message || null,
  });

  if (error) {
    return {
      status: "error",
      errors: {},
      message: "Something went wrong submitting your enquiry. Please try again.",
    };
  }

  return { status: "success" };
}

export async function submitCorporateQuote(
  _prevState: CorporateQuoteFormState,
  formData: FormData
): Promise<CorporateQuoteFormState> {
  const validated = CorporateQuoteSchema.safeParse({
    fullName: formData.get("fullName"),
    company: formData.get("company"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    vehicleCount: formData.get("vehicleCount"),
    leaseTerm: formData.get("leaseTerm"),
    message: formData.get("message"),
  });

  if (!validated.success) {
    return { status: "error", errors: validated.error.flatten().fieldErrors };
  }

  if (!isSupabaseConfigured) {
    return {
      status: "error",
      errors: {},
      message: "Quote requests aren't connected yet — set up Supabase to start receiving them (see README).",
    };
  }

  const { fullName, company, email, phone, vehicleCount, leaseTerm, message } = validated.data;
  const [firstName, ...rest] = fullName.split(/\s+/);
  const details = [
    vehicleCount ? `Vehicles needed: ${vehicleCount}` : null,
    leaseTerm ? `Lease term: ${leaseTerm}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const supabase = await createClient();
  const { error } = await supabase.from("enquiries").insert({
    first_name: firstName,
    last_name: rest.join(" "),
    email,
    phone,
    company,
    service: "corporate_leasing",
    message: [details, message].filter(Boolean).join("\n\n") || null,
  });

  if (error) {
    return {
      status: "error",
      errors: {},
      message: "Something went wrong sending your quote request. Please try again.",
    };
  }

  return { status: "success" };
}
