import { cn } from "@/lib/cn";
import { vehicleTitle } from "@/lib/vehicle-display";
import { formatKes } from "@/lib/payments/balance";
import type { PaymentStatus, PaymentWithLease } from "@/lib/types";

const STATUS_STYLES: Record<PaymentStatus, string> = {
  paid: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  failed: "bg-burgundy-50 text-burgundy-700 dark:bg-burgundy-950/40 dark:text-burgundy-400",
  cancelled: "bg-charcoal-100 text-charcoal-500 dark:bg-charcoal-800 dark:text-charcoal-400",
};

export function PaymentsTable({ payments }: { payments: PaymentWithLease[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border-2 border-gold-500/60 bg-white shadow-[0_0_18px_-6px_rgba(201,162,39,0.45)] dark:border-gold-400/50 dark:shadow-[0_0_18px_-6px_rgba(212,185,106,0.35)] dark:bg-charcoal-900">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-charcoal-100 text-xs uppercase tracking-wide text-charcoal-500 dark:border-charcoal-800 dark:text-charcoal-400">
          <tr>
            <th className="px-5 py-3">Date</th>
            <th className="px-5 py-3">Client</th>
            <th className="px-5 py-3">Vehicle</th>
            <th className="px-5 py-3">Phone</th>
            <th className="px-5 py-3">Amount</th>
            <th className="px-5 py-3">M-Pesa receipt</th>
            <th className="px-5 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-charcoal-100 dark:divide-charcoal-800">
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td className="px-5 py-3.5 text-charcoal-700 dark:text-charcoal-300">
                {new Date(payment.paid_at ?? payment.created_at).toLocaleString()}
              </td>
              <td className="px-5 py-3.5 font-medium text-charcoal-950 dark:text-white">
                {payment.lease?.client.full_name ?? payment.booking?.full_name ?? "—"}
                <span className="block text-xs font-normal text-charcoal-500 dark:text-charcoal-400">
                  {payment.booking ? "Booking" : "Lease"}
                </span>
              </td>
              <td className="px-5 py-3.5 text-charcoal-700 dark:text-charcoal-300">
                {payment.lease
                  ? vehicleTitle(payment.lease.vehicle)
                  : payment.booking
                    ? vehicleTitle(payment.booking.vehicle)
                    : "—"}
              </td>
              <td className="px-5 py-3.5 text-charcoal-700 dark:text-charcoal-300">{payment.phone}</td>
              <td className="px-5 py-3.5 text-charcoal-700 dark:text-charcoal-300">{formatKes(payment.amount)}</td>
              <td className="px-5 py-3.5 font-mono text-xs text-charcoal-700 dark:text-charcoal-300">
                {payment.mpesa_receipt ?? (payment.status === "paid" ? "Confirmed by status check" : "—")}
              </td>
              <td className="px-5 py-3.5">
                <span
                  className={cn("rounded-full px-2.5 py-1 text-xs font-medium capitalize", STATUS_STYLES[payment.status])}
                  title={payment.result_desc ?? undefined}
                >
                  {payment.status}
                </span>
              </td>
            </tr>
          ))}
          {payments.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-5 py-10 text-center text-charcoal-500 dark:text-charcoal-400">
                No payments yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
