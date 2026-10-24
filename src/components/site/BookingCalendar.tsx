"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { isDateUnavailable, overlapsUnavailable, parseIsoDate, toIsoDate } from "@/lib/booking-dates";
import type { UnavailableRange } from "@/lib/types";

export type DateRange = { start: string | null; end: string | null };

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
// How far ahead customers can book.
const MAX_MONTHS_AHEAD = 12;

function monthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, n: number) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

// Monday-first grid of ISO dates, with nulls padding the first week.
function monthGrid(month: Date): (string | null)[] {
  const leading = (month.getDay() + 6) % 7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (string | null)[] = Array.from({ length: leading }, () => null);
  for (let d = 1; d <= days; d++) {
    cells.push(toIsoDate(new Date(month.getFullYear(), month.getMonth(), d)));
  }
  return cells;
}

export function BookingCalendar({
  value,
  onChange,
  unavailable,
}: {
  value: DateRange;
  onChange: (range: DateRange) => void;
  unavailable: UnavailableRange[];
}) {
  const today = useMemo(() => toIsoDate(new Date()), []);
  const firstMonth = useMemo(() => monthStart(new Date()), []);
  const lastMonth = addMonths(firstMonth, MAX_MONTHS_AHEAD - 1);
  const lastBookable = toIsoDate(new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0));

  const [visible, setVisible] = useState(() => (value.start ? monthStart(parseIsoDate(value.start)) : firstMonth));
  const [direction, setDirection] = useState(1);
  const [hovered, setHovered] = useState<string | null>(null);

  const canGoBack = visible > firstMonth;
  // Two months show side by side on wider screens, so stop one early.
  const canGoForward = addMonths(visible, 1) < lastMonth;

  const isDisabled = (date: string) =>
    date < today || date > lastBookable || isDateUnavailable(date, unavailable);

  // While only a start is picked, preview the range up to the hovered day —
  // unless that range would run across booked dates.
  const previewEnd =
    value.start && !value.end && hovered && hovered >= value.start && !overlapsUnavailable(value.start, hovered, unavailable)
      ? hovered
      : null;
  const rangeEnd = value.end ?? previewEnd;

  const handleSelect = (date: string) => {
    if (!value.start || value.end || date < value.start) {
      onChange({ start: date, end: null });
    } else if (overlapsUnavailable(value.start, date, unavailable)) {
      // Can't span a booked stretch — start over from the clicked day.
      onChange({ start: date, end: null });
    } else {
      onChange({ start: value.start, end: date });
    }
  };

  const go = (n: number) => {
    setDirection(n);
    setVisible((m) => addMonths(m, n));
  };

  return (
    <div onMouseLeave={() => setHovered(null)}>
      <div className="relative z-10 flex items-center justify-between">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={!canGoBack}
          aria-label="Previous month"
          className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal-600 transition-colors hover:bg-charcoal-100 disabled:opacity-30 disabled:hover:bg-transparent dark:text-charcoal-300 dark:hover:bg-charcoal-800"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={!canGoForward}
          aria-label="Next month"
          className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal-600 transition-colors hover:bg-charcoal-100 disabled:opacity-30 disabled:hover:bg-transparent dark:text-charcoal-300 dark:hover:bg-charcoal-800"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="relative -mt-9 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={toIsoDate(visible)}
            custom={direction}
            initial={{ opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -24 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="grid grid-cols-1 gap-8 sm:grid-cols-2"
          >
            {[visible, addMonths(visible, 1)].map((month, i) => (
              <div key={toIsoDate(month)} className={cn(i === 1 && "hidden sm:block")}>
                <p className="flex h-9 items-center justify-center text-sm font-semibold text-charcoal-950 dark:text-white">
                  {month.toLocaleDateString("en-KE", { month: "long", year: "numeric" })}
                </p>
                <div className="mt-3 grid grid-cols-7 text-center text-[11px] font-medium uppercase tracking-wide text-charcoal-400 dark:text-charcoal-500">
                  {WEEKDAYS.map((d) => (
                    <span key={d} className="py-1">
                      {d}
                    </span>
                  ))}
                </div>
                <div className="mt-1 grid grid-cols-7 gap-y-1">
                  {monthGrid(month).map((date, idx) => {
                    if (!date) return <span key={`pad-${idx}`} />;

                    const disabled = isDisabled(date);
                    const booked = date >= today && isDateUnavailable(date, unavailable);
                    const isStart = date === value.start;
                    const isEnd = date === rangeEnd;
                    const inRange = !!value.start && !!rangeEnd && date > value.start && date < rangeEnd;
                    const hasBand = !!value.start && !!rangeEnd && value.start !== rangeEnd;
                    const isPreview = !value.end && !!previewEnd;

                    return (
                      <div
                        key={date}
                        className={cn(
                          "flex justify-center",
                          inRange && (isPreview ? "bg-burgundy-50/60 dark:bg-burgundy-950/25" : "bg-burgundy-50 dark:bg-burgundy-950/40"),
                          hasBand && isStart && "rounded-l-full bg-burgundy-50 dark:bg-burgundy-950/40",
                          hasBand && isEnd && (isPreview ? "rounded-r-full bg-burgundy-50/60 dark:bg-burgundy-950/25" : "rounded-r-full bg-burgundy-50 dark:bg-burgundy-950/40")
                        )}
                      >
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => handleSelect(date)}
                          onMouseEnter={() => setHovered(date)}
                          aria-label={`${parseIsoDate(date).toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}${booked ? ", booked" : ""}`}
                          aria-pressed={isStart || isEnd}
                          className={cn(
                            "relative flex aspect-square w-full max-w-11 items-center justify-center rounded-full text-sm transition-colors",
                            "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-burgundy-600",
                            disabled
                              ? "cursor-not-allowed text-charcoal-300 dark:text-charcoal-600"
                              : "text-charcoal-800 hover:bg-charcoal-100 dark:text-charcoal-100 dark:hover:bg-charcoal-800",
                            booked && "line-through decoration-charcoal-300 dark:decoration-charcoal-600",
                            inRange && !disabled && "text-burgundy-800 hover:bg-burgundy-100 dark:text-burgundy-200 dark:hover:bg-burgundy-900/50",
                            (isStart || (isEnd && !isPreview)) &&
                              "bg-burgundy-600 font-semibold text-white shadow-[0_0_12px_-3px_rgba(201,162,39,0.7)] ring-2 ring-gold-400/70 hover:bg-burgundy-700 dark:text-white dark:hover:bg-burgundy-700",
                            isEnd && isPreview && !isStart && "bg-burgundy-100 text-burgundy-800 dark:bg-burgundy-900/60 dark:text-burgundy-100"
                          )}
                        >
                          {parseIsoDate(date).getDate()}
                          {date === today && !isStart && !isEnd ? (
                            <span className="absolute bottom-1 h-1 w-1 rounded-full bg-gold-500" />
                          ) : null}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-charcoal-500 dark:text-charcoal-400">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-burgundy-600 ring-2 ring-gold-400/70" /> Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-charcoal-300 line-through dark:text-charcoal-600">12</span> Booked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-gold-500" /> Today
        </span>
      </div>
    </div>
  );
}
