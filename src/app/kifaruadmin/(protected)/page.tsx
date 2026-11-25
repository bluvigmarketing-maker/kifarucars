import Link from "next/link";
import { Car, ClipboardList, FileClock, Hourglass, MessageSquare, ShoppingBag, Star } from "lucide-react";
import { getDashboardStats } from "@/lib/admin/data";
import { countOpenLiquorOrders } from "@/lib/admin/liquor-data";

export default async function AdminOverviewPage() {
  const [stats, liquor] = await Promise.all([getDashboardStats(), countOpenLiquorOrders()]);

  const cards = [
    {
      label: "Vehicles in fleet",
      value: `${stats.availableVehicleCount} / ${stats.vehicleCount}`,
      hint: "available / total",
      href: "/kifaruadmin/fleet",
      Icon: Car,
    },
    {
      label: "Pending lease applications",
      value: stats.pendingApplicationCount,
      hint: `${stats.totalApplicationCount} total`,
      href: "/kifaruadmin/applications",
      Icon: ClipboardList,
    },
    {
      label: "Active leases",
      value: stats.activeLeaseCount,
      hint: `${stats.totalLeaseCount} total`,
      href: "/kifaruadmin/leases",
      Icon: FileClock,
    },
    {
      label: "Pending extensions",
      value: stats.pendingExtensionRequestCount,
      hint: "requested by clients",
      href: "/kifaruadmin/extension-requests",
      Icon: Hourglass,
    },
    {
      label: "New enquiries",
      value: stats.newEnquiryCount,
      hint: `${stats.totalEnquiryCount} total`,
      href: "/kifaruadmin/enquiries",
      Icon: MessageSquare,
    },
    {
      label: "Liquor orders to fulfil",
      value: liquor.open,
      hint: `${liquor.total} paid orders total`,
      href: "/kifaruadmin/liquor/orders",
      Icon: ShoppingBag,
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
        Manage Kifaru Car Hire (fleet, bookings, leases, enquiries) and the Kifaru Liquor shop.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, hint, href, Icon }) => (
          <Link
            key={label}
            href={href}
            className="rounded-2xl border-2 border-gold-500/60 bg-white p-6 shadow-[0_0_18px_-6px_rgba(201,162,39,0.45)] transition-shadow hover:shadow-[0_0_22px_-4px_rgba(201,162,39,0.6)] dark:border-gold-400/50 dark:shadow-[0_0_18px_-6px_rgba(212,185,106,0.35)] dark:bg-charcoal-900"
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
