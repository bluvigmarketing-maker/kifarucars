"use server";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { EnquirySchema, type EnquiryFormState } from "@/lib/validations";

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
