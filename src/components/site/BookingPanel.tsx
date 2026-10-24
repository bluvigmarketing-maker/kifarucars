"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { CalendarCheck, CheckCircle2, Loader2, Smartphone, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BookingCalendar, type DateRange } from "@/components/site/BookingCalendar";
import { getBookingPaymentStatus, retryBookingPayment, submitBooking } from "@/lib/actions/bookings";
import { daysInclusive, formatDisplayDate } from "@/lib/booking-dates";
import { cn } from "@/lib/cn";
import { formatKes } from "@/lib/payments/balance";
import {
  BOOKING_DISCOUNT,
  DISCOUNT_MIN_DAYS,
  formatPrice,
  quoteBooking,
  vehicleTitle,
} from "@/lib/vehicle-display";
import type { BookingFormState } from "@/lib/validations";
import type { PaymentStatus, PublicVehicle, UnavailableRange } from "@/lib/types";

const initialState: BookingFormState = { status: "idle" };

const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 120_000;

const inputClasses =
  "mt-1.5 w-full rounded-lg border border-charcoal-200 bg-white px-4 py-2.5 text-sm text-charcoal-900 focus:border-burgundy-500 focus:outline-none dark:border-charcoal-700 dark:bg-charcoal-900 dark:text-charcoal-50";
const labelClasses = "text-sm font-medium text-charcoal-700 dark:text-charcoal-300";
const cardClasses =
  "rounded-2xl border-2 border-gold-500/60 bg-white shadow-[0_0_18px_-6px_rgba(201,162,39,0.45)] dark:border-gold-400/50 dark:bg-charcoal-900";

type Props = {
  vehicle: PublicVehicle;
  unavailable: UnavailableRange[];
  // M-Pesa + service role configured — otherwise bookings are requests only.
  onlinePayment: boolean;
};

// Remounting on "change dates" resets the form action's state too.
export function BookingPanel(props: Props) {
  const [attempt, setAttempt] = useState(0);
  return <BookingFlow key={attempt} {...props} onStartOver={() => setAttempt((n) => n + 1)} />;
}

function DateTile({ label, value, active }: { label: string; value: string | null; active: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 transition-colors",
        active
          ? "border-burgundy-500 bg-burgundy-50/50 dark:border-burgundy-400 dark:bg-burgundy-950/30"
          : "border-charcoal-200 dark:border-charcoal-700"
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-400 dark:text-charcoal-500">
        {label}
      </p>
      <p className={cn("mt-0.5 text-sm", value ? "font-medium text-charcoal-950 dark:text-white" : "text-charcoal-400")}>
        {value ? formatDisplayDate(value) : "Select date"}
      </p>
    </div>
  );
}

