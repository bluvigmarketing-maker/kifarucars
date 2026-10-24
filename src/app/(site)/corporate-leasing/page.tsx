import type { Metadata } from "next";
import { CalendarClock, ShieldCheck, UserRound, Wrench } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CorporateQuoteForm } from "@/components/site/CorporateQuoteForm";
import { BUSINESS } from "@/lib/placeholder-data";

export const metadata: Metadata = {
  title: "Corporate Leasing",
  description:
    "Long-term Toyota Land Cruiser Prado leasing for companies across Kenya — fixed monthly costs, maintenance and insurance included. Request a quote from Kifaru Car Hire.",
};

const BENEFITS = [
  {
    Icon: CalendarClock,
    title: "Flexible terms",
    body: "Leases from 3 months to multi-year, sized to your team and budget cycle.",
  },
  {
    Icon: Wrench,
    title: "Fully maintained",
    body: "Servicing, repairs and replacement vehicles handled by us — your cars stay on the road.",
  },
  {
    Icon: ShieldCheck,
    title: "Insured and compliant",
    body: "Comprehensive cover and up-to-date documentation on every vehicle in your fleet.",
  },
  {
    Icon: UserRound,
    title: "Chauffeurs available",
    body: "Add professional, vetted drivers to any vehicle on your lease.",
  },
];

export default function CorporateLeasingPage() {
  return (
    <div className="py-20 sm:py-24">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <div>
            <SectionHeading eyebrow="Corporate Leasing" title="A Prado Fleet For Your Business" />
            <p className="mt-4 max-w-xl text-charcoal-600 dark:text-charcoal-300">
              Lease Toyota Land Cruiser Prados for your company on a fixed monthly cost, with
              maintenance, insurance and support across {BUSINESS.locations.join(", ")}. Tell us what
              you need and we&apos;ll put together a quote.
            </p>

            <ul className="mt-10 space-y-6">
              {BENEFITS.map(({ Icon, title, body }) => (
                <li key={title} className="flex gap-4">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gold-500/60 text-burgundy-600 dark:border-gold-400/50 dark:text-burgundy-400">
                    <Icon size={18} />
                  </span>
                  <div>
                    <p className="font-medium text-charcoal-950 dark:text-white">{title}</p>
                    <p className="mt-0.5 text-sm text-charcoal-600 dark:text-charcoal-300">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div id="quote" className="scroll-mt-24">
            <h2 className="font-display text-2xl text-charcoal-950 dark:text-white">Request A Leasing Quote</h2>
            <p className="mt-1 mb-6 text-sm text-charcoal-500 dark:text-charcoal-400">
              Prefer to talk? Call {BUSINESS.phone}.
            </p>
            <CorporateQuoteForm />
          </div>
        </div>
      </Container>
    </div>
  );
}
