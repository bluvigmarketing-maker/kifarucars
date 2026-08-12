"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { LoginSchema, type LoginFormState } from "@/lib/validations";

export async function login(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  if (!isSupabaseConfigured) {
    return { status: "error", message: "Supabase is not configured yet." };
  }

  const validated = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { status: "error", message: "Enter a valid email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(validated.data);

  if (error) {
    return { status: "error", message: "Incorrect email or password." };
  }

  redirect("/kifaruadmin");
}

export async function logout() {
  if (!isSupabaseConfigured) {
    redirect("/kifaruadmin/login");
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/kifaruadmin/login");
}
