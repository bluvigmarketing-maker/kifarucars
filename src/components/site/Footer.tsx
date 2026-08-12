import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { BUSINESS } from "@/lib/placeholder-data";
import { FacebookIcon, InstagramIcon, LinkedInIcon, XIcon } from "@/components/site/SocialIcons";
import { NewsletterForm } from "@/components/site/NewsletterForm";

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
  { label: "Facebook", Icon: FacebookIcon, href: "#" },
  { label: "Instagram", Icon: InstagramIcon, href: "#" },
  { label: "LinkedIn", Icon: LinkedInIcon, href: "#" },
  { label: "Twitter", Icon: XIcon, href: "#" },
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
          <NewsletterForm />
        </div>

        <div className="grid grid-cols-1 gap-10 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gold-400/70 p-1 shadow-[0_0_12px_-2px_rgba(212,185,106,0.5)]">
                <Image src="/images/kifaru-icon.png" alt="" width={388} height={317} className="h-full w-auto" />
              </span>
              <span className="font-display text-xl text-white">Kifaru Car Hire</span>
            </div>
            <p className="mt-3 text-sm text-charcoal-400">
              Reliable Toyota Land Cruiser Prado hire, leasing and chauffeur
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
