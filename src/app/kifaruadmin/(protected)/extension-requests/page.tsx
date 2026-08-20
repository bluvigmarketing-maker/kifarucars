import { ExtensionRequestsTable } from "@/components/admin/ExtensionRequestsTable";
import { listAllExtensionRequests } from "@/lib/admin/data";

export default async function AdminExtensionRequestsPage() {
  const requests = await listAllExtensionRequests();

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal-950 dark:text-white">
        Extension Requests
      </h1>
      <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">
        {requests.length} total &middot; clients requesting a longer lease via their portal
      </p>

      <div className="mt-6">
        <ExtensionRequestsTable requests={requests} />
      </div>
    </div>
  );
}
