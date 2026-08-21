import { formatMoney } from "@/lib/orders";

type DeliveryAnnouncementZone = {
  postalCodes: string[];
  minimumSubtotalRappen: number;
  freeDeliveryThresholdRappen: number | null;
};

export function buildDeliveryAnnouncement(zone: DeliveryAnnouncementZone, locale: "de" | "en") {
  const postcodes = [...new Set(zone.postalCodes)].sort().join(", ");
  if (!postcodes) return null;

  const minimum = formatMoney(zone.minimumSubtotalRappen, locale);
  const freeFrom = zone.freeDeliveryThresholdRappen === null ? null : formatMoney(zone.freeDeliveryThresholdRappen, locale);

  if (locale === "de") {
    return `Oberglatt, wir liefern! ${postcodes} · Mindestbestellung ${minimum}${freeFrom ? ` · Gratislieferung ab ${freeFrom}` : ""}`;
  }

  return `Oberglatt, we deliver! ${postcodes} · ${minimum} minimum${freeFrom ? ` · Free delivery from ${freeFrom}` : ""}`;
}
