"use client";

import { useTransition } from "react";
import { Car, MapPin, Phone, Receipt, Store } from "lucide-react";
import { updateLiquorOrderStatus } from "@/lib/actions/liquor-admin";
import { formatDisplayDate } from "@/lib/booking-dates";
import { cn } from "@/lib/cn";
import { LIQUOR_ORDER_STATUS_LABELS, liquorOrderReference } from "@/lib/liquor-shop";
import { formatKes } from "@/lib/payments/balance";
import type { LiquorOrder, LiquorOrderStatus } from "@/lib/types";

const STATUS_STYLES: Record<LiquorOrderStatus, string> = {
  pending_payment: "bg-charcoal-100 text-charcoal-600 dark:bg-charcoal-800 dark:text-charcoal-300",
  paid: "bg-gold-300/40 text-charcoal-900 dark:bg-gold-500/20 dark:text-gold-300",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
  delivered: "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300",
  cancelled: "bg-burgundy-50 text-burgundy-700 dark:bg-burgundy-950/40 dark:text-burgundy-300",
};

// What staff can move an order to from each status.
const NEXT_STATUSES: Record<LiquorOrderStatus, LiquorOrderStatus[]> = {
  pending_payment: ["cancelled"],
  paid: ["processing", "delivered", "cancelled"],
  processing: ["delivered", "cancelled"],
  delivered: ["processing"],
  cancelled: [],
};

function OrderCard({ order }: { order: LiquorOrder }) {
  const [pending, startTransition] = useTransition();
  const fromCarHire = order.source === "car_hire";

  return (
    <li className="rounded-2xl border border-charcoal-100 bg-white p-5 dark:border-charcoal-800 dark:bg-charcoal-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex flex-wrap items-center gap-2 font-medium text-charcoal-950 dark:text-white">
            {liquorOrderReference(order.order_number)}
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_STYLES[order.status])}>
              {LIQUOR_ORDER_STATUS_LABELS[order.status]}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-charcoal-50 px-2.5 py-0.5 text-xs text-charcoal-600 dark:bg-charcoal-800 dark:text-charcoal-300">
              {fromCarHire ? <Car size={12} /> : <Store size={12} />}
              {fromCarHire ? "With car booking" : "Shop order"}
            </span>
          </p>
          <p className="mt-0.5 text-xs text-charcoal-500 dark:text-charcoal-400">
            Ordered {new Date(order.created_at).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <p className="font-display text-xl text-charcoal-950 dark:text-white">{formatKes(order.subtotal)}</p>
      </div>

      <ul className="mt-3 space-y-0.5 rounded-lg bg-charcoal-50 px-4 py-3 text-sm text-charcoal-700 dark:bg-charcoal-800 dark:text-charcoal-300">
        {order.items.map((item, i) => (
          <li key={i} className="flex justify-between gap-4">
            <span>
              {item.quantity} × {item.name}
            </span>
            <span className="tabular-nums">{formatKes(item.unit_price * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 grid gap-1.5 text-sm text-charcoal-700 sm:grid-cols-2 dark:text-charcoal-300">
        <p className="flex items-center gap-1.5">
          <Phone size={14} className="text-charcoal-400" />
          {order.full_name} ·{" "}
          <a href={`tel:+${order.phone}`} className="hover:text-burgundy-700">
            +{order.phone}
          </a>
        </p>
        <p className="flex items-center gap-1.5">
          <Receipt size={14} className="text-charcoal-400" />
          {order.mpesa_receipt ? `M-Pesa ${order.mpesa_receipt}` : order.paid_at ? "Paid (receipt pending)" : "Not paid"}
        </p>
        {fromCarHire && order.booking ? (
          <p className="flex items-center gap-1.5 sm:col-span-2">
            <Car size={14} className="text-charcoal-400" />
            Ready with the {order.booking.vehicle_name} — pick-up {formatDisplayDate(order.booking.start_date)}
          </p>
        ) : order.delivery_address ? (
          <p className="flex items-start gap-1.5 sm:col-span-2">
            <MapPin size={14} className="mt-0.5 flex-shrink-0 text-charcoal-400" />
            {order.delivery_address}
          </p>
        ) : null}
        {order.notes ? <p className="text-charcoal-500 sm:col-span-2 dark:text-charcoal-400">Note: {order.notes}</p> : null}
      </div>

      {NEXT_STATUSES[order.status].length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {NEXT_STATUSES[order.status].map((next) => (
            <button
              key={next}
              type="button"
              disabled={pending}
              onClick={() => {
                if (next === "cancelled" && !confirm("Cancel this order? Any refund is handled outside the system.")) return;
                startTransition(() => updateLiquorOrderStatus(order.id, next));
              }}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-sm font-medium disabled:opacity-50",
                next === "cancelled"
                  ? "border-charcoal-200 text-charcoal-600 hover:border-burgundy-400 hover:text-burgundy-700 dark:border-charcoal-700 dark:text-charcoal-300"
                  : "border-burgundy-600 bg-burgundy-600 text-white hover:bg-burgundy-700"
              )}
            >
              {next === "processing" ? "Mark processing" : next === "delivered" ? "Mark delivered" : next === "cancelled" ? "Cancel order" : next}
            </button>
          ))}
        </div>
      ) : null}
    </li>
  );
}

export function LiquorOrdersList({ orders }: { orders: LiquorOrder[] }) {
  if (orders.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-charcoal-200 p-8 text-center text-sm text-charcoal-500 dark:border-charcoal-700 dark:text-charcoal-400">
        No orders here.
      </p>
    );
  }
  return (
    <ul className="space-y-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </ul>
  );
}
