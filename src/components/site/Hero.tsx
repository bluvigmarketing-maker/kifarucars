import Image from "next/image";
import { Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { BUSINESS } from "@/lib/placeholder-data";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-charcoal-950 text-white">
      {/* Desktop: full-bleed photo, nudged right so the SUV sits beside the copy. */}
      <Image
        src="/images/hero-kifaru.jpg"
        alt="Black Kifaru SUV with gold trim in front of the Nairobi skyline"
        fill
        priority
        sizes="(min-width: 1024px) 100vw, 10px"
        className="hidden object-cover object-[65%_80%] lg:block"
      />
      <div className="absolute inset-0 hidden bg-charcoal-950/25 lg:block" />
      <div className="absolute inset-y-0 left-0 hidden w-3/5 bg-gradient-to-r from-charcoal-950 via-charcoal-950/80 to-transparent lg:block" />
      <div className="absolute inset-0 hidden bg-gradient-to-t from-charcoal-950/70 via-transparent to-transparent lg:block" />

      <Container className="relative pt-16 pb-10 sm:pt-20 lg:py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-burgundy-400">
            {BUSINESS.tagline}
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
            Kifaru Car Hire &amp; Leasing
          </h1>
          <p className="mt-5 max-w-lg text-charcoal-300">
            We own and manage our own fleet of Toyota Land Cruiser Prados —
            self-drive or with a professional chauffeur — in{" "}
            {BUSINESS.locations.join(", ")}.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button href="#fleet" size="lg">
              Select A Car
            </Button>
            <Button href="#enquiry" variant="outline" size="lg" className="border-gold-400/70 text-white hover:border-gold-300 hover:text-white">
              Request A Callback
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-8">
            <div>
              <p className="font-display text-3xl">{BUSINESS.vehicleCount}</p>
              <p className="text-sm text-charcoal-400">Vehicles</p>
            </div>
            <div>
              <p className="font-display text-3xl">{BUSINESS.driverCount}</p>
              <p className="text-sm text-charcoal-400">Drivers</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5">
              <div className="flex items-center gap-0.5 text-burgundy-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < Math.round(BUSINESS.googleRating) ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <div className="text-xs text-charcoal-300">
                <span className="font-semibold text-white">{BUSINESS.googleRating}</span> Google
                Rating · {BUSINESS.googleReviewCount} reviews
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Mobile/tablet: a portrait crop would cut the car in half, so show
          the whole photo below the copy, faded into the dark background. */}
      <div className="relative aspect-[1376/768] w-full lg:hidden">
        <Image
          src="/images/hero-kifaru.jpg"
          alt="Black Kifaru SUV with gold trim in front of the Nairobi skyline"
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 10px"
          className="object-cover"
        />
        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-charcoal-950 to-transparent" />
      </div>
    </section>
  );
}
