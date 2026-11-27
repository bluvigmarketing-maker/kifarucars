// The live Kifaru Liquor shop — used for "View in shop" links in the admin.
export const LIQUOR_SHOP_URL = "https://liqour.kifaru.ke";

export const LIQUOR_ORDER_STATUS_LABELS = {
  pending_payment: "Awaiting payment",
  paid: "Paid — new",
  processing: "Processing",
  delivered: "Delivered",
  cancelled: "Cancelled",
} as const;

export function liquorOrderReference(orderNumber: number) {
  return `KL-${String(orderNumber).padStart(5, "0")}`;
}
