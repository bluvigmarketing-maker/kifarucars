"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VehicleCard } from "@/components/site/VehicleCard";
import { cn } from "@/lib/cn";
import type { PublicVehicle, VehicleCategory } from "@/lib/types";

export function FleetSection({
  vehicles: allVehicles,
  categories,
}: {
  vehicles: PublicVehicle[];
  categories: VehicleCategory[];
}) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Only offer filters for categories that actually have cars listed.
  const filters = categories.filter((c) => allVehicles.some((v) => v.category_id === c.id));
  const vehicles = activeCategory
    ? allVehicles.filter((v) => v.category_id === activeCategory)
    : allVehicles;

  const selectCategory = (id: string | null) => {
    setActiveCategory(id);
    setActiveSlide(0);
    scrollerRef.current?.scrollTo({ left: 0 });
  };

  const slideTo = (index: number) => {
    const scroller = scrollerRef.current;
    const card = scroller?.children[index] as HTMLElement | undefined;
    if (scroller && card) {
      scroller.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
    }
  };

  const step = (dir: 1 | -1) => {
    slideTo(Math.min(Math.max(activeSlide + dir, 0), vehicles.length - 1));
  };

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const onScroll = () => {
      const cards = Array.from(scroller.children) as HTMLElement[];
      const { scrollLeft } = scroller;
      let closest = 0;
      let closestDistance = Infinity;
      cards.forEach((card, i) => {
        const distance = Math.abs(card.offsetLeft - scrollLeft);
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = i;
        }
      });
      setActiveSlide(closest);
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [vehicles.length]);

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

        {filters.length > 1 ? (
          <div role="group" aria-label="Filter by category" className="mt-8 flex flex-wrap gap-2">
            {[{ id: null, name: "All" }, ...filters].map((filter) => {
              const active = activeCategory === filter.id;
              return (
                <button
                  key={filter.id ?? "all"}
                  type="button"
                  aria-pressed={active}
                  onClick={() => selectCategory(filter.id)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "border-burgundy-600 bg-burgundy-600 text-white"
                      : "border-charcoal-200 text-charcoal-600 hover:border-burgundy-400 hover:text-burgundy-700 dark:border-charcoal-700 dark:text-charcoal-300 dark:hover:border-burgundy-400 dark:hover:text-burgundy-400"
                  )}
                >
                  {filter.name}
                </button>
              );
            })}
          </div>
        ) : null}

        <div className={cn("relative", filters.length > 1 ? "mt-6" : "mt-8")}>
          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="w-[280px] flex-shrink-0 snap-start sm:w-[310px]">
                <VehicleCard vehicle={vehicle} soundEnabled={soundEnabled} />
              </div>
            ))}
            {vehicles.length === 0 ? (
              <p className="py-10 text-charcoal-500 dark:text-charcoal-400">
                No vehicles available right now.
              </p>
            ) : null}
          </div>

          {vehicles.length > 1 ? (
            <div className="mt-5 flex items-center justify-between">
              <div className="flex gap-1.5">
                {vehicles.map((vehicle, i) => (
                  <button
                    key={vehicle.id}
                    type="button"
                    aria-label={`Go to slide ${i + 1}`}
                    aria-current={i === activeSlide}
                    onClick={() => slideTo(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === activeSlide
                        ? "w-6 bg-gold-500 dark:bg-gold-400"
                        : "w-1.5 bg-charcoal-200 dark:bg-charcoal-700"
                    )}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label="Previous vehicle"
                  disabled={activeSlide === 0}
                  onClick={() => step(-1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal-200 text-charcoal-700 hover:border-burgundy-400 hover:text-burgundy-700 disabled:pointer-events-none disabled:opacity-40 dark:border-charcoal-700 dark:text-charcoal-300 dark:hover:border-burgundy-400 dark:hover:text-burgundy-400"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  aria-label="Next vehicle"
                  disabled={activeSlide === vehicles.length - 1}
                  onClick={() => step(1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal-200 text-charcoal-700 hover:border-burgundy-400 hover:text-burgundy-700 disabled:pointer-events-none disabled:opacity-40 dark:border-charcoal-700 dark:text-charcoal-300 dark:hover:border-burgundy-400 dark:hover:text-burgundy-400"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-8 text-center">
          <Button href="/pricing" variant="outline">
            View All Rates
          </Button>
        </div>
      </Container>
    </section>
  );
}
