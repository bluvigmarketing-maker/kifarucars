"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FAQS } from "@/lib/placeholder-data";
import { cn } from "@/lib/cn";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faqs" className="py-20 sm:py-24">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionHeading eyebrow="FAQs" title="Frequently Asked Questions" />
            <p className="mt-5 text-charcoal-600">
              At Kifaru Car Hire, we understand the importance of clarity when
              choosing car hire or leasing solutions. Below are some of the
              common questions our clients ask.
            </p>
          </div>

          <div className="divide-y divide-charcoal-100 rounded-2xl border border-charcoal-100">
            {FAQS.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-medium text-charcoal-900">{faq.question}</span>
                    <ChevronDown
                      size={18}
                      className={cn(
                        "flex-shrink-0 text-charcoal-500 transition-transform",
                        isOpen && "rotate-180 text-burgundy-600"
                      )}
                    />
                  </button>
                  {isOpen ? (
                    <div className="px-5 pb-4 text-sm text-charcoal-600">{faq.answer}</div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
