"use client";

import { useTransition } from "react";
import { approveExtensionRequest, declineExtensionRequest } from "@/lib/actions/leases";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { ExtensionRequestStatus, ExtensionRequestWithLease } from "@/lib/types";

const STATUS_STYLES: Record<ExtensionRequestStatus, string> = {
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  approved: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  declined: "bg-charcoal-100 text-charcoal-500 dark:bg-charcoal-800 dark:text-charcoal-400",
};

export function ExtensionRequestsTable({ requests }: { requests: ExtensionRequestWithLease[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <div
          key={request.id}
          className="rounded-2xl border-2 border-gold-500/60 bg-white p-5 shadow-[0_0_18px_-6px_rgba(201,162,39,0.45)] dark:border-gold-400/50 dark:shadow-[0_0_18px_-6px_rgba(212,185,106,0.35)] dark:bg-charcoal-900"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium text-charcoal-950 dark:text-white">
                {request.lease.client.full_name} &middot; {request.lease.vehicle.make}{" "}
                {request.lease.vehicle.name}
              </p>
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                Current end date: {request.lease.end_date} &rarr; Requested: {request.requested_end_date}
              </p>
              <p className="mt-1 text-xs text-charcoal-400 dark:text-charcoal-500">
                {new Date(request.created_at).toLocaleString()}
              </p>
            </div>

            <span
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium capitalize",
                STATUS_STYLES[request.status]
              )}
            >
              {request.status}
            </span>
          </div>

          {request.reason ? (
            <p className="mt-3 text-sm text-charcoal-600 dark:text-charcoal-300">
              &ldquo;{request.reason}&rdquo;
            </p>
          ) : null}

          {request.status === "pending" ? (
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <Button
                type="button"
                size="sm"
                disabled={isPending}
                onClick={() => startTransition(() => approveExtensionRequest(request.id))}
              >
                Approve
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  if (confirm("Decline this extension request?")) {
                    startTransition(() => declineExtensionRequest(request.id));
                  }
                }}
              >
                Decline
              </Button>
            </div>
          ) : null}
        </div>
      ))}

      {requests.length === 0 ? (
        <p className="rounded-2xl border border-charcoal-100 bg-white p-10 text-center text-charcoal-500 dark:border-charcoal-800 dark:bg-charcoal-900 dark:text-charcoal-400">
          No extension requests yet.
        </p>
      ) : null}
    </div>
  );
}