function BookingFlow({ vehicle, unavailable, onlinePayment, onStartOver }: Props & { onStartOver: () => void }) {
  const [submitState, formAction, submitting] = useActionState(submitBooking, initialState);
  const [retryState, setRetryState] = useState<BookingFormState | null>(null);
  const [retrying, startRetry] = useTransition();
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  const [email, setEmail] = useState("");
  const [outcome, setOutcome] = useState<{ paymentId: string; status: PaymentStatus | "timeout" } | null>(null);

  // The latest attempt wins: a retry's result replaces the original submit's.
  const state = retryState ?? submitState;
  const errors = state.status === "error" ? state.errors : undefined;
  const bookingId =
    state.status === "sent" ? state.bookingId : state.status === "error" ? state.bookingId : undefined;
  const waitingFor = state.status === "sent" ? state.paymentId : null;
  const settled = outcome && outcome.paymentId === waitingFor ? outcome.status : null;

  const price = formatPrice(vehicle);
  const days = range.start && range.end ? daysInclusive(range.start, range.end) : 0;
  const quote = days ? quoteBooking(vehicle, days) : null;
  const paysOnline = onlinePayment && quote !== null;

  useEffect(() => {
    if (!waitingFor || !bookingId) return;
    const startedAt = Date.now();
    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      const status = await getBookingPaymentStatus(bookingId, waitingFor);
      if (cancelled) return;
      if (status && status !== "pending") {
        setOutcome({ paymentId: waitingFor, status });
        return;
      }
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        setOutcome({ paymentId: waitingFor, status: "timeout" });
        return;
      }
      setTimeout(poll, POLL_INTERVAL_MS);
    };
    const first = setTimeout(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearTimeout(first);
    };
  }, [waitingFor, bookingId]);

  const dates =
    range.start && range.end ? `${formatDisplayDate(range.start)} – ${formatDisplayDate(range.end)}` : null;

  if (submitState.status === "requested") {
    return (
      <div className={cn(cardClasses, "flex items-start gap-3 p-6")}>
        <CheckCircle2 className="mt-0.5 flex-shrink-0 text-burgundy-600 dark:text-burgundy-400" size={22} />
        <div>
          <p className="font-medium text-charcoal-950 dark:text-white">
            Booking request sent for the {vehicleTitle(vehicle)}.
          </p>
          <p className="mt-1 text-sm text-charcoal-600 dark:text-charcoal-300">
            {dates ? `${dates}. ` : null}
            Our team will call you shortly to confirm the price and arrange payment.
          </p>
        </div>
      </div>
    );
  }

  if (settled === "paid") {
    return (
      <div className={cn(cardClasses, "flex items-start gap-3 p-6")}>
        <CheckCircle2 className="mt-0.5 flex-shrink-0 text-green-600 dark:text-green-400" size={22} />
        <div>
          <p className="font-medium text-charcoal-950 dark:text-white">
            Payment received — your {vehicleTitle(vehicle)} is booked.
          </p>
          <p className="mt-1 text-sm text-charcoal-600 dark:text-charcoal-300">
            {dates ? `${dates}. ` : null}
            Your PDF invoice is on its way to <span className="font-medium">{email}</span>. We&apos;ll be in touch
            to arrange pick-up.
          </p>
        </div>
      </div>
    );
  }

  const retry = () => {
    if (!bookingId) return;
    startRetry(async () => setRetryState(await retryBookingPayment(bookingId)));
  };

  // Once the booking exists, the right-hand column tracks its payment.
  const paymentStage = bookingId ? (
    <div className="flex flex-col gap-4 p-5 sm:p-7">
      <div className="rounded-xl bg-charcoal-50 px-4 py-3 text-sm dark:bg-charcoal-800">
        <p className="font-medium text-charcoal-950 dark:text-white">{vehicleTitle(vehicle)}</p>
        {dates ? <p className="text-charcoal-600 dark:text-charcoal-300">{dates}</p> : null}
        {quote ? (
          <p className="mt-1 font-semibold text-charcoal-950 dark:text-white">{formatKes(quote.total)}</p>
        ) : null}
      </div>

      {waitingFor && !settled ? (
        <div className="flex items-start gap-3">
          <Loader2 className="mt-0.5 flex-shrink-0 animate-spin text-burgundy-600 dark:text-burgundy-400" size={22} />
          <div>
            <p className="font-medium text-charcoal-950 dark:text-white">Check your phone</p>
            <p className="mt-1 text-sm text-charcoal-600 dark:text-charcoal-300">
              An M-Pesa prompt has been sent. Enter your PIN to pay — this page updates automatically.
            </p>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-burgundy-600">
            {settled === "cancelled"
              ? "The payment was cancelled on your phone."
              : settled === "failed"
                ? "The payment didn't go through (e.g. wrong PIN or insufficient funds)."
                : settled === "timeout"
                  ? "We haven't received confirmation yet. If you completed the payment, you'll get your invoice by email shortly."
                  : state.status === "error"
                    ? state.message
                    : null}
          </p>
          <Button type="button" size="lg" onClick={retry} disabled={retrying}>
            <Smartphone size={18} />
            {retrying ? "Sending prompt..." : "Resend M-Pesa prompt"}
          </Button>
        </>
      )}

      <button
        type="button"
        onClick={onStartOver}
        className="self-center text-xs text-charcoal-500 underline hover:text-burgundy-700 dark:text-charcoal-400"
      >
        Change dates or details
      </button>
    </div>
  ) : null;

  return (
    <div className={cardClasses}>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div
          className={cn(
            "border-b border-charcoal-100 p-5 sm:p-7 lg:border-b-0 lg:border-r dark:border-charcoal-800",
            bookingId && "pointer-events-none opacity-60"
          )}
        >
          <BookingCalendar value={range} onChange={setRange} unavailable={unavailable} />
        </div>

        {paymentStage ?? (
          <form
            action={(formData) => {
              setRetryState(null);
              formAction(formData);
            }}
            className="flex flex-col gap-5 p-5 sm:p-7"
          >
            <input type="hidden" name="vehicleId" value={vehicle.id} />
            <input type="hidden" name="startDate" value={range.start ?? ""} />
            <input type="hidden" name="endDate" value={range.end ?? ""} />

            {price ? (
              <p className="text-charcoal-600 dark:text-charcoal-300">
                {price.amount ? (
                  <span className="font-display text-2xl text-charcoal-950 dark:text-white">{price.amount}</span>
                ) : null}{" "}
                {price.unit ? <span className="text-sm">{price.unit}</span> : null}
              </p>
            ) : null}

            <div>
              <div className="grid grid-cols-2 gap-2">
                <DateTile label="Pick-up" value={range.start} active={!range.start} />
                <DateTile label="Return" value={range.end} active={!!range.start && !range.end} />
              </div>
              {errors?.startDate || errors?.endDate ? (
                <p className="mt-1.5 text-xs text-burgundy-600">{(errors.startDate ?? errors.endDate)![0]}</p>
              ) : null}
              <div className="mt-2 flex min-h-6 items-center justify-between text-sm">
                <span className="text-charcoal-500 dark:text-charcoal-400">
                  {days
                    ? `${days} day${days === 1 ? "" : "s"}`
                    : range.start
                      ? "Now pick your return date"
                      : "Pick your start date on the calendar"}
                </span>
                {range.start ? (
                  <button
                    type="button"
                    onClick={() => setRange({ start: null, end: null })}
                    className="flex items-center gap-1 text-xs text-charcoal-500 hover:text-burgundy-700 dark:text-charcoal-400 dark:hover:text-burgundy-400"
                  >
                    <X size={13} /> Clear
                  </button>
                ) : null}
              </div>

              {quote ? (
                <dl className="mt-2 space-y-1.5 rounded-xl bg-charcoal-50 px-4 py-3 text-sm dark:bg-charcoal-800">
                  <div className="flex justify-between text-charcoal-600 dark:text-charcoal-300">
                    <dt>
                      {days} day{days === 1 ? "" : "s"}
                    </dt>
                    <dd>{formatKes(quote.subtotal)}</dd>
                  </div>
                  {quote.discount > 0 ? (
                    <div className="flex justify-between text-green-700 dark:text-green-400">
                      <dt className="flex items-center gap-1.5">
                        <Tag size={13} /> {DISCOUNT_MIN_DAYS}+ day discount
                      </dt>
                      <dd>&minus; {formatKes(quote.discount)}</dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between border-t border-charcoal-200 pt-1.5 font-semibold text-charcoal-950 dark:border-charcoal-700 dark:text-white">
                    <dt>Total</dt>
                    <dd>{formatKes(quote.total)}</dd>
                  </div>
                </dl>
              ) : days && price ? (
                <p className="mt-2 text-xs text-charcoal-500 dark:text-charcoal-400">
                  We&apos;ll confirm the total for these dates when we call you.
                </p>
              ) : null}

              {quote && quote.discount === 0 ? (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-charcoal-500 dark:text-charcoal-400">
                  <Tag size={12} /> Book {DISCOUNT_MIN_DAYS} days or more and save {formatKes(BOOKING_DISCOUNT)}.
                </p>
              ) : null}
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClasses}>Full name</label>
                <input name="fullName" required autoComplete="name" className={inputClasses} />
                {errors?.fullName ? <p className="mt-1 text-xs text-burgundy-600">{errors.fullName[0]}</p> : null}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div>
                  <label className={labelClasses}>{paysOnline ? "M-Pesa phone number" : "Phone"}</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    autoComplete="tel"
                    placeholder="0712 345 678"
                    className={inputClasses}
                  />
                  {errors?.phone ? <p className="mt-1 text-xs text-burgundy-600">{errors.phone[0]}</p> : null}
                </div>
                <div>
                  <label className={labelClasses}>Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClasses}
                  />
                  {errors?.email ? <p className="mt-1 text-xs text-burgundy-600">{errors.email[0]}</p> : null}
                </div>
              </div>
              <div>
                <label className={labelClasses}>Notes (optional)</label>
                <textarea
                  name="notes"
                  rows={2}
                  className={inputClasses}
                  placeholder="Pick-up location, driver needed, etc."
                />
              </div>
            </div>

            {state.status === "error" && state.message ? (
              <p className="text-sm text-burgundy-600">{state.message}</p>
            ) : null}

            <Button type="submit" size="lg" disabled={submitting || !range.start || !range.end}>
              {paysOnline ? <Smartphone size={18} /> : <CalendarCheck size={18} />}
              {submitting
                ? paysOnline
                  ? "Sending M-Pesa prompt..."
                  : "Sending..."
                : paysOnline
                  ? `Pay ${formatKes(quote.total)} with M-Pesa`
                  : "Request Booking"}
            </Button>
            <p className="-mt-2 text-center text-xs text-charcoal-500 dark:text-charcoal-400">
              {paysOnline
                ? "You'll get an M-Pesa prompt on this number, and a PDF invoice by email once paid."
                : "No payment now — we'll confirm with you first."}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
