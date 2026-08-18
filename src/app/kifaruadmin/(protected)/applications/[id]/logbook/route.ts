import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/dal";
import { getApplicationById } from "@/lib/admin/data";
import { createClient } from "@/lib/supabase/server";

// Staff-only redirect to a freshly-signed URL for a submitted logbook file.
// The `logbooks` Storage bucket is private, so the file can't be linked to
// directly — a new short-lived signed URL is generated on every request.
export async function GET(
  _request: Request,
  { params }: RouteContext<"/kifaruadmin/applications/[id]/logbook">
) {
  await verifyAdmin();
  const { id } = await params;

  const application = await getApplicationById(id);
  if (!application?.logbook_path) {
    return NextResponse.json({ error: "No logbook on file" }, { status: 404 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("logbooks")
    .createSignedUrl(application.logbook_path, 60);

  if (error || !data) {
    return NextResponse.json({ error: "Could not generate logbook link" }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
