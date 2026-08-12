"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Pencil, Star, Trash2 } from "lucide-react";
import { deleteReview, toggleReviewFeatured } from "@/lib/actions/reviews";
import { cn } from "@/lib/cn";
import type { Review } from "@/lib/types";

export function ReviewsTable({ reviews }: { reviews: Review[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-2xl border border-charcoal-100 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-0.5 text-burgundy-600">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} fill={i < review.rating ? "currentColor" : "none"} />
                ))}
              </div>
              <p className="mt-1.5 font-medium text-charcoal-950">{review.author_name}</p>
              <p className="text-xs text-charcoal-400">{review.days_ago_label}</p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(() => toggleReviewFeatured(review.id, !review.is_featured))
                }
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium",
                  review.is_featured ? "bg-green-50 text-green-700" : "bg-charcoal-100 text-charcoal-500"
                )}
              >
                {review.is_featured ? "Featured" : "Hidden"}
              </button>
              <Link
                href={`/kifaruadmin/reviews/${review.id}`}
                aria-label={`Edit review from ${review.author_name}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-charcoal-500 hover:bg-charcoal-50 hover:text-burgundy-700"
              >
                <Pencil size={15} />
              </Link>
              <button
                type="button"
                disabled={isPending}
                aria-label={`Delete review from ${review.author_name}`}
                onClick={() => {
                  if (confirm("Delete this review?")) {
                    startTransition(() => deleteReview(review.id));
                  }
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-charcoal-500 hover:bg-burgundy-50 hover:text-burgundy-700"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          <p className="mt-3 text-sm text-charcoal-700">{review.body}</p>
        </div>
      ))}

      {reviews.length === 0 ? (
        <p className="rounded-2xl border border-charcoal-100 bg-white p-10 text-center text-charcoal-500">
          No reviews yet — add your first one.
        </p>
      ) : null}
    </div>
  );
}
