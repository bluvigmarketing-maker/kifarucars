import { RegisterClientForm } from "@/components/admin/RegisterClientForm";
import { listAllVehicles } from "@/lib/admin/data";

export default async function NewLeasePage() {
  const vehicles = await listAllVehicles();
  const availableVehicles = vehicles.filter((v) => v.is_available);

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal-950 dark:text-white">Register Client</h1>
      <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">
        Creates a client record and an active lease, and mints their one-time portal link.
      </p>
      <div className="mt-6">
        <RegisterClientForm vehicles={availableVehicles} />
      </div>
    </div>
  );
}
