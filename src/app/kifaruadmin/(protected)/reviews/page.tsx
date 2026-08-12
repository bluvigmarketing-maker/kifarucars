import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ReviewsTable } from "@/components/admin/ReviewsTable";
import { listAllReviews } from "@/lib/admin/data";

export default async function AdminReviewsPage() {
  const reviews = await listAllReviews();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-charcoal-950 dark:text-white">Reviews</h1>
          <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">{reviews.length} total</p>
        </div>
        <Button href="/kifaruadmin/reviews/new">
          <Plus size={16} /> Add Review
        </Button>
      </div>

      <div className="mt-6">
        <ReviewsTable reviews={reviews} />
      </div>
    </div>
  );
}
