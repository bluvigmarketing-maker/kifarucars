"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const NAV_LINKS = [
  { label: "Corporate Car Hire", href: "#services" },
  { label: "Corporate Leasing", href: "#services" },
  { label: "Expat Car Hire", href: "#services" },
  { label: "Our Fleet", href: "#fleet" },
  { label: "About Us", href: "#about" },
  { label: "Contact Us", href: "#enquiry" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-charcoal-100 bg-white/95 backdrop-blur dark:border-charcoal-800 dark:bg-charcoal-950/95">
      <Container className="flex h-18 items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/kifaru-icon.png" alt="" width={388} height={317} priority className="h-10 w-auto" />
          <span className="font-display text-2xl font-semibold text-charcoal-950 dark:text-white">
            Kifaru
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest text-burgundy-600 dark:text-burgundy-400">
            Car Hire
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-charcoal-700 transition-colors hover:text-burgundy-700 dark:text-charcoal-300 dark:hover:text-burgundy-400"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <Button href="#enquiry" size="sm">
            Get A Quote
          </Button>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex items-center justify-center rounded-full p-2 text-charcoal-900 dark:text-white"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </Container>

      {open ? (
        <div className="border-t border-charcoal-100 bg-white lg:hidden dark:border-charcoal-800 dark:bg-charcoal-950">
          <Container className="flex flex-col gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm font-medium text-charcoal-800 hover:bg-charcoal-50 dark:text-charcoal-200 dark:hover:bg-charcoal-800"
              >
                {link.label}
              </a>
            ))}
            <Button href="#enquiry" size="sm" className="mt-2 w-full" onClick={() => setOpen(false)}>
              Get A Quote
            </Button>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
