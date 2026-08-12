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
            <p className="mt-5 text-charcoal-600 dark:text-charcoal-300">
              At Kifaru Car Hire, we understand the importance of clarity when
              choosing car hire or leasing solutions. Below are some of the
              common questions our clients ask.
            </p>
          </div>

          <div className="divide-y divide-gold-500/40 rounded-2xl border-2 border-gold-500/60 shadow-[0_0_18px_-6px_rgba(201,162,39,0.45)] dark:divide-gold-400/30 dark:border-gold-400/50 dark:shadow-[0_0_18px_-6px_rgba(212,185,106,0.35)]">
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
                    <span className="font-medium text-charcoal-900 dark:text-white">{faq.question}</span>
                    <ChevronDown
                      size={18}
                      className={cn(
                        "flex-shrink-0 text-charcoal-500 transition-transform dark:text-charcoal-400",
                        isOpen && "rotate-180 text-burgundy-600 dark:text-burgundy-400"
                      )}
                    />
                  </button>
                  {isOpen ? (
                    <div className="px-5 pb-4 text-sm text-charcoal-600 dark:text-charcoal-300">{faq.answer}</div>
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
