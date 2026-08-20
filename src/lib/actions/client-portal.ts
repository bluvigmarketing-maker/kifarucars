"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { hashPortalToken } from "@/lib/client-portal/dal";
import { ExtensionRequestSchema, type ExtensionRequestFormState } from "@/lib/validations";

// No verifyAdmin/session check here by design — the request_lease_extension
// RPC itself is the authorization boundary. An invalid token, an inactive
// lease, and a duplicate pending request all fail inside the RPC and
// surface as one generic error, without leaking which case it was.
export async function submitExtensionRequest(
  _prevState: ExtensionRequestFormState,
  formData: FormData
): Promise<ExtensionRequestFormState> {
  const validated = ExtensionRequestSchema.safeParse({
    token: formData.get("token"),
    requestedEndDate: formData.get("requestedEndDate"),
    reason: formData.get("reason"),
  });
  if (!validated.success) return { status: "error", message: "Please pick a valid new end date." };

  const { token, requestedEndDate, reason } = validated.data;
  const supabase = await createClient();
  const { error } = await supabase.rpc("request_lease_extension", {
    p_token_hash: hashPortalToken(token),
    p_requested_end_date: requestedEndDate,
    p_reason: reason || null,
  });
  if (error) {
    return {
      status: "error",
      message: "We couldn't submit your request. Please try again or contact us directly.",
    };
  }

  revalidatePath(`/portal/${token}`);
  return { status: "success" };
}
