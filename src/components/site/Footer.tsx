import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { BUSINESS } from "@/lib/placeholder-data";

const FOOTER_LINKS = [
  { label: "Home", href: "/" },
  { label: "Our Fleet", href: "#fleet" },
  { label: "Expat Car Hire", href: "#services" },
  { label: "About Us", href: "#about" },
  { label: "Corporate Leasing", href: "#services" },
  { label: "Contact Us", href: "#enquiry" },
  { label: "FAQs", href: "#faqs" },
];

const SOCIALS = [
  { label: "Facebook", Icon: Facebook, href: "#" },
  { label: "Instagram", Icon: Instagram, href: "#" },
  { label: "LinkedIn", Icon: Linkedin, href: "#" },
  { label: "Twitter", Icon: Twitter, href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-charcoal-950 text-charcoal-100">
      <Container className="py-14">
        <div className="flex flex-col justify-between gap-8 border-b border-white/10 pb-10 lg:flex-row lg:items-center">
          <div>
            <p className="font-display text-2xl text-white">
              Sign up for exclusive deals, latest news and more.
            </p>
            <p className="mt-1 text-sm text-charcoal-400">
              Be the first to know. Sign up to our newsletter.
            </p>
          </div>
          <form className="flex w-full max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              required
              placeholder="Your email address"
              className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-charcoal-400 focus:border-burgundy-400 focus:outline-none"
            />
            <Button type="submit" size="sm">
              Subscribe
            </Button>
          </form>
        </div>

        <div className="grid grid-cols-1 gap-10 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="font-display text-xl text-white">Kifaru Car Hire</span>
            <p className="mt-3 text-sm text-charcoal-400">
              Reliable corporate and expat car hire, leasing and chauffeur
              services across {BUSINESS.locations.join(", ")}.
            </p>
            <div className="mt-4 flex gap-3">
              {SOCIALS.map(({ label, Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-charcoal-200 transition-colors hover:border-burgundy-400 hover:text-white"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-charcoal-400">
              Explore
            </h3>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-charcoal-200 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-charcoal-400">
              Locations
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-charcoal-200">
              {BUSINESS.locations.map((loc) => (
                <li key={loc}>{loc}, Kenya</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-charcoal-400">
              Contact
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-charcoal-200">
              <li>
                <a href={`tel:${BUSINESS.phone}`} className="hover:text-white">
                  {BUSINESS.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${BUSINESS.email}`} className="hover:text-white">
                  {BUSINESS.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-charcoal-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Kifaru Car Hire. All rights reserved.</p>
          <p>Web design by Kifaru Car Hire</p>
        </div>
      </Container>
    </footer>
  );
}
