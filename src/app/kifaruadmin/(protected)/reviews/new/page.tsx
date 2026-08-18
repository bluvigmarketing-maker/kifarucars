import { ReviewForm } from "@/components/admin/ReviewForm";
import { listAllVehicles } from "@/lib/admin/data";

export default async function NewReviewPage() {
  const vehicles = await listAllVehicles();

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal-950 dark:text-white">Add Review</h1>
      <div className="mt-6">
        <ReviewForm vehicles={vehicles} />
      </div>
    </div>
  );
}
