import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";

const SERVICES = [
  { label: "Corporate Car Hire", href: "#enquiry" },
  { label: "Corporate Leasing", href: "#enquiry" },
  { label: "Expat Car Hire", href: "#enquiry" },
];

export function ServicesSection() {
  return (
    <section id="services" className="bg-charcoal-50 py-20 sm:py-24">
      <Container className="text-center">
        <SectionHeading eyebrow="Our Services" title="Tailored Vehicle Solutions" align="center" />
        <p className="mx-auto mt-5 max-w-2xl text-charcoal-600">
          We provide tailored vehicle solutions for corporate clients and
          expatriates across Kenya. Our services include short-term and
          long-term rentals (self or chauffeur-driven), long-term leases, and
          fully managed fleet services trusted by businesses in Nairobi,
          Mombasa and Nanyuki.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-4">
          {SERVICES.map((service) => (
            <Button key={service.label} href={service.href}>
              {service.label} &rarr;
            </Button>
          ))}
        </div>
      </Container>
    </section>
  );
}
