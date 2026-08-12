import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BUSINESS } from "@/lib/placeholder-data";
import { ShieldCheck, ShipWheel, Sliders, UserCheck } from "lucide-react";

const REASONS = [
  {
    Icon: ShieldCheck,
    title: "Own & Manage Our Fleet In-House",
    body: "All vehicles are managed and serviced by our expert team in our own facilities, ensuring safety, reliability and quality.",
  },
  {
    Icon: UserCheck,
    title: "Trained Chauffeurs For Executive Travel",
    body: "Our professional drivers are experienced, discreet and dependable for executive and VIP clients.",
  },
  {
    Icon: Sliders,
    title: `Proven Reliability & Experience`,
    body: `With over ${BUSINESS.yearsInBusiness} years in the industry, we're a trusted partner for corporate mobility across Kenya.`,
  },
  {
    Icon: ShipWheel,
    title: "Flexible Hire & Leasing Solutions",
    body: "We tailor every plan to suit your short- or long-term vehicle needs, whether you're a corporate client or an expat.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading eyebrow="Why Choose Us" title="Get Reliable Vehicle Solutions For Corporate And Expat Needs In Kenya" />
            <p className="mt-5 text-charcoal-600 dark:text-charcoal-300">
              Whatever your mobility needs, our team is on hand to design a
              solution that fits your business.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Button href="#enquiry">Make An Enquiry</Button>
              <a href={`tel:${BUSINESS.phone}`} className="text-sm font-medium text-charcoal-700 hover:text-burgundy-700 dark:text-charcoal-300 dark:hover:text-burgundy-400">
                {BUSINESS.phone}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {REASONS.map(({ Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-charcoal-100 p-5 dark:border-charcoal-800">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-burgundy-50 text-burgundy-600 dark:bg-burgundy-950/40 dark:text-burgundy-400">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 font-semibold text-charcoal-950 dark:text-white">{title}</h3>
                <p className="mt-1.5 text-sm text-charcoal-600 dark:text-charcoal-300">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
