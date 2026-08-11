type DeliveryAnnouncementZone = {
  postalCodes: string[];
  minimumSubtotalRappen: number;
  freeDeliveryThresholdRappen: number | null;
};

function chf(rappen: number) {
  const francs = rappen / 100;
  return `CHF ${Number.isInteger(francs) ? francs : francs.toFixed(2)}`;
}

export function buildDeliveryAnnouncement(zone: DeliveryAnnouncementZone, locale: "de" | "en") {
  const postcodes = [...new Set(zone.postalCodes)].sort().join(", ");
  if (!postcodes) return null;

  const minimum = chf(zone.minimumSubtotalRappen);
  const freeFrom = zone.freeDeliveryThresholdRappen === null ? null : chf(zone.freeDeliveryThresholdRappen);

  if (locale === "de") {
    return `Oberglatt, wir liefern! ${postcodes} · Mindestbestellung ${minimum}${freeFrom ? ` · Gratislieferung ab ${freeFrom}` : ""}`;
  }

  return `Oberglatt, we deliver! ${postcodes} · ${minimum} minimum${freeFrom ? ` · Free delivery from ${freeFrom}` : ""}`;
}
