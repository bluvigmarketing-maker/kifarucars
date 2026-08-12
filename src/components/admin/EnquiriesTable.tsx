"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteEnquiry, updateEnquiryStatus } from "@/lib/actions/enquiries";
import { cn } from "@/lib/cn";
import type { Enquiry, EnquiryStatus } from "@/lib/types";

const STATUS_OPTIONS: EnquiryStatus[] = ["new", "contacted", "closed"];

const STATUS_STYLES: Record<EnquiryStatus, string> = {
  new: "bg-burgundy-50 text-burgundy-700 dark:bg-burgundy-950/40 dark:text-burgundy-400",
  contacted: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  closed: "bg-charcoal-100 text-charcoal-500 dark:bg-charcoal-800 dark:text-charcoal-400",
};

export function EnquiriesTable({ enquiries }: { enquiries: Enquiry[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      {enquiries.map((enquiry) => (
        <div key={enquiry.id} className="rounded-2xl border border-charcoal-100 bg-white p-5 dark:border-charcoal-800 dark:bg-charcoal-900">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium text-charcoal-950 dark:text-white">
                {enquiry.first_name} {enquiry.last_name}
              </p>
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                {enquiry.email} &middot; {enquiry.phone}
              </p>
              <p className="mt-1 text-xs text-charcoal-400 dark:text-charcoal-500">
                {new Date(enquiry.created_at).toLocaleString()}
                {enquiry.hear_about_us ? ` · via ${enquiry.hear_about_us}` : ""}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                disabled={isPending}
                value={enquiry.status}
                onChange={(e) =>
                  startTransition(() =>
                    updateEnquiryStatus(enquiry.id, e.target.value as EnquiryStatus)
                  )
                }
                className={cn(
                  "rounded-full border-0 px-3 py-1.5 text-xs font-medium capitalize",
                  STATUS_STYLES[enquiry.status]
                )}
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={isPending}
                aria-label="Delete enquiry"
                onClick={() => {
                  if (confirm("Delete this enquiry?")) {
                    startTransition(() => deleteEnquiry(enquiry.id));
                  }
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-charcoal-500 hover:bg-burgundy-50 hover:text-burgundy-700 dark:text-charcoal-400 dark:hover:bg-charcoal-800"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {enquiry.message ? (
            <p className="mt-3 rounded-lg bg-charcoal-50 p-3 text-sm text-charcoal-700 dark:bg-charcoal-800 dark:text-charcoal-300">
              {enquiry.message}
            </p>
          ) : null}
        </div>
      ))}

      {enquiries.length === 0 ? (
        <p className="rounded-2xl border border-charcoal-100 bg-white p-10 text-center text-charcoal-500 dark:border-charcoal-800 dark:bg-charcoal-900 dark:text-charcoal-400">
          No enquiries yet.
        </p>
      ) : null}
    </div>
  );
}
