"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/components/admin/Sidebar";
import { cn } from "@/lib/cn";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-charcoal-100 bg-white px-3 py-2 lg:hidden">
      {NAV_ITEMS.map(({ label, href, Icon }) => {
        const active = href === "/kifaruadmin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium",
              active ? "bg-burgundy-50 text-burgundy-700" : "text-charcoal-600"
            )}
          >
            <Icon size={15} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
