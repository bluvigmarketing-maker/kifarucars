"use client";

import { useActionState } from "react";
import { saveReview } from "@/lib/actions/reviews";
import { Button } from "@/components/ui/Button";
import type { ReviewFormState } from "@/lib/validations";
import type { Review, Vehicle } from "@/lib/types";

const initialState: ReviewFormState = { status: "idle" };

const inputClasses =
  "mt-1.5 w-full rounded-lg border border-charcoal-200 bg-white px-4 py-2.5 text-sm text-charcoal-900 focus:border-burgundy-500 focus:outline-none dark:border-charcoal-700 dark:bg-charcoal-900 dark:text-charcoal-50";
const labelClasses = "text-sm font-medium text-charcoal-700 dark:text-charcoal-300";

export function ReviewForm({ review, vehicles = [] }: { review?: Review; vehicles?: Vehicle[] }) {
  const [state, formAction, pending] = useActionState(saveReview, initialState);
  const errors = state.status === "error" ? state.errors : undefined;

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      {review ? <input type="hidden" name="id" value={review.id} /> : null}

      <div>
        <label className={labelClasses}>Author name</label>
        <input name="authorName" defaultValue={review?.author_name} required className={inputClasses} />
        {errors?.authorName ? <p className="mt-1 text-xs text-burgundy-600">{errors.authorName[0]}</p> : null}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className={labelClasses}>Rating</label>
          <select name="rating" defaultValue={review?.rating ?? 5} className={inputClasses}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} star{n === 1 ? "" : "s"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClasses}>Days ago label</label>
          <input name="daysAgoLabel" defaultValue={review?.days_ago_label} className={inputClasses} placeholder="e.g. 2 weeks ago" />
        </div>
      </div>

      <div>
        <label className={labelClasses}>Review text</label>
        <textarea name="body" defaultValue={review?.body} required rows={4} className={inputClasses} />
        {errors?.body ? <p className="mt-1 text-xs text-burgundy-600">{errors.body[0]}</p> : null}
      </div>

      <div>
        <label className={labelClasses}>Which vehicle is this about? (optional)</label>
        <select name="vehicleId" defaultValue={review?.vehicle_id ?? ""} className={inputClasses}>
          <option value="">General review (not tied to a vehicle)</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.make} {v.name} &middot; {v.year}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-charcoal-500 dark:text-charcoal-400">
          Shown on that vehicle&apos;s detail page as a review from a former user.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-charcoal-700 dark:text-charcoal-300">
        <input type="checkbox" name="isFeatured" defaultChecked={review?.is_featured ?? true} />
        Show on homepage
      </label>

      {state.status === "error" && state.message ? (
        <p className="text-sm text-burgundy-600">{state.message}</p>
      ) : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : review ? "Save Changes" : "Add Review"}
        </Button>
        <Button href="/kifaruadmin/reviews" variant="outline">
          Cancel
        </Button>
      </div>
    </form>
  );
}
