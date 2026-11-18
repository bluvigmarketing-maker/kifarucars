"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LexusSuvIcon } from "@/components/site/LexusSuvIcon";
import { cn } from "@/lib/cn";

type NavLink = { label: string; href: string; description?: string; icon?: boolean };
type NavItem = NavLink | { label: string; children: NavLink[] };

// Section links are rooted at "/" so they also work from other pages.
// Grouped into dropdowns to keep the bar short — every page is still here.
const NAV: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Fleet",
    children: [
      { label: "Our Fleet", href: "/#fleet", description: "Browse every car we hire out" },
      { label: "Pricing", href: "/pricing", description: "Daily rates for the whole fleet" },
    ],
  },
  {
    label: "Services",
    children: [
      { label: "Corporate Car Hire", href: "/#fleet", description: "Self-drive or chauffeur-driven" },
      { label: "Corporate Leasing", href: "/corporate-leasing", description: "Long-term fleets for companies" },
      { label: "List Your Car", href: "/list-your-car", description: "Earn by leasing your vehicle", icon: true },
    ],
  },
  { label: "About Us", href: "/#about" },
  { label: "Contact Us", href: "/#enquiry" },
];

const linkClasses =
  "text-sm font-medium text-charcoal-700 transition-colors hover:text-burgundy-700 dark:text-charcoal-300 dark:hover:text-burgundy-400";

function Dropdown({
  label,
  items,
  open,
  onOpenChange,
}: {
  label: string;
  items: NavLink[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <div className="relative" onMouseEnter={() => onOpenChange(true)} onMouseLeave={() => onOpenChange(false)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => onOpenChange(!open)}
        className={cn(linkClasses, "flex items-center gap-1 py-2", open && "text-burgundy-700 dark:text-burgundy-400")}
      >
        {label}
        <ChevronDown size={14} className={cn("transition-transform duration-200", open && "rotate-180")} />
      </button>

      {/* pt-2 bridges the gap so the menu doesn't close on the way down. */}
      <div
        className={cn(
          "absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-2 transition-all duration-150",
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"
        )}
      >
        <ul className="rounded-xl border border-charcoal-100 bg-white p-1.5 shadow-lg dark:border-charcoal-800 dark:bg-charcoal-900">
          {items.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                onClick={() => onOpenChange(false)}
                className="block rounded-lg px-3 py-2.5 hover:bg-charcoal-50 dark:hover:bg-charcoal-800"
              >
                <span className="flex items-center gap-1.5 text-sm font-medium text-charcoal-900 dark:text-white">
                  {item.icon ? <LexusSuvIcon className="text-burgundy-600 dark:text-burgundy-400" /> : null}
                  {item.label}
                </span>
                {item.description ? (
                  <span className="mt-0.5 block text-xs text-charcoal-500 dark:text-charcoal-400">{item.description}</span>
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Close an open dropdown on Escape or a click elsewhere.
  useEffect(() => {
    if (!openDropdown) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenDropdown(null);
    const onClick = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpenDropdown(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [openDropdown]);

  return (
    <header className="sticky top-0 z-50 border-b border-charcoal-100 bg-white/95 backdrop-blur dark:border-charcoal-800 dark:bg-charcoal-950/95">
      <Container className="flex h-18 items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gold-500/70 p-1.5 shadow-[0_0_12px_-2px_rgba(201,162,39,0.55)] dark:border-gold-400/55 dark:shadow-[0_0_12px_-2px_rgba(212,185,106,0.45)]">
            <Image src="/images/kifaru-icon.png" alt="" width={388} height={317} priority className="h-full w-auto" />
          </span>
          <span className="font-display text-2xl font-semibold text-charcoal-950 dark:text-white">
            Kifaru
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest text-burgundy-600 dark:text-burgundy-400">
            Car Hire
          </span>
        </Link>

        <nav ref={navRef} aria-label="Main" className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) =>
            "children" in item ? (
              <Dropdown
                key={item.label}
                label={item.label}
                items={item.children}
                open={openDropdown === item.label}
                onOpenChange={(next) => setOpenDropdown(next ? item.label : null)}
              />
            ) : (
              <a key={item.label} href={item.href} className={linkClasses}>
                {item.label}
              </a>
            )
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <Button href="/#fleet" size="sm">
            Select A Car
          </Button>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="inline-flex items-center justify-center rounded-full p-2 text-charcoal-900 dark:text-white"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </Container>

      {open ? (
        <div className="max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-charcoal-100 bg-white lg:hidden dark:border-charcoal-800 dark:bg-charcoal-950">
          <Container className="flex flex-col py-3">
            {NAV.map((item) =>
              "children" in item ? (
                <div key={item.label} className="py-2">
                  <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-widest text-charcoal-400 dark:text-charcoal-500">
                    {item.label}
                  </p>
                  {item.children.map((child) => (
                    <a
                      key={child.label}
                      href={child.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-medium text-charcoal-800 hover:bg-charcoal-50 dark:text-charcoal-200 dark:hover:bg-charcoal-800"
                    >
                      {child.icon ? <LexusSuvIcon className="text-burgundy-600 dark:text-burgundy-400" /> : null}
                      {child.label}
                    </a>
                  ))}
                </div>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-2.5 text-sm font-medium text-charcoal-800 hover:bg-charcoal-50 dark:text-charcoal-200 dark:hover:bg-charcoal-800"
                >
                  {item.label}
                </a>
              )
            )}
            <Button href="/#fleet" size="sm" className="mt-3 w-full" onClick={() => setOpen(false)}>
              Select A Car
            </Button>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
