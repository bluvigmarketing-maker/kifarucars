import type { Metadata } from "next";
import Image from "next/image";
import { CalendarDays, Wallet } from "lucide-react";
import { verifyClientToken } from "@/lib/client-portal/dal";
import { getLeaseDisplayStatus, getRemainingDays, type LeaseDisplayStatus } from "@/lib/client-portal/lease-status";
import { ExtensionRequestForm } from "@/components/portal/ExtensionRequestForm";
import { cn } from "@/lib/cn";

// Per-token data, never prerenderable — same reasoning as /kifaruadmin/**.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Client Portal",
  robots: { index: false, follow: false },
};

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

export default async function ClientPortalPage({ params }: PageProps<"/portal/[token]">) {
  const { token } = await params;
  const view = await verifyClientToken(token);

  const remainingDays = getRemainingDays(view.endDate);
  const displayStatus = getLeaseDisplayStatus(view.status, view.endDate);

  let extensionDisabledReason: string | undefined;
  if (view.status === "ended") {
    extensionDisabledReason = "This lease has ended — contact us directly if you'd like to discuss a new lease.";
  } else if (view.hasPendingExtensionRequest) {
    extensionDisabledReason = "You already have an extension request pending review.";
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Welcome, {view.clientFirstName}</p>
      <h1 className="mt-1 font-display text-3xl text-charcoal-950 dark:text-white">
        {view.vehicleMake} {view.vehicleName}
      </h1>

      <div className="mt-6 overflow-hidden rounded-2xl border-2 border-gold-500/60 bg-white shadow-[0_0_18px_-6px_rgba(201,162,39,0.45)] dark:border-gold-400/50 dark:shadow-[0_0_18px_-6px_rgba(212,185,106,0.35)] dark:bg-charcoal-900">
        <div className="relative aspect-video w-full bg-charcoal-100 dark:bg-charcoal-800">
          <Image
            src={view.vehicleImageUrl}
            alt={`${view.vehicleMake} ${view.vehicleName}`}
            fill
            className="object-cover"
          />
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-400 dark:text-charcoal-500">
              {view.vehicleYear}
            </p>
            <span className={cn("rounded-full px-3 py-1.5 text-xs font-medium", STATUS_STYLES[displayStatus])}>
              {STATUS_LABELS[displayStatus]}
            </span>
          </div>

          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-2.5">
              <CalendarDays size={18} className="mt-0.5 text-charcoal-400 dark:text-charcoal-500" />
              <div>
                <dt className="text-xs text-charcoal-500 dark:text-charcoal-400">Lease period</dt>
                <dd className="text-sm font-medium text-charcoal-900 dark:text-white">
                  {view.startDate} &rarr; {view.endDate}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Wallet size={18} className="mt-0.5 text-charcoal-400 dark:text-charcoal-500" />
              <div>
                <dt className="text-xs text-charcoal-500 dark:text-charcoal-400">Cost</dt>
                <dd className="text-sm font-medium text-charcoal-900 dark:text-white">
                  {view.cost.toLocaleString()}
                </dd>
              </div>
            </div>
          </dl>

          {view.status === "active" ? (
            <p className="mt-4 text-sm text-charcoal-600 dark:text-charcoal-300">
              {remainingDays >= 0
                ? `${remainingDays} day${remainingDays === 1 ? "" : "s"} remaining.`
                : `${Math.abs(remainingDays)} day${Math.abs(remainingDays) === 1 ? "" : "s"} overdue.`}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-xl text-charcoal-950 dark:text-white">Request an Extension</h2>
        <div className="mt-4">
          <ExtensionRequestForm
            token={token}
            currentEndDate={view.endDate}
            disabled={Boolean(extensionDisabledReason)}
            disabledReason={extensionDisabledReason}
          />
        </div>
      </div>
    </div>
  );
}
