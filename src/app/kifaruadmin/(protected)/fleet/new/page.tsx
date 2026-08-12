import { VehicleForm } from "@/components/admin/VehicleForm";

export default function NewVehiclePage() {
  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal-950 dark:text-white">Add Vehicle</h1>
      <div className="mt-6">
        <VehicleForm />
      </div>
    </div>
  );
}
