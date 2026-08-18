import { notFound } from "next/navigation";
import { ReviewForm } from "@/components/admin/ReviewForm";
import { getReviewById, listAllVehicles } from "@/lib/admin/data";

export default async function EditReviewPage({
  params,
}: PageProps<"/kifaruadmin/reviews/[id]">) {
  const { id } = await params;
  const [review, vehicles] = await Promise.all([getReviewById(id), listAllVehicles()]);

  if (!review) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal-950 dark:text-white">Edit Review</h1>
      <div className="mt-6">
        <ReviewForm review={review} vehicles={vehicles} />
      </div>
    </div>
  );
}
