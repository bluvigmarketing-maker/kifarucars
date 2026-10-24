import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Cog, Fuel, Gauge, Settings2, Star, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { BookingPanel } from "@/components/site/BookingPanel";
import { VehicleGallery } from "@/components/site/VehicleGallery";
import { getReviewsForVehicle, getUnavailableRanges, getVehicleForDetail } from "@/lib/data";
import { isMpesaConfigured } from "@/lib/mpesa/daraja";
import { isServiceRoleConfigured } from "@/lib/supabase/admin";
import { vehicleSubtitle, vehicleTitle } from "@/lib/vehicle-display";

export async function generateMetadata({
  params,
}: PageProps<"/fleet/[id]">): Promise<Metadata> {
  const { id } = await params;
  const vehicle = await getVehicleForDetail(id);
  if (!vehicle) return { title: "Vehicle" };
  const title = vehicleTitle(vehicle);
  const specs = [vehicle.transmission, vehicle.seats ? `${vehicle.seats} seats` : "", vehicle.fuel_type]
    .filter(Boolean)
    .join(", ");
  return {
    title: vehicle.year ? `${title} (${vehicle.year})` : title,
    description: `${title} — ${specs}. Available for hire and leasing from Kifaru Car Hire.`,
  };
}

export default async function VehicleDetailPage({ params }: PageProps<"/fleet/[id]">) {
  const { id } = await params;
  const [vehicle, reviews, unavailable] = await Promise.all([
    getVehicleForDetail(id),
    getReviewsForVehicle(id),
    getUnavailableRanges(id),
  ]);

  if (!vehicle) notFound();

  const title = vehicleTitle(vehicle);
  const subtitle = vehicleSubtitle(vehicle);
  // Every detail is optional — only list the ones that were filled in.
  const specs = [
    { label: vehicle.transmission, Icon: Settings2 },
    { label: vehicle.seats ? `${vehicle.seats} Passengers` : "", Icon: Users },
    { label: vehicle.fuel_type, Icon: Fuel },
    { label: vehicle.engine_capacity, Icon: Cog },
    { label: vehicle.mileage != null ? `${vehicle.mileage.toLocaleString()} km` : "", Icon: Gauge },
  ].filter((spec) => spec.label);

  return (
    <div className="py-16 sm:py-20">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <VehicleGallery
            images={[vehicle.image_url, ...vehicle.gallery_urls]}
            videoUrl={vehicle.video_url}
            alt={title}
          />

          <div>
            {subtitle ? (
              <p className="text-xs font-semibold uppercase tracking-wide text-burgundy-600 dark:text-burgundy-400">
                {subtitle}
              </p>
            ) : null}
            <h1 className="mt-1 font-display text-3xl text-charcoal-950 sm:text-4xl dark:text-white">
              {vehicle.name || title}
            </h1>

            <dl className="mt-6 grid grid-cols-2 gap-y-3 text-sm text-charcoal-600 sm:grid-cols-3 dark:text-charcoal-300">
              {specs.map(({ label, Icon }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon size={16} className="text-charcoal-400 dark:text-charcoal-500" />
                  {label}
                </div>
              ))}
            </dl>

            {vehicle.additional_features.length > 0 ? (
              <div className="mt-6">
                <p className="text-sm font-semibold text-charcoal-900 dark:text-white">Features</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {vehicle.additional_features.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full bg-charcoal-50 px-3 py-1.5 text-xs text-charcoal-600 dark:bg-charcoal-800 dark:text-charcoal-300"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="#book" size="lg">
                Select This Car
              </Button>
              <Button href="/list-your-car" variant="outline" size="lg">
                List Your Own Car
              </Button>
            </div>
          </div>
        </div>

        <section id="book" className="mt-16 scroll-mt-24 border-t border-charcoal-100 pt-12 dark:border-charcoal-800">
          <h2 className="font-display text-2xl text-charcoal-950 dark:text-white">Book Your Dates</h2>
          <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">
            Choose your pick-up and return dates, then pay with M-Pesa to confirm. Crossed-out days are
            already booked.
          </p>
          <div className="mt-6">
            <BookingPanel
              vehicle={vehicle}
              unavailable={unavailable}
              onlinePayment={isMpesaConfigured && isServiceRoleConfigured}
            />
          </div>
        </section>

        {reviews.length > 0 ? (
          <div className="mt-16 border-t border-charcoal-100 pt-12 dark:border-charcoal-800">
            <h2 className="font-display text-2xl text-charcoal-950 dark:text-white">
              What Former Users Say
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl border-2 border-gold-500/60 bg-white p-6 shadow-[0_0_18px_-6px_rgba(201,162,39,0.45)] dark:border-gold-400/50 dark:shadow-[0_0_18px_-6px_rgba(212,185,106,0.35)] dark:bg-charcoal-900"
                >
                  <div className="flex items-center gap-0.5 text-burgundy-600 dark:text-burgundy-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-charcoal-700 dark:text-charcoal-300">
                    &ldquo;{review.body}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-charcoal-500 dark:text-charcoal-400">
                    <span className="font-semibold text-charcoal-900 dark:text-white">
                      {review.author_name}
                    </span>
                    <span>{review.days_ago_label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Container>
    </div>
  );
}
