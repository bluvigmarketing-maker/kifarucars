import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { AdminProfile } from "@/lib/types";

/**
 * Verifies the current request has a signed-in Supabase user AND a matching
 * row in `profiles` (the actual authorization gate for /kifaruadmin).
 * Redirects to the login page otherwise. Cached per-request so it's cheap
 * to call from multiple layouts/pages/actions.
 */
export const verifyAdmin = cache(async (): Promise<AdminProfile> => {
  if (!isSupabaseConfigured) {
    redirect("/kifaruadmin/login?error=supabase-not-configured");
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/kifaruadmin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.auth.signOut();
    redirect("/kifaruadmin/login?error=not-authorized");
  }

  return profile as AdminProfile;
});
