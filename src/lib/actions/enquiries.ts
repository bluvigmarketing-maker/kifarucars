"use server";

import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/admin/dal";
import { createClient } from "@/lib/supabase/server";
import type { EnquiryStatus } from "@/lib/types";

export async function updateEnquiryStatus(id: string, status: EnquiryStatus) {
  await verifyAdmin();
  const supabase = await createClient();
  await supabase.from("enquiries").update({ status }).eq("id", id);
  revalidatePath("/kifaruadmin/enquiries");
}

export async function deleteEnquiry(id: string) {
  await verifyAdmin();
  const supabase = await createClient();
  await supabase.from("enquiries").delete().eq("id", id);
  revalidatePath("/kifaruadmin/enquiries");
}
