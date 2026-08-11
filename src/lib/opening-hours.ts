const weekdays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const;

type OpeningWindow = {
  fulfillmentType: "PICKUP" | "DELIVERY";
  weekday: (typeof weekdays)[number];
  startMinute: number;
  endMinute: number;
};

const dayLabels = {
  de: ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"],
  en: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
} as const;

function time(minute: number) {
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}

export function groupOpeningHours(windows: OpeningWindow[], locale: "de" | "en") {
  return (["PICKUP", "DELIVERY"] as const).map((fulfillmentType) => ({
    fulfillmentType,
    label:
      fulfillmentType === "PICKUP"
        ? locale === "de" ? "Abholung" : "Pickup"
        : locale === "de" ? "Lieferung" : "Delivery",
    days: weekdays.map((weekday, index) => {
      const ranges = windows
        .filter((window) => window.fulfillmentType === fulfillmentType && window.weekday === weekday)
        .sort((a, b) => a.startMinute - b.startMinute)
        .map((window) => `${time(window.startMinute)}–${time(window.endMinute)}`);

      return { weekday, label: dayLabels[locale][index], value: ranges.join(", ") || (locale === "de" ? "Geschlossen" : "Closed") };
    }),
  }));
}
