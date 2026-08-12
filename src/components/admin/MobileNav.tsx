"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/components/admin/Sidebar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/cn";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 overflow-x-auto border-b border-charcoal-100 bg-white px-3 py-2 lg:hidden dark:border-charcoal-800 dark:bg-charcoal-950">
      {NAV_ITEMS.map(({ label, href, Icon }) => {
        const active = href === "/kifaruadmin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium",
              active
                ? "bg-burgundy-50 text-burgundy-700 dark:bg-burgundy-950/40 dark:text-burgundy-400"
                : "text-charcoal-600 dark:text-charcoal-300"
            )}
          >
            <Icon size={15} />
            {label}
          </Link>
        );
      })}
      <ThemeToggle className="flex-shrink-0" />
    </nav>
  );
}
