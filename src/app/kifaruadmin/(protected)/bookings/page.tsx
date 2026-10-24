import { BookingsTable } from "@/components/admin/BookingsTable";
import { listAllBookings } from "@/lib/admin/data";

export default async function AdminBookingsPage() {
  const bookings = await listAllBookings();
  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal-950 dark:text-white">Bookings</h1>
      <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">
        {bookings.length} total &middot; {pendingCount} awaiting confirmation. Confirmed bookings
        block those dates on the public calendar.
      </p>

      <div className="mt-6">
        <BookingsTable bookings={bookings} />
      </div>
    </div>
  );
}
