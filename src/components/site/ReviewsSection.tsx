import { Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BUSINESS } from "@/lib/placeholder-data";
import type { Review } from "@/lib/types";

export function ReviewsSection({ reviews }: { reviews: Review[] }) {
  return (
    <section className="bg-charcoal-50 py-20 sm:py-24 dark:bg-charcoal-950">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading eyebrow="What Clients Say" title="Google Reviews" />
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 text-burgundy-600 dark:text-burgundy-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} fill={i < Math.round(BUSINESS.googleRating) ? "currentColor" : "none"} />
              ))}
            </div>
            <span className="text-sm text-charcoal-600 dark:text-charcoal-300">
              {BUSINESS.googleRating} &middot; Based on {BUSINESS.googleReviewCount} reviews
            </span>
          </div>
        </div>

        <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-2xl border-2 border-gold-500/60 bg-white p-6 shadow-[0_0_18px_-6px_rgba(201,162,39,0.45)] dark:border-gold-400/50 dark:shadow-[0_0_18px_-6px_rgba(212,185,106,0.35)] dark:bg-charcoal-900">
              <div className="flex items-center gap-0.5 text-burgundy-600 dark:text-burgundy-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                ))}
              </div>
              <p className="mt-3 text-sm text-charcoal-700 dark:text-charcoal-300">&ldquo;{review.body}&rdquo;</p>
              <div className="mt-4 flex items-center justify-between text-xs text-charcoal-500 dark:text-charcoal-400">
                <span className="font-semibold text-charcoal-900 dark:text-white">{review.author_name}</span>
                <span>{review.days_ago_label}</span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
