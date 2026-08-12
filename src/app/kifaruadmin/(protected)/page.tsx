import Link from "next/link";
import { Car, MessageSquare, Star } from "lucide-react";
import { getDashboardStats } from "@/lib/admin/data";

export default async function AdminOverviewPage() {
  const stats = await getDashboardStats();

  const cards = [
    {
      label: "Vehicles in fleet",
      value: `${stats.availableVehicleCount} / ${stats.vehicleCount}`,
      hint: "available / total",
      href: "/kifaruadmin/fleet",
      Icon: Car,
    },
    {
      label: "New enquiries",
      value: stats.newEnquiryCount,
      hint: `${stats.totalEnquiryCount} total`,
      href: "/kifaruadmin/enquiries",
      Icon: MessageSquare,
    },
    {
      label: "Reviews",
      value: stats.reviewCount,
      hint: "shown on homepage",
      href: "/kifaruadmin/reviews",
      Icon: Star,
    },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal-950 dark:text-white">Overview</h1>
      <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">
        Manage your Prado fleet, enquiries and reviews shown on kifarucarhire.com.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {cards.map(({ label, value, hint, href, Icon }) => (
          <Link
            key={label}
            href={href}
            className="rounded-2xl border border-charcoal-100 bg-white p-6 transition-shadow hover:shadow-md dark:border-charcoal-800 dark:bg-charcoal-900"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-burgundy-50 text-burgundy-600 dark:bg-burgundy-950/40 dark:text-burgundy-400">
              <Icon size={18} />
            </div>
            <p className="mt-4 text-sm text-charcoal-500 dark:text-charcoal-400">{label}</p>
            <p className="mt-1 font-display text-3xl text-charcoal-950 dark:text-white">{value}</p>
            <p className="mt-1 text-xs text-charcoal-400 dark:text-charcoal-500">{hint}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
