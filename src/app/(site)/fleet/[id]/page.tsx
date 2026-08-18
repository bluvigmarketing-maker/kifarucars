import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Briefcase, Fuel, Gauge, Settings2, Star, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { VehicleGallery } from "@/components/site/VehicleGallery";
import { getReviewsForVehicle, getVehicleForDetail } from "@/lib/data";

export async function generateMetadata({
  params,
}: PageProps<"/fleet/[id]">): Promise<Metadata> {
  const { id } = await params;
  const vehicle = await getVehicleForDetail(id);
  if (!vehicle) return { title: "Vehicle" };
  return {
    title: `${vehicle.make} ${vehicle.name} (${vehicle.year})`,
    description: `${vehicle.make} ${vehicle.name} — ${vehicle.transmission}, ${vehicle.seats} seats, ${vehicle.fuel_type}. Available for hire and leasing from Kifaru Car Hire.`,
  };
}

export default async function VehicleDetailPage({ params }: PageProps<"/fleet/[id]">) {
  const { id } = await params;
  const [vehicle, reviews] = await Promise.all([
    getVehicleForDetail(id),
    getReviewsForVehicle(id),
  ]);

  if (!vehicle) notFound();

  const specs = [
    { label: vehicle.transmission, Icon: Settings2 },
    { label: `${vehicle.seats} Passengers`, Icon: Users },
    { label: vehicle.fuel_type, Icon: Fuel },
    { label: vehicle.luggage_capacity, Icon: Briefcase },
    ...(vehicle.mileage != null ? [{ label: `${vehicle.mileage.toLocaleString()} km`, Icon: Gauge }] : []),
  ];

  return (
    <div className="py-16 sm:py-20">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <VehicleGallery
            images={[vehicle.image_url, ...vehicle.gallery_urls]}
            videoUrl={vehicle.video_url}
            alt={`${vehicle.make} ${vehicle.name}`}
          />

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-burgundy-600 dark:text-burgundy-400">
              {vehicle.make} &middot; {vehicle.year}
            </p>
            <h1 className="mt-1 font-display text-3xl text-charcoal-950 sm:text-4xl dark:text-white">
              {vehicle.name}
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
              <Button href="/#enquiry" size="lg">
                Get A Quote
              </Button>
              <Button href="/list-your-car" variant="outline" size="lg">
                List Your Own Car
              </Button>
            </div>
          </div>
        </div>

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
