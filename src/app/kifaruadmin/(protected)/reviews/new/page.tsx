import { ReviewForm } from "@/components/admin/ReviewForm";

export default function NewReviewPage() {
  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal-950 dark:text-white">Add Review</h1>
      <div className="mt-6">
        <ReviewForm />
      </div>
    </div>
  );
}
