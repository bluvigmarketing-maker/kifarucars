"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  Car,
  ClipboardList,
  CupSoda,
  FileClock,
  Hourglass,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquare,
  Package,
  ShoppingBag,
  Star,
  Tags,
  Wallet,
  Wine,
} from "lucide-react";
import { logout } from "@/lib/actions/admin-auth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/cn";

const CAR_HIRE_ITEMS = [
  { label: "Overview", href: "/kifaruadmin", Icon: LayoutDashboard },
  { label: "Fleet", href: "/kifaruadmin/fleet", Icon: Car },
  { label: "Categories", href: "/kifaruadmin/categories", Icon: Tags },
  { label: "Bookings", href: "/kifaruadmin/bookings", Icon: CalendarCheck },
  { label: "Extras", href: "/kifaruadmin/extras", Icon: CupSoda },
  { label: "Lease Applications", href: "/kifaruadmin/applications", Icon: ClipboardList },
  { label: "Lease records", href: "/kifaruadmin/leases", Icon: FileClock },
  { label: "Extensions", href: "/kifaruadmin/extension-requests", Icon: Hourglass },
  { label: "Payments", href: "/kifaruadmin/payments", Icon: Wallet },
  { label: "Enquiries", href: "/kifaruadmin/enquiries", Icon: MessageSquare },
  { label: "Reviews", href: "/kifaruadmin/reviews", Icon: Star },
];

// Kifaru Liquor (liqour.kifaru.ke) — same database, managed from here.
const LIQUOR_ITEMS = [
  { label: "Orders", href: "/kifaruadmin/liquor/orders", Icon: ShoppingBag },
  { label: "Products", href: "/kifaruadmin/liquor/products", Icon: Package },
  { label: "Categories", href: "/kifaruadmin/liquor/categories", Icon: Wine },
];

export const NAV_GROUPS = [
  { title: null, items: CAR_HIRE_ITEMS },
  { title: "Kifaru Liquor", items: LIQUOR_ITEMS },
  { title: "Settings", items: [{ label: "Email settings", href: "/kifaruadmin/settings", Icon: Mail }] },
];

export const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

export function Sidebar({ adminLabel }: { adminLabel: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-full w-64 flex-shrink-0 flex-col border-r border-charcoal-100 bg-white lg:flex dark:border-charcoal-800 dark:bg-charcoal-950">
      <div className="border-b border-charcoal-100 px-6 py-5 dark:border-charcoal-800">
        <p className="font-display text-xl text-charcoal-950 dark:text-white">Kifaru</p>
        <p className="text-xs text-charcoal-500 dark:text-charcoal-400">Admin dashboard</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.title ?? "main"} className={group.title ? "mt-5" : undefined}>
            {group.title ? (
              <p className="mb-1.5 px-3.5 text-[11px] font-semibold uppercase tracking-widest text-charcoal-400 dark:text-charcoal-500">
                {group.title}
              </p>
            ) : null}
            <div className="space-y-1">
              {group.items.map(({ label, href, Icon }) => {
                const active = href === "/kifaruadmin" ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-burgundy-50 text-burgundy-700 dark:bg-burgundy-950/40 dark:text-burgundy-400"
                        : "text-charcoal-600 hover:bg-charcoal-50 dark:text-charcoal-300 dark:hover:bg-charcoal-800"
                    )}
                  >
                    <Icon size={17} />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-charcoal-100 p-4 dark:border-charcoal-800">
        <div className="flex items-center justify-between px-1">
          <p className="truncate text-xs text-charcoal-500 dark:text-charcoal-400">{adminLabel}</p>
          <ThemeToggle />
        </div>
        <form action={logout} className="mt-2">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium text-charcoal-600 hover:bg-charcoal-50 dark:text-charcoal-300 dark:hover:bg-charcoal-800"
          >
            <LogOut size={16} />
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}
