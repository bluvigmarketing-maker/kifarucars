import { notFound } from "next/navigation";
import { VehicleForm } from "@/components/admin/VehicleForm";
import { getVehicleById } from "@/lib/admin/data";

export default async function EditVehiclePage({
  params,
}: PageProps<"/kifaruadmin/fleet/[id]">) {
  const { id } = await params;
  const vehicle = await getVehicleById(id);

  if (!vehicle) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal-950">Edit Vehicle</h1>
      <div className="mt-6">
        <VehicleForm vehicle={vehicle} />
      </div>
    </div>
  );
}
