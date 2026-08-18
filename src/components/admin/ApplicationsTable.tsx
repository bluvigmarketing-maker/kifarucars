"use client";

import { useTransition } from "react";
import { FileText } from "lucide-react";
import { approveApplication, rejectApplication } from "@/lib/actions/applications";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { ApplicationStatus, VehicleApplication } from "@/lib/types";

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  approved: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  rejected: "bg-charcoal-100 text-charcoal-500 dark:bg-charcoal-800 dark:text-charcoal-400",
};

export function ApplicationsTable({ applications }: { applications: VehicleApplication[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      {applications.map((application) => (
        <div
          key={application.id}
          className="rounded-2xl border-2 border-gold-500/60 bg-white p-5 shadow-[0_0_18px_-6px_rgba(201,162,39,0.45)] dark:border-gold-400/50 dark:shadow-[0_0_18px_-6px_rgba(212,185,106,0.35)] dark:bg-charcoal-900"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium text-charcoal-950 dark:text-white">
                {application.make} {application.name} &middot; {application.year}
              </p>
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                {application.owner_name} &middot; {application.owner_phone} &middot;{" "}
                {application.owner_email}
              </p>
              <p className="mt-1 text-xs text-charcoal-400 dark:text-charcoal-500">
                {new Date(application.created_at).toLocaleString()}
              </p>
            </div>

            <span
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium capitalize",
                STATUS_STYLES[application.status]
              )}
            >
              {application.status}
            </span>
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-sm text-charcoal-600 dark:text-charcoal-300 sm:grid-cols-4">
            <div>{application.transmission}</div>
            <div>{application.seats} seats</div>
            <div>{application.fuel_type}</div>
            <div>{application.mileage != null ? `${application.mileage} km` : "Mileage n/a"}</div>
            <div>Chassis: {application.chassis_number || "n/a"}</div>
            <div>Reg: {application.registration_number || "n/a"}</div>
          </dl>

          {application.additional_features.length > 0 ? (
            <p className="mt-2 text-sm text-charcoal-600 dark:text-charcoal-300">
              Features: {application.additional_features.join(", ")}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {application.logbook_path ? (
              <a
                href={`/kifaruadmin/applications/${application.id}/logbook`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-charcoal-200 px-3.5 py-1.5 text-xs font-medium text-charcoal-600 hover:border-burgundy-500 hover:text-burgundy-700 dark:border-charcoal-700 dark:text-charcoal-300"
              >
                <FileText size={13} /> View logbook
              </a>
            ) : (
              <span className="text-xs text-charcoal-400 dark:text-charcoal-500">No logbook uploaded</span>
            )}

            {application.status === "pending" ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  disabled={isPending}
                  onClick={() => startTransition(() => approveApplication(application.id))}
                >
                  Approve
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => {
                    if (confirm("Reject this application?")) {
                      startTransition(() => rejectApplication(application.id));
                    }
                  }}
                >
                  Reject
                </Button>
              </>
            ) : null}
          </div>

          {application.status === "approved" ? (
            <p className="mt-3 text-xs text-charcoal-400 dark:text-charcoal-500">
              Added to the fleet as hidden — open it in Fleet management to add photos and make it available.
            </p>
          ) : null}
        </div>
      ))}

      {applications.length === 0 ? (
        <p className="rounded-2xl border border-charcoal-100 bg-white p-10 text-center text-charcoal-500 dark:border-charcoal-800 dark:bg-charcoal-900 dark:text-charcoal-400">
          No vehicle applications yet.
        </p>
      ) : null}
    </div>
  );
}
