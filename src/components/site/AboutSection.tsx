import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { BUSINESS } from "@/lib/placeholder-data";

export function AboutSection() {
  return (
    <section id="about" className="py-20 sm:py-24">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-burgundy-700 px-6 py-12 text-white sm:px-12 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-burgundy-200">
            About Us
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl sm:text-4xl">
            Over {BUSINESS.yearsInBusiness} Years Of Trusted Corporate Vehicle
            Solutions
          </h2>
          <p className="mt-5 max-w-2xl text-burgundy-100">
            Kifaru Car Hire has been a trusted partner for corporate car hire
            and leasing across Kenya. Based in {BUSINESS.locations.join(", ")}
            , our dedicated team and extensive fleet ensure premium service
            wherever you operate. From self-drive to chauffeur-driven rentals
            to long-term leases and fully managed fleet services, we tailor
            every solution to meet your corporate mobility needs.
          </p>
          <Button href="#enquiry" variant="secondary" className="mt-8 bg-white text-burgundy-700 hover:bg-burgundy-50">
            View More
          </Button>
        </div>
      </Container>
    </section>
  );
}
