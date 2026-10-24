"use client";

import { useTransition } from "react";
import { CalendarDays, Trash2 } from "lucide-react";
import { deleteBooking, updateBookingStatus } from "@/lib/actions/bookings";
import { daysInclusive, formatDisplayDate } from "@/lib/booking-dates";
import { cn } from "@/lib/cn";
import { formatKes } from "@/lib/payments/balance";
import { vehicleTitle } from "@/lib/vehicle-display";
import type { BookingStatus, BookingWithVehicle } from "@/lib/types";

const STATUS_OPTIONS: BookingStatus[] = ["pending", "confirmed", "declined", "cancelled"];

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: "bg-burgundy-50 text-burgundy-700 dark:bg-burgundy-950/40 dark:text-burgundy-400",
  confirmed: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  declined: "bg-charcoal-100 text-charcoal-500 dark:bg-charcoal-800 dark:text-charcoal-400",
  cancelled: "bg-charcoal-100 text-charcoal-500 dark:bg-charcoal-800 dark:text-charcoal-400",
};

export function BookingsTable({ bookings }: { bookings: BookingWithVehicle[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      {bookings.map((booking) => {
        const days = daysInclusive(booking.start_date, booking.end_date);
        const paid = booking.payments.find((p) => p.status === "paid");
        return (
          <div
            key={booking.id}
            className="rounded-2xl border-2 border-gold-500/60 bg-white p-5 shadow-[0_0_18px_-6px_rgba(201,162,39,0.45)] dark:border-gold-400/50 dark:shadow-[0_0_18px_-6px_rgba(212,185,106,0.35)] dark:bg-charcoal-900"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-charcoal-950 dark:text-white">{booking.full_name}</p>
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                  {booking.phone}
                  {booking.email ? ` · ${booking.email}` : ""}
                </p>
                <p className="mt-1 text-xs text-charcoal-400 dark:text-charcoal-500">
                  Requested {new Date(booking.created_at).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  disabled={isPending}
                  value={booking.status}
                  onChange={(e) =>
                    startTransition(() =>
                      updateBookingStatus(booking.id, booking.vehicle_id, e.target.value as BookingStatus)
                    )
                  }
                  className={cn(
                    "rounded-full border-0 px-3 py-1.5 text-xs font-medium capitalize",
                    STATUS_STYLES[booking.status]
                  )}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={isPending}
                  aria-label="Delete booking"
                  onClick={() => {
                    if (confirm("Delete this booking request?")) {
                      startTransition(() => deleteBooking(booking.id, booking.vehicle_id));
                    }
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-charcoal-500 hover:bg-burgundy-50 hover:text-burgundy-700 dark:text-charcoal-400 dark:hover:bg-charcoal-800"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg bg-charcoal-50 px-4 py-3 text-sm text-charcoal-700 dark:bg-charcoal-800 dark:text-charcoal-300">
              <span className="font-medium text-charcoal-950 dark:text-white">
                {booking.vehicle
                  ? [vehicleTitle(booking.vehicle), booking.vehicle.year].filter(Boolean).join(" · ")
                  : "Vehicle removed"}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays size={15} className="text-charcoal-400" />
                {formatDisplayDate(booking.start_date)} &rarr; {formatDisplayDate(booking.end_date)}
                <span className="text-charcoal-500 dark:text-charcoal-400">
                  ({days} day{days === 1 ? "" : "s"})
                </span>
              </span>
              {booking.estimated_total != null ? (
                <span>
                  {formatKes(booking.estimated_total)}
                  {Number(booking.discount) > 0 ? (
                    <span className="text-green-700 dark:text-green-400">
                      {" "}
                      (incl. {formatKes(booking.discount)} discount)
                    </span>
                  ) : null}
                </span>
              ) : (
                <span className="text-charcoal-500 dark:text-charcoal-400">Price to confirm</span>
              )}
              {paid ? (
                  <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
                    Paid{paid.mpesa_receipt ? ` · ${paid.mpesa_receipt}` : ""}
                  </span>
                ) : (
                  <span className="rounded-full bg-charcoal-100 px-2.5 py-0.5 text-xs font-medium text-charcoal-500 dark:bg-charcoal-700 dark:text-charcoal-300">
                    Unpaid
                  </span>
              )}
            </div>

            {booking.notes ? (
              <p className="mt-3 text-sm text-charcoal-700 dark:text-charcoal-300">{booking.notes}</p>
            ) : null}
          </div>
        );
      })}

      {bookings.length === 0 ? (
        <p className="rounded-2xl border border-charcoal-100 bg-white p-10 text-center text-charcoal-500 dark:border-charcoal-800 dark:bg-charcoal-900 dark:text-charcoal-400">
          No booking requests yet.
        </p>
      ) : null}
    </div>
  );
}
