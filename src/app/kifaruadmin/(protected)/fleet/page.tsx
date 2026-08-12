import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FleetTable } from "@/components/admin/FleetTable";
import { listAllVehicles } from "@/lib/admin/data";

export default async function AdminFleetPage() {
  const vehicles = await listAllVehicles();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-charcoal-950 dark:text-white">Fleet</h1>
          <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">{vehicles.length} vehicles</p>
        </div>
        <Button href="/kifaruadmin/fleet/new">
          <Plus size={16} /> Add Vehicle
        </Button>
      </div>

      <div className="mt-6">
        <FleetTable vehicles={vehicles} />
      </div>
    </div>
  );
}
