import type { LeaseStatus } from "@/lib/types";

export function getRemainingDays(endDate: string): number {
  const end = new Date(`${endDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - today.getTime()) / 86_400_000);
}

export type LeaseDisplayStatus = "ended" | "overdue" | "ending-soon" | "active";

export function getLeaseDisplayStatus(status: LeaseStatus, endDate: string): LeaseDisplayStatus {
  if (status === "ended") return "ended";
  const remaining = getRemainingDays(endDate);
  if (remaining < 0) return "overdue";
  if (remaining <= 7) return "ending-soon";
  return "active";
}
