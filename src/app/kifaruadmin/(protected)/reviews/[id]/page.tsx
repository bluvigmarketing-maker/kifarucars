import { notFound } from "next/navigation";
import { ReviewForm } from "@/components/admin/ReviewForm";
import { getReviewById } from "@/lib/admin/data";

export default async function EditReviewPage({
  params,
}: PageProps<"/kifaruadmin/reviews/[id]">) {
  const { id } = await params;
  const review = await getReviewById(id);

  if (!review) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal-950">Edit Review</h1>
      <div className="mt-6">
        <ReviewForm review={review} />
      </div>
    </div>
  );
}
