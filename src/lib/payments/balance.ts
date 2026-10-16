import type { LeaseWithBalance } from "@/lib/types";

// Total due on a lease = base cost + approved extension charges.
export function getLeaseBalance(cost: number, extensionCharges: number, amountPaid: number) {
  const totalDue = Number(cost) + Number(extensionCharges);
  const paid = Number(amountPaid);
  return { totalDue, paid, balance: Math.max(0, totalDue - paid) };
}

export function getLeaseBalanceFromRelations(lease: LeaseWithBalance) {
  const extensionCharges = lease.extension_requests
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + Number(r.amount ?? 0), 0);
  const paid = lease.payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + Number(p.amount), 0);
  return getLeaseBalance(lease.cost, extensionCharges, paid);
}

export function formatKes(amount: number) {
  return `KES ${Number(amount).toLocaleString("en-KE", { maximumFractionDigits: 2 })}`;
}
