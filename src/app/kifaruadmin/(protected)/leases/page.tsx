import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LeasesTable } from "@/components/admin/LeasesTable";
import { listAllLeases } from "@/lib/admin/data";

export default async function AdminLeasesPage() {
  const leases = await listAllLeases();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-charcoal-950 dark:text-white">Leases</h1>
          <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">
            {leases.length} total &middot; registered clients and their vehicle leases
          </p>
        </div>
        <Button href="/kifaruadmin/leases/new">
          <Plus size={16} /> Register Client
        </Button>
      </div>

      <div className="mt-6">
        <LeasesTable leases={leases} />
      </div>
    </div>
  );
}
