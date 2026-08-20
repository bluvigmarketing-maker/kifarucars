"use server";

import { randomBytes, createHash } from "crypto";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/admin/dal";
import { createClient } from "@/lib/supabase/server";
import { RegisterClientSchema, type RegisterClientFormState } from "@/lib/validations";

function mintPortalToken() {
  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, tokenHash };
}

export async function registerClient(
  _prevState: RegisterClientFormState,
  formData: FormData
): Promise<RegisterClientFormState> {
  await verifyAdmin();

  const validated = RegisterClientSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    vehicleId: formData.get("vehicleId"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    cost: formData.get("cost"),
    notes: formData.get("notes"),
  });
  if (!validated.success) return { status: "error", errors: validated.error.flatten().fieldErrors };
  const { fullName, phone, email, vehicleId, startDate, endDate, cost, notes } = validated.data;

  const supabase = await createClient();
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .insert({ full_name: fullName, phone, email: email || null, notes: notes || null })
    .select("id")
    .single();
  if (clientError || !client) return { status: "error", message: "Could not create the client record." };

  const { rawToken, tokenHash } = mintPortalToken();
  const { error: leaseError } = await supabase.from("leases").insert({
    client_id: client.id,
    vehicle_id: vehicleId,
    start_date: startDate,
    end_date: endDate,
    cost,
    status: "active",
    portal_token_hash: tokenHash,
  });
  if (leaseError) {
    await supabase.from("clients").delete().eq("id", client.id);
    return { status: "error", message: "Could not create the lease." };
  }

  revalidatePath("/kifaruadmin/leases");
  revalidatePath("/kifaruadmin");
  return { status: "success", portalUrl: `/portal/${rawToken}` };
}

export async function regeneratePortalToken(
  leaseId: string
): Promise<{ portalUrl: string } | { error: string }> {
  await verifyAdmin();
  const supabase = await createClient();
  const { rawToken, tokenHash } = mintPortalToken();
  const { error } = await supabase
    .from("leases")
    .update({ portal_token_hash: tokenHash })
    .eq("id", leaseId);
  if (error) return { error: "Could not regenerate the link." };

  revalidatePath("/kifaruadmin/leases");
  return { portalUrl: `/portal/${rawToken}` };
}

export async function endLease(leaseId: string) {
  await verifyAdmin();
  const supabase = await createClient();
  await supabase.from("leases").update({ status: "ended" }).eq("id", leaseId);
  revalidatePath("/kifaruadmin/leases");
}

export async function approveExtensionRequest(id: string) {
  await verifyAdmin();
  const supabase = await createClient();

  const { data: request } = await supabase
    .from("extension_requests")
    .select("id, lease_id, requested_end_date, status")
    .eq("id", id)
    .maybeSingle();
  if (!request || request.status !== "pending") return;

  const { error: leaseUpdateError } = await supabase
    .from("leases")
    .update({ end_date: request.requested_end_date, status: "active" })
    .eq("id", request.lease_id);
  if (leaseUpdateError) return;

  await supabase
    .from("extension_requests")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/kifaruadmin/leases");
  revalidatePath("/kifaruadmin/extension-requests");
}

export async function declineExtensionRequest(id: string, notes?: string) {
  await verifyAdmin();
  const supabase = await createClient();
  await supabase
    .from("extension_requests")
    .update({ status: "declined", admin_notes: notes || null, reviewed_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/kifaruadmin/extension-requests");
}
