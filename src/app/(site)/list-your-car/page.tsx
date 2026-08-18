import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VehicleApplicationForm } from "@/components/site/VehicleApplicationForm";

export const metadata: Metadata = {
  title: "List Your Car",
  description:
    "Apply to have your vehicle leased through the Kifaru Car Hire fleet — submit your vehicle details, ownership documents, and contact information.",
};

export default function ListYourCarPage() {
  return (
    <div className="py-20 sm:py-24">
      <Container className="max-w-3xl">
        <SectionHeading
          eyebrow="Car Owners"
          title="Apply To Have Your Car Leased"
        />
        <p className="mt-4 max-w-2xl text-charcoal-600 dark:text-charcoal-300">
          Own a well-maintained vehicle? Submit its details below and a copy of
          your logbook, and our team will review your application to join the
          Kifaru Car Hire fleet.
        </p>

        <div className="mt-10">
          <VehicleApplicationForm />
        </div>
      </Container>
    </div>
  );
}
