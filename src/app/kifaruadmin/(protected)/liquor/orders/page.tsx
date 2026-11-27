import Link from "next/link";
import { LiquorOrdersList } from "@/components/admin/liquor/LiquorOrdersList";
import { listLiquorOrders } from "@/lib/admin/liquor-data";
import { cn } from "@/lib/cn";
import type { LiquorOrderStatus } from "@/lib/types";

const FILTERS: { value: LiquorOrderStatus | "open" | "all"; label: string }[] = [
  { value: "open", label: "To fulfil" },
  { value: "all", label: "All" },
  { value: "delivered", label: "Delivered" },
  { value: "pending_payment", label: "Awaiting payment" },
  { value: "cancelled", label: "Cancelled" },
];

export default async function LiquorOrdersPage({ searchParams }: PageProps<"/kifaruadmin/liquor/orders">) {
  const params = await searchParams;
  const requested = typeof params.status === "string" ? params.status : "open";
  const filter = FILTERS.find((f) => f.value === requested)?.value ?? "open";
  const orders = await listLiquorOrders(filter === "all" ? undefined : filter);

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal-950 dark:text-white">Liquor orders</h1>
      <p className="mt-1 max-w-2xl text-sm text-charcoal-500 dark:text-charcoal-400">
        Orders from the Kifaru Liquor shop, plus drinks customers added to a car booking (those come with the car).
        Paid orders need delivering — call the customer to confirm the delivery fee and time.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === "open" ? "/kifaruadmin/liquor/orders" : `/kifaruadmin/liquor/orders?status=${f.value}`}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm",
              filter === f.value
                ? "border-burgundy-600 bg-burgundy-600 text-white"
                : "border-charcoal-200 text-charcoal-700 hover:border-burgundy-400 dark:border-charcoal-700 dark:text-charcoal-300"
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <LiquorOrdersList orders={orders} />
      </div>
    </div>
  );
}
