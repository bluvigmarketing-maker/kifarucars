"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, LayoutDashboard, LogOut, MessageSquare, Star } from "lucide-react";
import { logout } from "@/lib/actions/admin-auth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/cn";

export const NAV_ITEMS = [
  { label: "Overview", href: "/kifaruadmin", Icon: LayoutDashboard },
  { label: "Fleet", href: "/kifaruadmin/fleet", Icon: Car },
  { label: "Enquiries", href: "/kifaruadmin/enquiries", Icon: MessageSquare },
  { label: "Reviews", href: "/kifaruadmin/reviews", Icon: Star },
];

export function Sidebar({ adminLabel }: { adminLabel: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-full w-64 flex-shrink-0 flex-col border-r border-charcoal-100 bg-white lg:flex dark:border-charcoal-800 dark:bg-charcoal-950">
      <div className="border-b border-charcoal-100 px-6 py-5 dark:border-charcoal-800">
        <p className="font-display text-xl text-charcoal-950 dark:text-white">Kifaru</p>
        <p className="text-xs text-charcoal-500 dark:text-charcoal-400">Admin dashboard</p>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {NAV_ITEMS.map(({ label, href, Icon }) => {
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
