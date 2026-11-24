import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getFleet } from "@/lib/data";
import { BUSINESS } from "@/lib/placeholder-data";
import type { PublicVehicle, VehicleCategory } from "@/lib/types";
import { BOOKING_DISCOUNT, DISCOUNT_MIN_DAYS, formatPrice, vehicleTitle } from "@/lib/vehicle-display";
import { formatKes } from "@/lib/payments/balance";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Daily car hire rates in Kenya for the Lexus LX 570, Toyota Land Cruiser Prado VXL and TX, Toyota Fortuner and Mazda CX-5 — self-drive or chauffeur-driven from Kifaru Car Hire.",
};

type Group = { key: string; name: string; description: string; vehicles: PublicVehicle[] };

// Category order from the admin dashboard; vehicles keep their fleet
// sort_order within each group. Uncategorised cars go last.
function groupByCategory(vehicles: PublicVehicle[], categories: VehicleCategory[]): Group[] {
  const groups: Group[] = categories.map((c) => ({
    key: c.id,
    name: c.name,
    description: c.description,
    vehicles: vehicles.filter((v) => v.category_id === c.id),
  }));
  const known = new Set(categories.map((c) => c.id));
  const other = vehicles.filter((v) => !v.category_id || !known.has(v.category_id));
  if (other.length > 0) {
    groups.push({
      key: "other",
      name: groups.some((g) => g.vehicles.length > 0) ? "Other Vehicles" : "Our Fleet",
      description: "",
      vehicles: other,
    });
  }
  return groups.filter((g) => g.vehicles.length > 0);
}

function RateRow({ vehicle }: { vehicle: PublicVehicle }) {
  const title = vehicleTitle(vehicle);
  const price = formatPrice(vehicle);
  const details = [vehicle.fuel_type, vehicle.seats ? `${vehicle.seats} seats` : "", vehicle.year]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-4 p-4 odd:bg-white even:bg-gold-300/15 sm:grid-cols-[11rem_minmax(0,1fr)_auto] sm:gap-6 sm:p-5 dark:odd:bg-charcoal-900 dark:even:bg-charcoal-800/60">
      <Link
        href={`/fleet/${vehicle.id}`}
        className="relative aspect-[4/3] overflow-hidden rounded-lg bg-charcoal-100 dark:bg-charcoal-800"
      >
        <Image
          src={vehicle.image_url}
          alt={title}
          fill
          sizes="(min-width: 640px) 176px, 112px"
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
      </Link>

      <div className="min-w-0">
        <Link
          href={`/fleet/${vehicle.id}`}
          className="font-display text-lg text-charcoal-950 hover:text-burgundy-700 sm:text-xl dark:text-white dark:hover:text-burgundy-400"
        >
          {title}
        </Link>
        {details ? <p className="mt-0.5 text-sm text-charcoal-500 dark:text-charcoal-400">{details}</p> : null}

        {/* On phones the rate sits under the name instead of in its own column. */}
        <div className="mt-2 sm:hidden">
          <RateAmount price={price} />
        </div>
        <Button href={`/fleet/${vehicle.id}#book`} size="sm" className="mt-3">
          Book Now
        </Button>
      </div>

      <div className="hidden text-right sm:block">
        <RateAmount price={price} />
      </div>
    </li>
  );
}

function RateAmount({ price }: { price: ReturnType<typeof formatPrice> }) {
  if (!price) {
    return <p className="text-sm font-medium text-charcoal-500 dark:text-charcoal-400">Price on request</p>;
  }
  return (
    <p>
      {price.amount ? (
        <span className="block text-2xl font-semibold tabular-nums text-gold-600 dark:text-gold-400">
          {price.amount}
        </span>
      ) : null}
      {price.unit ? <span className="text-sm text-charcoal-500 dark:text-charcoal-400">{price.unit}</span> : null}
    </p>
  );
}

