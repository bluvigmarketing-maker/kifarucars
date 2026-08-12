import Image from "next/image";
import { Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { BUSINESS } from "@/lib/placeholder-data";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-charcoal-950 text-white">
      <Image
        src="/images/hero-bg-desktop.png"
        alt=""
        fill
        priority
        sizes="(min-width: 1024px) 100vw, 10px"
        className="hidden object-cover lg:block"
      />
      <Image
        src="/images/hero-bg-mobile.png"
        alt=""
        fill
        priority
        sizes="(max-width: 1023px) 100vw, 10px"
        className="object-cover lg:hidden"
      />

      <div className="absolute inset-0 bg-charcoal-950/55" />
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal-950 via-charcoal-950/70 to-transparent lg:w-2/3" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-transparent to-transparent" />

      <Container className="relative py-20 sm:py-28">
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
            <Button href="#enquiry" size="lg">
              Get A Quote
            </Button>
            <Button href="#enquiry" variant="outline" size="lg" className="border-white/30 text-white hover:border-white hover:text-white">
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
    </section>
  );
}
