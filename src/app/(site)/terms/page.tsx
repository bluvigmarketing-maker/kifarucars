import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BUSINESS } from "@/lib/placeholder-data";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for Kifaru Car Hire's vehicle leasing, fleet-partner, and client portal services.",
};

const LAST_UPDATED = "18 August 2026"; // PLACEHOLDER — update whenever this page changes

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="prose-legal mt-10 space-y-8 text-charcoal-700 dark:text-charcoal-300">
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl text-charcoal-950 dark:text-white">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed sm:text-base">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="py-20 sm:py-24">
      <Container className="max-w-3xl">
        <SectionHeading eyebrow="Legal" title="Terms of Service" />
        <p className="mt-4 text-sm text-charcoal-500 dark:text-charcoal-400">
          Last updated: {LAST_UPDATED}
        </p>

        <Prose>
          <Section title="1. Introduction">
            <p>
              These Terms of Service (&quot;Terms&quot;) govern your use of the {BUSINESS.name}{" "}
              website and platform (the &quot;Platform&quot;), including our vehicle hire and
              leasing services, the car-owner fleet-partner application process, and the client
              portal made available to registered lessees. By using the Platform, applying to
              list a vehicle, or entering into a lease with us, you agree to these Terms.
            </p>
          </Section>

          <Section title="2. Car-Owner Fleet Partner Applications">
            <p>
              Vehicle owners may apply to have their vehicle leased through {BUSINESS.name} by
              submitting an application through the Platform, including vehicle details (make,
              model, year, mileage, transmission, chassis number, registration number), owner
              details, and a copy of the vehicle&apos;s logbook. Submitting an application does not
              guarantee acceptance. We review applications at our discretion and may request
              additional documentation, an inspection, or valuation before a vehicle is admitted
              to the fleet.
            </p>
            <p>
              Documents submitted (including logbook copies) are used solely to verify ownership
              and vehicle condition and are handled as described in our{" "}
              <a href="/privacy" className="text-burgundy-600 underline dark:text-burgundy-400">
                Privacy Policy
              </a>
              . Owners are responsible for ensuring submitted information and documents are
              accurate, current, and lawfully theirs to provide.
            </p>
          </Section>

          <Section title="3. Client Portal, Leases &amp; Extension Requests">
            <p>
              Once a client is registered as an active lessee, we provide portal access (via a
              personal access link) where the client can view their lease costs, duration, and
              status, and submit requests to extend the lease term. Submitting an extension
              request does not automatically extend the lease — extensions are subject to vehicle
              availability and confirmation from {BUSINESS.name}.
            </p>
            <p>
              Access links are personal to the client they are issued to and must not be shared.
              You are responsible for keeping your access link and any associated credentials
              confidential, and for all activity that occurs through your portal access.
            </p>
          </Section>

          <Section title="4. Payments &amp; Fees">
            <p>
              Lease costs, deposits, and any additional fees will be communicated to you before
              your lease begins and will be reflected in your client portal. Late payments,
              damage, or unauthorized use of a leased vehicle may result in additional charges as
              set out in your individual lease agreement.
            </p>
          </Section>

          <Section title="5. Vehicle Use &amp; Condition">
            <p>
              Vehicles leased through the Platform must be used lawfully and in accordance with
              the terms of the individual lease agreement signed between {BUSINESS.name} and the
              client. {BUSINESS.name} is responsible for maintaining vehicles supplied through the
              fleet to a roadworthy standard for the duration of an active lease.
            </p>
          </Section>

          <Section title="6. Reviews">
            <p>
              Former users may submit reviews of vehicles or services they have used. Reviews are
              moderated before publication and should reflect genuine experiences. We may decline
              to publish, or may remove, reviews that are false, abusive, or unrelated to the
              services provided.
            </p>
          </Section>

          <Section title="7. Intellectual Property">
            <p>
              All content on the Platform, including text, images, vehicle photos and videos, and
              branding, is owned by or licensed to {BUSINESS.name} and may not be reproduced
              without permission, except as necessary to use the Platform as intended.
            </p>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>
              To the fullest extent permitted by law, {BUSINESS.name} is not liable for indirect
              or consequential losses arising from use of the Platform. Nothing in these Terms
              limits liability that cannot be limited under applicable law.
            </p>
          </Section>

          <Section title="9. Changes to These Terms">
            <p>
              We may update these Terms from time to time. Material changes will be reflected by
              an updated &quot;Last updated&quot; date above. Continued use of the Platform after
              changes take effect constitutes acceptance of the revised Terms.
            </p>
          </Section>

          <Section title="10. Contact Us">
            <p>
              Questions about these Terms can be sent to{" "}
              <a href={`mailto:${BUSINESS.email}`} className="text-burgundy-600 underline dark:text-burgundy-400">
                {BUSINESS.email}
              </a>{" "}
              or {BUSINESS.phone}.
            </p>
          </Section>

          <p className="text-xs text-charcoal-400 dark:text-charcoal-500">
            This page is a general template and has not been reviewed by a lawyer. Please have it
            reviewed by qualified legal counsel before relying on it for your business.
          </p>
        </Prose>
      </Container>
    </div>
  );
}
