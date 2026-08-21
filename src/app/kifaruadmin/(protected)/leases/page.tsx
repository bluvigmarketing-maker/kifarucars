import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LeasesTable } from "@/components/admin/LeasesTable";
import { listAllLeases } from "@/lib/admin/data";
import { getLeaseDisplayStatus } from "@/lib/client-portal/lease-status";

export default async function AdminLeasesPage() {
  const leases = await listAllLeases();

  const activeCount = leases.filter((l) => getLeaseDisplayStatus(l.status, l.end_date) === "active").length;
  const endingSoonCount = leases.filter(
    (l) => getLeaseDisplayStatus(l.status, l.end_date) === "ending-soon"
  ).length;
  const overdueCount = leases.filter((l) => getLeaseDisplayStatus(l.status, l.end_date) === "overdue").length;
  const endedCount = leases.filter((l) => l.status === "ended").length;
  const totalRevenue = leases.reduce((sum, l) => sum + l.cost, 0);

  const stats = [
    { label: "Total records", value: leases.length },
    { label: "Active", value: activeCount },
    { label: "Ending soon", value: endingSoonCount },
    { label: "Overdue", value: overdueCount },
    { label: "Ended", value: endedCount },
    { label: "Total value", value: totalRevenue.toLocaleString() },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-charcoal-950 dark:text-white">Lease Records</h1>
          <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">
            Every past and current client lease and booking — {leases.length} total
          </p>
        </div>
        <Button href="/kifaruadmin/leases/new">
          <Plus size={16} /> Register Client
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl border-2 border-gold-500/60 bg-white p-4 shadow-[0_0_18px_-6px_rgba(201,162,39,0.45)] dark:border-gold-400/50 dark:shadow-[0_0_18px_-6px_rgba(212,185,106,0.35)] dark:bg-charcoal-900"
          >
            <p className="text-xs text-charcoal-500 dark:text-charcoal-400">{label}</p>
            <p className="mt-1 font-display text-2xl text-charcoal-950 dark:text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <LeasesTable leases={leases} />
      </div>
    </div>
  );
}
