"use client";

import { useState, useTransition } from "react";
import { approveExtensionRequest, declineExtensionRequest } from "@/lib/actions/leases";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { formatKes } from "@/lib/payments/balance";
import type { ExtensionRequestStatus, ExtensionRequestWithLease } from "@/lib/types";

const STATUS_STYLES: Record<ExtensionRequestStatus, string> = {
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  approved: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  declined: "bg-charcoal-100 text-charcoal-500 dark:bg-charcoal-800 dark:text-charcoal-400",
};

export function ExtensionRequestsTable({ requests }: { requests: ExtensionRequestWithLease[] }) {
  const [isPending, startTransition] = useTransition();
  const [amounts, setAmounts] = useState<Record<string, string>>({});

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
              {request.status === "approved" && request.amount !== null ? (
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                  Extension charge: {formatKes(request.amount)}
                </p>
              ) : null}
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
              <label className="flex items-center gap-2 text-sm text-charcoal-600 dark:text-charcoal-300">
                Charge (KES)
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={amounts[request.id] ?? ""}
                  onChange={(e) => setAmounts((prev) => ({ ...prev, [request.id]: e.target.value }))}
                  placeholder="0"
                  className="w-32 rounded-lg border border-charcoal-200 bg-white px-3 py-1.5 text-sm text-charcoal-900 focus:border-burgundy-500 focus:outline-none dark:border-charcoal-700 dark:bg-charcoal-900 dark:text-charcoal-50"
                />
              </label>
              <Button
                type="button"
                size="sm"
                disabled={isPending}
                onClick={() => {
                  const amount = Number(amounts[request.id] || 0);
                  const prompt =
                    amount > 0
                      ? `Approve and add ${formatKes(amount)} to this client's balance?`
                      : "Approve with no extra charge?";
                  if (confirm(prompt)) startTransition(() => approveExtensionRequest(request.id, amount));
                }}
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
