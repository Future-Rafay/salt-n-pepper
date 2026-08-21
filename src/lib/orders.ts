import { createHash } from "node:crypto";

import { siteConfig } from "@/config/site";
import type { FulfillmentType, OrderStatus, PromoType } from "@/generated/prisma/enums";

const orderStatusLabels: Record<OrderStatus, { de: string; en: string }> = {
  PAYMENT_PENDING: { de: "Zahlungsbestätigung läuft", en: "Confirming payment" },
  CONFIRMED: { de: "Bestätigt", en: "Confirmed" },
  PREPARING: { de: "In Zubereitung", en: "Preparing" },
  READY_FOR_PICKUP: { de: "Abholbereit", en: "Ready for pickup" },
  OUT_FOR_DELIVERY: { de: "Unterwegs", en: "Out for delivery" },
  COMPLETED: { de: "Abgeschlossen", en: "Completed" },
  CANCELLED: { de: "Storniert", en: "Cancelled" },
};

export function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function formatOrderNumber(id: bigint | number | string) {
  return `SNP-${id.toString().padStart(6, "0")}`;
}

export function parseOrderNumber(value: string) {
  const match = /^SNP-(\d+)$/.exec(value.toUpperCase());
  return match ? BigInt(match[1]) : null;
}

export function formatMoney(minorUnits: number, locale: "de" | "en" = siteConfig.locale) {
  return new Intl.NumberFormat(locale === "de" ? "de-CH" : "en-CH", {
    style: "currency",
    currency: siteConfig.currency,
  }).format(minorUnits / 100);
}

export function orderStatusLabel(status: OrderStatus, locale: "de" | "en") {
  return orderStatusLabels[status][locale];
}

export function formatMoneyInput(minorUnits: number) {
  return (minorUnits / 100).toFixed(2);
}

export function formatMinuteOfDay(minute: number) {
  const safe = minute === 1440 ? 1439 : minute;
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

export function publicOrderAddress(address: { recipientName: string; phone: string; street: string; streetExtra: string | null; postalCode: string; city: string; countryCode: string } | null) {
  return address ? { recipientName: address.recipientName, phone: address.phone, street: address.street, streetExtra: address.streetExtra, postalCode: address.postalCode, city: address.city, countryCode: address.countryCode } : null;
}

export function allocateDiscount(lineTotals: number[], discount: number) {
  let remaining = discount;
  return lineTotals.map((total) => {
    const applied = Math.min(remaining, total);
    remaining -= applied;
    return total - applied;
  });
}

export function promoDiscount(
  subtotalRappen: number,
  promo: { type: PromoType; value: number; minimumSubtotalRappen: number } | null,
) {
  if (!promo || subtotalRappen < promo.minimumSubtotalRappen) return 0;
  const discount =
    promo.type === "FIXED"
      ? promo.value
      : Math.round((subtotalRappen * Math.min(promo.value, 10_000)) / 10_000);
  return Math.max(0, Math.min(subtotalRappen, discount));
}

export function nextOrderStatus(status: OrderStatus, fulfillmentType: FulfillmentType) {
  const transitions: Partial<Record<OrderStatus, OrderStatus>> =
    fulfillmentType === "PICKUP"
      ? {
          CONFIRMED: "PREPARING",
          PREPARING: "READY_FOR_PICKUP",
          READY_FOR_PICKUP: "COMPLETED",
        }
      : {
          CONFIRMED: "PREPARING",
          PREPARING: "OUT_FOR_DELIVERY",
          OUT_FOR_DELIVERY: "COMPLETED",
        };
  return transitions[status] ?? null;
}

export function assertOptionCount(
  group: { minimumSelections: number; maximumSelections: number },
  selectedCount: number,
) {
  return selectedCount >= group.minimumSelections && selectedCount <= group.maximumSelections;
}
