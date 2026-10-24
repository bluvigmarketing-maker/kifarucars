import { BookingsTable } from "@/components/admin/BookingsTable";
import { listAllBookings } from "@/lib/admin/data";

export default async function AdminBookingsPage() {
  const all = await listAllBookings();
  // A booking only counts once it's paid. Pending rows with no paid payment
  // are checkouts the customer abandoned or whose M-Pesa prompt failed.
  const isUnpaidAttempt = (b: (typeof all)[number]) =>
    b.status === "pending" && !b.payments.some((p) => p.status === "paid");
  const bookings = all.filter((b) => !isUnpaidAttempt(b));
  const unpaid = all.filter(isUnpaidAttempt);

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal-950 dark:text-white">Bookings</h1>
      <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">
        {bookings.length} paid booking{bookings.length === 1 ? "" : "s"}. Customers pay by M-Pesa to book;
        paid bookings are confirmed automatically and block those dates on the public calendar.
      </p>

      <div className="mt-6">
        <BookingsTable bookings={bookings} emptyMessage="No paid bookings yet." />
      </div>

      {unpaid.length > 0 ? (
        <details className="mt-10">
          <summary className="cursor-pointer text-sm font-medium text-charcoal-600 dark:text-charcoal-300">
            Unpaid checkout attempts ({unpaid.length})
          </summary>
          <p className="mt-2 text-xs text-charcoal-500 dark:text-charcoal-400">
            The customer started booking but didn&apos;t complete the M-Pesa payment — these don&apos;t
            hold any dates. Useful for following up; safe to delete.
          </p>
          <div className="mt-4">
            <BookingsTable bookings={unpaid} emptyMessage="" />
          </div>
        </details>
      ) : null}
    </div>
  );
}
