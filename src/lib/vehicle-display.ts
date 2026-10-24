import { formatKes } from "./payments/balance";
import type { PriceUnit, Vehicle } from "./types";

// Every vehicle detail is optional (see VehicleSchema), so anything shown
// to people goes through these instead of reading the fields directly.

type TitleFields = Pick<Vehicle, "name" | "make">;

export function vehicleTitle(vehicle: TitleFields): string {
  return [vehicle.make, vehicle.name].filter(Boolean).join(" ") || "Vehicle";
}

// The small "Toyota · 2023" line above a vehicle's name — whichever parts exist.
export function vehicleSubtitle(vehicle: Pick<Vehicle, "make" | "year">): string {
  return [vehicle.make, vehicle.year].filter(Boolean).join(" · ");
}

export const FALLBACK_VEHICLE_IMAGE = "/vehicles/placeholder-suv.svg";

const UNIT_LABELS: Record<Exclude<PriceUnit, "custom">, string> = {
  day: "per day",
  month: "per month",
};

type PriceFields = Pick<Vehicle, "price" | "price_unit" | "price_custom_label">;

// "KES 8,500 per day", "KES 50,000 per weekend", or a custom label alone
// ("Price on request"). Null when no price has been set.
export function formatPrice(vehicle: PriceFields): { amount: string | null; unit: string | null } | null {
  const unit =
    vehicle.price_unit === "custom"
      ? vehicle.price_custom_label?.trim() || null
      : vehicle.price_unit
        ? UNIT_LABELS[vehicle.price_unit]
        : null;
  const amount = vehicle.price != null ? formatKes(vehicle.price) : null;
  // A bare "per day" with no amount says nothing; a custom label can stand alone.
  if (!amount && (vehicle.price_unit !== "custom" || !unit)) return null;
  return { amount, unit };
}

// One-line form for tables: "KES 8,500 per day".
export function formatPriceText(vehicle: PriceFields): string | null {
  const price = formatPrice(vehicle);
  return price ? [price.amount, price.unit].filter(Boolean).join(" ") : null;
}

// Bookings of this many days or more get BOOKING_DISCOUNT off the total.
export const DISCOUNT_MIN_DAYS = 5;
export const BOOKING_DISCOUNT = 1000;

export type BookingQuote = { days: number; subtotal: number; discount: number; total: number };

// What a booking of `days` (inclusive) costs, in whole shillings — the
// amount the M-Pesa prompt charges. Null for custom/unset pricing, which
// can't be paid online and is confirmed by staff instead. Used by both the
// booking panel and submitBooking, so the customer sees what they're charged.
export function quoteBooking(vehicle: PriceFields, days: number): BookingQuote | null {
  if (vehicle.price == null || days < 1) return null;
  const price = Number(vehicle.price);
  if (!(price > 0)) return null;

  let subtotal: number;
  if (vehicle.price_unit === "day") subtotal = Math.round(price * days);
  else if (vehicle.price_unit === "month") subtotal = Math.round((price / 30) * days);
  else return null;

  const discount = days >= DISCOUNT_MIN_DAYS ? Math.min(BOOKING_DISCOUNT, subtotal) : 0;
  return { days, subtotal, discount, total: subtotal - discount };
}
