import { EnquiriesTable } from "@/components/admin/EnquiriesTable";
import { listAllEnquiries } from "@/lib/admin/data";

export default async function AdminEnquiriesPage() {
  const enquiries = await listAllEnquiries();

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal-950 dark:text-white">Enquiries</h1>
      <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">{enquiries.length} total</p>

      <div className="mt-6">
        <EnquiriesTable enquiries={enquiries} />
      </div>
    </div>
  );
}
