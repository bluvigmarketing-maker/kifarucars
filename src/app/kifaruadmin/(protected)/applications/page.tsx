import { ApplicationsTable } from "@/components/admin/ApplicationsTable";
import { listAllApplications } from "@/lib/admin/data";

export default async function AdminApplicationsPage() {
  const applications = await listAllApplications();

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal-950 dark:text-white">
        Vehicle Applications
      </h1>
      <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">
        {applications.length} total &middot; car owners applying to lease their vehicle through the fleet
      </p>

      <div className="mt-6">
        <ApplicationsTable applications={applications} />
      </div>
    </div>
  );
}
