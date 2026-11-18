import { CategoryManager } from "@/components/admin/CategoryManager";
import { listAllCategories, listAllVehicles } from "@/lib/admin/data";

export default async function AdminCategoriesPage() {
  const [categories, vehicles] = await Promise.all([listAllCategories(), listAllVehicles()]);

  const vehicleCounts: Record<string, number> = {};
  for (const vehicle of vehicles) {
    if (vehicle.category_id) vehicleCounts[vehicle.category_id] = (vehicleCounts[vehicle.category_id] ?? 0) + 1;
  }
  const uncategorised = vehicles.filter((v) => !v.category_id).length;

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal-950 dark:text-white">Categories</h1>
      <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">
        Group the fleet for the homepage filters and the pricing page. Lower order numbers show first.
        {uncategorised > 0 ? ` ${uncategorised} vehicle(s) have no category yet.` : ""}
      </p>

      <div className="mt-6">
        <CategoryManager categories={categories} vehicleCounts={vehicleCounts} />
      </div>
    </div>
  );
}
