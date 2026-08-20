import "server-only";
import { cache } from "react";
import { createHash } from "crypto";
import { notFound } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { ClientPortalView } from "@/lib/types";

export function hashPortalToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

type PortalViewRow = {
  lease_id: string;
  client_first_name: string;
  vehicle_name: string;
  vehicle_make: string;
  vehicle_year: number;
  vehicle_image_url: string;
  start_date: string;
  end_date: string;
  cost: number;
  status: ClientPortalView["status"];
  has_pending_extension_request: boolean;
};

/**
 * Resolves a /portal/<token> URL to its lease data via the get_portal_view
 * RPC (see supabase/migrations/0006_client_portal.sql) — the only sanctioned
 * bypass of RLS on `leases`. 404s on any failure so an invalid token looks
 * indistinguishable from any other bad URL. Cached per-request/token, same
 * rationale as verifyAdmin() in src/lib/admin/dal.ts.
 */
export const verifyClientToken = cache(async (token: string): Promise<ClientPortalView> => {
  if (!isSupabaseConfigured || !token) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("get_portal_view", { p_token_hash: hashPortalToken(token) })
    .maybeSingle<PortalViewRow>();

  if (error || !data) notFound();

  return {
    leaseId: data.lease_id,
    clientFirstName: data.client_first_name,
    vehicleName: data.vehicle_name,
    vehicleMake: data.vehicle_make,
    vehicleYear: data.vehicle_year,
    vehicleImageUrl: data.vehicle_image_url,
    startDate: data.start_date,
    endDate: data.end_date,
    cost: data.cost,
    status: data.status,
    hasPendingExtensionRequest: data.has_pending_extension_request,
  };
});
