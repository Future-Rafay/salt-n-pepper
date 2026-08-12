import type { Order, OrderStatus, PaymentStatus } from "./types.ts";

export type Language = "de" | "en";
export const DEFAULT_LANGUAGE: Language = "de";

export const copy = {
  de: {
    newOrders: "Neue Bestellungen",
    preparing: "In Zubereitung",
    ready: "Bereit & Lieferung",
  },
  en: {
    newOrders: "New orders",
    preparing: "Preparing",
    ready: "Ready & delivery",
  },
} as const;

export function localizedSnapshot(de: string | null, en: string | null, language: Language) {
  return (language === "de" ? de || en : en || de) ?? "—";
}

export function formatChf(rappen: number, language: Language) {
  return new Intl.NumberFormat(language === "de" ? "de-CH" : "en-CH", {
    style: "currency",
    currency: "CHF",
  }).format(rappen / 100);
}

export function formatZurichDateTime(value: string, language: Language) {
  return new Intl.DateTimeFormat(language === "de" ? "de-CH" : "en-CH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Zurich",
  }).format(new Date(value));
}

const statusLabels: Record<OrderStatus, Record<Language, string>> = {
  PAYMENT_PENDING: { de: "Zahlung ausstehend", en: "Payment pending" },
  CONFIRMED: { de: "Bestätigt", en: "Confirmed" },
  PREPARING: { de: "In Zubereitung", en: "Preparing" },
  READY_FOR_PICKUP: { de: "Abholbereit", en: "Ready for pickup" },
  OUT_FOR_DELIVERY: { de: "Unterwegs", en: "Out for delivery" },
  COMPLETED: { de: "Abgeschlossen", en: "Completed" },
  CANCELLED: { de: "Storniert", en: "Cancelled" },
};

export function statusLabel(status: OrderStatus, language: Language) {
  return statusLabels[status][language];
}

export function fulfillmentLabel(type: Order["fulfillmentType"], language: Language) {
  return type === "DELIVERY"
    ? language === "de" ? "Lieferung" : "Delivery"
    : language === "de" ? "Abholung" : "Pickup";
}

export function paymentStatusLabel(status: PaymentStatus | null, language: Language) {
  if (!status) return language === "de" ? "Nicht erfasst" : "Not recorded";
  const labels: Record<PaymentStatus, Record<Language, string>> = {
    PENDING: { de: "Ausstehend", en: "Pending" },
    PAID: { de: "Bezahlt", en: "Paid" },
    FAILED: { de: "Fehlgeschlagen", en: "Failed" },
    PARTIALLY_REFUNDED: { de: "Teilweise erstattet", en: "Partially refunded" },
    REFUNDED: { de: "Erstattet", en: "Refunded" },
  };
  return labels[status][language];
}

export function totalItemQuantity(order: Pick<Order, "items">) {
  return order.items.reduce((total, item) => total + item.quantity, 0);
}

const workflows = [
  { key: "new", titleKey: "newOrders", statuses: ["PAYMENT_PENDING", "CONFIRMED"] },
  { key: "preparing", titleKey: "preparing", statuses: ["PREPARING"] },
  { key: "ready", titleKey: "ready", statuses: ["READY_FOR_PICKUP", "OUT_FOR_DELIVERY"] },
] as const;

export function groupOrders(orders: Order[], language: Language) {
  return workflows.flatMap((workflow) => {
    const data = orders
      .filter((order) => (workflow.statuses as readonly OrderStatus[]).includes(order.status))
      .sort((a, b) => new Date(a.scheduledFor ?? a.createdAt).getTime() - new Date(b.scheduledFor ?? b.createdAt).getTime());
    return data.length ? [{ key: workflow.key, title: copy[language][workflow.titleKey], data }] : [];
  });
}
