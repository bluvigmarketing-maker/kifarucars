import type { UnavailableRange } from "./types";

// Booking dates travel as "YYYY-MM-DD" strings (Postgres `date`), so they
// compare correctly as strings and never shift across timezones the way
// Date#toISOString() would.

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseIsoDate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Both ends count: a 1st–3rd booking is 3 days.
export function daysInclusive(start: string, end: string): number {
  const ms = parseIsoDate(end).getTime() - parseIsoDate(start).getTime();
  return Math.round(ms / 86_400_000) + 1;
}

export function isDateUnavailable(date: string, ranges: UnavailableRange[]): boolean {
  return ranges.some((r) => date >= r.start_date && date <= r.end_date);
}

export function overlapsUnavailable(start: string, end: string, ranges: UnavailableRange[]): boolean {
  return ranges.some((r) => start <= r.end_date && end >= r.start_date);
}

export function formatDisplayDate(value: string): string {
  return parseIsoDate(value).toLocaleDateString("en-KE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
