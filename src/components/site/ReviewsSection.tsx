import { Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BUSINESS } from "@/lib/placeholder-data";
import type { Review } from "@/lib/types";

export function ReviewsSection({ reviews }: { reviews: Review[] }) {
  return (
    <section className="bg-charcoal-50 py-20 sm:py-24">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading eyebrow="What Clients Say" title="Google Reviews" />
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 text-burgundy-600">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} fill={i < Math.round(BUSINESS.googleRating) ? "currentColor" : "none"} />
              ))}
            </div>
            <span className="text-sm text-charcoal-600">
              {BUSINESS.googleRating} &middot; Based on {BUSINESS.googleReviewCount} reviews
            </span>
          </div>
        </div>

        <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-0.5 text-burgundy-600">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                ))}
              </div>
              <p className="mt-3 text-sm text-charcoal-700">&ldquo;{review.body}&rdquo;</p>
              <div className="mt-4 flex items-center justify-between text-xs text-charcoal-500">
                <span className="font-semibold text-charcoal-900">{review.author_name}</span>
                <span>{review.days_ago_label}</span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
