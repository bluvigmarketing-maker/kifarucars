import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BUSINESS } from "@/lib/placeholder-data";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Kifaru Car Hire collects, uses, and protects information from website visitors, car-owner applicants, and client portal users.",
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

export default function PrivacyPage() {
  return (
    <div className="py-20 sm:py-24">
      <Container className="max-w-3xl">
        <SectionHeading eyebrow="Legal" title="Privacy Policy" />
        <p className="mt-4 text-sm text-charcoal-500 dark:text-charcoal-400">
          Last updated: {LAST_UPDATED}
        </p>

        <Prose>
          <Section title="1. Information We Collect">
            <p>We collect information you provide directly to us, including:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong>Enquiry &amp; newsletter details:</strong> name, phone, email, and message
                content submitted through our enquiry and newsletter forms.
              </li>
              <li>
                <strong>Car-owner fleet applications:</strong> owner name and contact details,
                vehicle details (make, model, year, mileage, transmission, chassis number,
                registration number), additional vehicle features, and a copy of the vehicle
                logbook (photo or document upload).
              </li>
              <li>
                <strong>Client portal accounts:</strong> name, contact details, lease terms,
                costs, and any extension requests you submit once registered as an active client.
              </li>
              <li>
                <strong>Reviews:</strong> your name and any feedback you choose to submit about a
                vehicle or service.
              </li>
            </ul>
          </Section>

          <Section title="2. How We Use Information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Respond to enquiries and provide quotes;</li>
              <li>
                Review and process car-owner fleet applications, including verifying ownership
                via submitted logbook documents;
              </li>
              <li>Set up and maintain client portal access, and manage leases and extension requests;</li>
              <li>Publish reviews submitted by former users, with the name provided;</li>
              <li>Send newsletter updates to those who opt in; and</li>
              <li>Maintain the security and proper functioning of the Platform.</li>
            </ul>
          </Section>

          <Section title="3. Logbook &amp; Vehicle Documents">
            <p>
              Logbook copies and other ownership documents uploaded during a fleet application are
              stored securely and accessed only by authorized {BUSINESS.name} staff for the
              purpose of verifying the application. We do not share these documents with third
              parties except as required to complete the leasing arrangement (for example,
              insurance or regulatory compliance) or where required by law.
            </p>
          </Section>

          <Section title="4. Vehicle Photos &amp; Video">
            <p>
              Photos and short video clips of fleet vehicles uploaded by {BUSINESS.name} staff are
              used to showcase vehicles on the Platform (including on vehicle listing pages and
              hover previews). If a vehicle is owned by a fleet partner, we display this media as
              part of operating the leasing service and will remove it if the vehicle is withdrawn
              from the fleet.
            </p>
          </Section>

          <Section title="5. Client Portal Access Links">
            <p>
              When you are registered as an active client, we issue you a personal access link to
              your portal. Treat this link like a password — do not share it. We may log access
              to the portal for security purposes.
            </p>
          </Section>

          <Section title="6. Sharing of Information">
            <p>
              We do not sell personal information. We may share information with service providers
              who help us operate the Platform (for example, hosting and data storage providers),
              and where required by law or to protect our legal rights.
            </p>
          </Section>

          <Section title="7. Data Retention">
            <p>
              We retain application, lease, and portal information for as long as needed to
              provide our services and to meet legal, accounting, or reporting obligations. You
              may request deletion of your information subject to any retention we are legally
              required to keep.
            </p>
          </Section>

          <Section title="8. Your Rights">
            <p>
              You may request access to, correction of, or deletion of your personal information
              by contacting us using the details below.
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. Material changes will be
              reflected by an updated &quot;Last updated&quot; date above.
            </p>
          </Section>

          <Section title="10. Contact Us">
            <p>
              Questions about this Privacy Policy, or requests regarding your data, can be sent to{" "}
              <a href={`mailto:${BUSINESS.email}`} className="text-burgundy-600 underline dark:text-burgundy-400">
                {BUSINESS.email}
              </a>{" "}
              or {BUSINESS.phone}.
            </p>
          </Section>

          <p className="text-xs text-charcoal-400 dark:text-charcoal-500">
            This page is a general template and has not been reviewed by a lawyer. Please have it
            reviewed by qualified legal counsel — and checked against applicable data protection
            law (e.g. Kenya&apos;s Data Protection Act) — before relying on it for your business.
          </p>
        </Prose>
      </Container>
    </div>
  );
}
