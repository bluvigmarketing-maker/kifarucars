"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VehicleCard } from "@/components/site/VehicleCard";
import type { Vehicle } from "@/lib/types";

export function FleetSection({ vehicles }: { vehicles: Vehicle[] }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  return (
    <section id="fleet" className="py-20 sm:py-24">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading eyebrow="Our Fleet" title="Vehicles Ready For Every Journey" />

          <button
            type="button"
            onClick={() => setSoundEnabled((v) => !v)}
            className="inline-flex items-center gap-2 self-start rounded-full border border-charcoal-200 px-3.5 py-2 text-xs font-medium text-charcoal-600 transition-colors hover:border-burgundy-400 hover:text-burgundy-700 sm:self-auto dark:border-charcoal-700 dark:text-charcoal-300 dark:hover:border-burgundy-400 dark:hover:text-burgundy-400"
            aria-pressed={soundEnabled}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            Engine sound on hover: {soundEnabled ? "On" : "Off"}
          </button>
        </div>

        <div className="relative mt-8">
          <div
            ref={scrollerRef}
            className="flex gap-5 overflow-x-auto pb-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="w-[280px] flex-shrink-0 sm:w-[310px]">
                <VehicleCard vehicle={vehicle} soundEnabled={soundEnabled} />
              </div>
            ))}
            {vehicles.length === 0 ? (
              <p className="py-10 text-charcoal-500 dark:text-charcoal-400">
                No vehicles available right now.
              </p>
            ) : null}
          </div>

          {vehicles.length > 3 ? (
            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                aria-label="Scroll left"
                onClick={() => scrollBy(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal-200 text-charcoal-700 hover:border-burgundy-400 hover:text-burgundy-700 dark:border-charcoal-700 dark:text-charcoal-300 dark:hover:border-burgundy-400 dark:hover:text-burgundy-400"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                aria-label="Scroll right"
                onClick={() => scrollBy(1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal-200 text-charcoal-700 hover:border-burgundy-400 hover:text-burgundy-700 dark:border-charcoal-700 dark:text-charcoal-300 dark:hover:border-burgundy-400 dark:hover:text-burgundy-400"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-8 text-center">
          <Button href="#enquiry" variant="outline">
            View All Fleet
          </Button>
        </div>
      </Container>
    </section>
  );
}
