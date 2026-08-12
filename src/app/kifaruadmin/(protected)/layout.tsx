import { verifyAdmin } from "@/lib/admin/dal";
import { Sidebar } from "@/components/admin/Sidebar";
import { MobileNav } from "@/components/admin/MobileNav";

// Every page here depends on the signed-in user's session and live
// Supabase data, so it should never be statically prerendered.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: LayoutProps<"/kifaruadmin">) {
  const admin = await verifyAdmin();

  return (
    <div className="flex min-h-screen bg-charcoal-50 dark:bg-charcoal-950">
      <Sidebar adminLabel={admin.full_name ?? admin.email} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav />
        <main className="flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
