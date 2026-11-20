import { ExtrasManager } from "@/components/admin/ExtrasManager";
import { listAllExtras } from "@/lib/admin/data";

export default async function AdminExtrasPage() {
  const extras = await listAllExtras();

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal-950 dark:text-white">Extras</h1>
      <p className="mt-1 max-w-2xl text-sm text-charcoal-500 dark:text-charcoal-400">
        Drinks, snacks and accessories clients can add when booking a car. They&apos;re not part of the M-Pesa
        booking payment — your team buys them, has them ready with the car, and collects payment at pickup.
        Each booking under Bookings lists what to prepare.
      </p>

      <div className="mt-6">
        <ExtrasManager extras={extras} />
      </div>
    </div>
  );
}
