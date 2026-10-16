import { PaymentsTable } from "@/components/admin/PaymentsTable";
import { listAllPayments } from "@/lib/admin/data";
import { formatKes } from "@/lib/payments/balance";
import { TILL_NAME, TILL_NUMBER } from "@/lib/mpesa/daraja";

export default async function AdminPaymentsPage() {
  const payments = await listAllPayments();
  const collected = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal-950 dark:text-white">Payments</h1>
      <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">
        M-Pesa till {TILL_NUMBER} ({TILL_NAME}) &middot; {formatKes(collected)} collected online
      </p>

      <div className="mt-6">
        <PaymentsTable payments={payments} />
      </div>
    </div>
  );
}
