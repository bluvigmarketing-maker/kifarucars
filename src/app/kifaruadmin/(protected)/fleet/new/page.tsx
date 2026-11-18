import { VehicleForm } from "@/components/admin/VehicleForm";
import { listAllCategories } from "@/lib/admin/data";

export default async function NewVehiclePage() {
  const categories = await listAllCategories();

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal-950 dark:text-white">Add Vehicle</h1>
      <div className="mt-6">
        <VehicleForm categories={categories} />
      </div>
    </div>
  );
}
