"use client";

import { useState, useTransition } from "react";
import { Copy, RefreshCw, Square } from "lucide-react";
import { endLease, regeneratePortalToken } from "@/lib/actions/leases";
import { getLeaseDisplayStatus, getRemainingDays, type LeaseDisplayStatus } from "@/lib/client-portal/lease-status";
import { cn } from "@/lib/cn";
import type { LeaseWithRelations } from "@/lib/types";

const STATUS_STYLES: Record<LeaseDisplayStatus, string> = {
  active: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  "ending-soon": "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  overdue: "bg-burgundy-50 text-burgundy-700 dark:bg-burgundy-950/40 dark:text-burgundy-400",
  ended: "bg-charcoal-100 text-charcoal-500 dark:bg-charcoal-800 dark:text-charcoal-400",
};

const STATUS_LABELS: Record<LeaseDisplayStatus, string> = {
  active: "Active",
  "ending-soon": "Ending soon",
  overdue: "Overdue",
  ended: "Ended",
};

export function LeasesTable({ leases }: { leases: LeaseWithRelations[] }) {
  const [isPending, startTransition] = useTransition();
  const [revealedLinks, setRevealedLinks] = useState<Record<string, string>>({});

  return (
    <div className="space-y-4">
      {Object.keys(revealedLinks).length > 0
        ? Object.entries(revealedLinks).map(([leaseId, portalUrl]) => (
            <div
              key={leaseId}
              className="flex items-center gap-3 rounded-2xl border-2 border-gold-500/60 bg-white p-4 shadow-[0_0_18px_-6px_rgba(201,162,39,0.45)] dark:border-gold-400/50 dark:bg-charcoal-900"
            >
              <p className="min-w-0 flex-1 truncate text-sm text-charcoal-700 dark:text-charcoal-300">
                New link ready: <span className="font-mono">{`${typeof window !== "undefined" ? window.location.origin : ""}${portalUrl}`}</span>
              </p>
              <button
                type="button"
                onClick={() =>
                  navigator.clipboard.writeText(
                    `${typeof window !== "undefined" ? window.location.origin : ""}${portalUrl}`
                  )
                }
                className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-charcoal-200 px-3.5 py-2 text-xs font-medium text-charcoal-600 hover:border-burgundy-500 hover:text-burgundy-700 dark:border-charcoal-700 dark:text-charcoal-300"
              >
                <Copy size={13} /> Copy
              </button>
            </div>
          ))
        : null}

      <div className="overflow-x-auto rounded-2xl border-2 border-gold-500/60 bg-white shadow-[0_0_18px_-6px_rgba(201,162,39,0.45)] dark:border-gold-400/50 dark:shadow-[0_0_18px_-6px_rgba(212,185,106,0.35)] dark:bg-charcoal-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-charcoal-100 text-xs uppercase tracking-wide text-charcoal-500 dark:border-charcoal-800 dark:text-charcoal-400">
            <tr>
              <th className="px-5 py-3">Client</th>
              <th className="px-5 py-3">Vehicle</th>
              <th className="px-5 py-3">Lease dates</th>
              <th className="px-5 py-3">Remaining</th>
              <th className="px-5 py-3">Cost</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-100 dark:divide-charcoal-800">
            {leases.map((lease) => {
              const displayStatus = getLeaseDisplayStatus(lease.status, lease.end_date);
              const remaining = getRemainingDays(lease.end_date);
              return (
                <tr key={lease.id}>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-charcoal-950 dark:text-white">{lease.client.full_name}</p>
                    <p className="text-xs text-charcoal-500 dark:text-charcoal-400">{lease.client.phone}</p>
                  </td>
                  <td className="px-5 py-3.5 text-charcoal-700 dark:text-charcoal-300">
                    {lease.vehicle.make} {lease.vehicle.name} &middot; {lease.vehicle.year}
                  </td>
                  <td className="px-5 py-3.5 text-charcoal-700 dark:text-charcoal-300">
                    {lease.start_date} &rarr; {lease.end_date}
                  </td>
                  <td className="px-5 py-3.5 text-charcoal-700 dark:text-charcoal-300">
                    {lease.status === "ended" ? "—" : `${remaining} day${remaining === 1 ? "" : "s"}`}
                  </td>
                  <td className="px-5 py-3.5 text-charcoal-700 dark:text-charcoal-300">
                    {lease.cost.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium",
                        STATUS_STYLES[displayStatus]
                      )}
                    >
                      {STATUS_LABELS[displayStatus]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        disabled={isPending}
                        aria-label={`Regenerate portal link for ${lease.client.full_name}`}
                        title="Regenerate portal link"
                        onClick={() => {
                          if (confirm("Regenerate this client's portal link? The old link will stop working.")) {
                            startTransition(async () => {
                              const result = await regeneratePortalToken(lease.id);
                              if ("portalUrl" in result) {
                                setRevealedLinks((prev) => ({ ...prev, [lease.id]: result.portalUrl }));
                              }
                            });
                          }
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-charcoal-500 hover:bg-charcoal-50 hover:text-burgundy-700 dark:text-charcoal-400 dark:hover:bg-charcoal-800"
                      >
                        <RefreshCw size={15} />
                      </button>
                      {lease.status === "active" ? (
                        <button
                          type="button"
                          disabled={isPending}
                          aria-label={`End lease for ${lease.client.full_name}`}
                          title="End lease"
                          onClick={() => {
                            if (confirm(`End this lease for ${lease.client.full_name}?`)) {
                              startTransition(() => endLease(lease.id));
                            }
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-charcoal-500 hover:bg-burgundy-50 hover:text-burgundy-700 dark:text-charcoal-400 dark:hover:bg-charcoal-800"
                        >
                          <Square size={15} />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
            {leases.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-charcoal-500 dark:text-charcoal-400">
                  No leases yet — register your first client.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