export default async function PricingPage() {
  const { vehicles, categories } = await getFleet();
  const groups = groupByCategory(vehicles, categories);

  return (
    <div className="py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow="Pricing" title="Vehicle Rates" />
        <p className="mt-4 max-w-2xl text-charcoal-600 dark:text-charcoal-300">
          Daily rates in Kenya Shillings for every car in our fleet, self-drive or chauffeur-driven. Book{" "}
          {DISCOUNT_MIN_DAYS} days or more and get {formatKes(BOOKING_DISCOUNT)} off your total.
        </p>

        <div className="mt-12 space-y-12">
          {groups.map((group) => (
            <section key={group.key} aria-labelledby={`cat-${group.key}`}>
              <div className="border-b-2 border-gold-500/70 pb-3 dark:border-gold-400/60">
                <h2 id={`cat-${group.key}`} className="font-display text-2xl text-charcoal-950 dark:text-white">
                  {group.name}
                </h2>
                {group.description ? (
                  <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">{group.description}</p>
                ) : null}
              </div>
              <ul className="divide-y divide-charcoal-100 overflow-hidden rounded-b-2xl border border-t-0 border-charcoal-100 dark:divide-charcoal-800 dark:border-charcoal-800">
                {group.vehicles.map((vehicle) => (
                  <RateRow key={vehicle.id} vehicle={vehicle} />
                ))}
              </ul>
            </section>
          ))}

          {groups.length === 0 ? (
            <p className="text-charcoal-500 dark:text-charcoal-400">
              Rates are being updated — call us on {BUSINESS.salesPhone} for a quote.
            </p>
          ) : null}
        </div>

        <section
          aria-labelledby="rates-contact"
          className="mt-16 rounded-2xl border-2 border-gold-500/60 bg-white p-6 shadow-[0_0_20px_-6px_rgba(201,162,39,0.5)] sm:p-8 dark:border-gold-400/50 dark:bg-charcoal-900"
        >
          <h2 id="rates-contact" className="font-display text-2xl text-charcoal-950 dark:text-white">
            Contact &amp; Locations
          </h2>
          <ul className="mt-5 grid grid-cols-1 gap-4 text-sm text-charcoal-700 sm:grid-cols-2 dark:text-charcoal-300">
            <li className="flex gap-3">
              <MapPin size={18} className="mt-0.5 flex-shrink-0 text-burgundy-600 dark:text-burgundy-400" />
              <span>{BUSINESS.locations.join(", ")}</span>
            </li>
            <li className="flex gap-3">
              <MessageCircle size={18} className="mt-0.5 flex-shrink-0 text-burgundy-600 dark:text-burgundy-400" />
              <span>
                Phone / WhatsApp:{" "}
                <a href={`https://wa.me/${BUSINESS.whatsapp}`} className="font-medium hover:text-burgundy-700">
                  {BUSINESS.phone}
                </a>
              </span>
            </li>
            <li className="flex gap-3">
              <Phone size={18} className="mt-0.5 flex-shrink-0 text-burgundy-600 dark:text-burgundy-400" />
              <span>
                Sales lead:{" "}
                <a href={`tel:${BUSINESS.salesPhone.replace(/\s/g, "")}`} className="font-medium hover:text-burgundy-700">
                  {BUSINESS.salesPhone}
                </a>
              </span>
            </li>
            <li className="flex gap-3">
              <Mail size={18} className="mt-0.5 flex-shrink-0 text-burgundy-600 dark:text-burgundy-400" />
              <a href={`mailto:${BUSINESS.email}`} className="font-medium hover:text-burgundy-700">
                {BUSINESS.email}
              </a>
            </li>
          </ul>
          <p className="mt-6 text-xs italic text-charcoal-500 dark:text-charcoal-400">
            Self-drive or chauffeur-driven. Rates are in Kenya Shillings (KES) per day unless stated otherwise.
            Need a car for months, or several? See{" "}
            <Link href="/corporate-leasing" className="underline hover:text-burgundy-700">
              corporate leasing
            </Link>
            .
          </p>
        </section>
      </Container>
    </div>
  );
}
