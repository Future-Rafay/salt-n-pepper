import type { Order } from "../types";

export type PaperWidth = 58 | 80;

const lineWidth = { 58: 32, 80: 48 };

function money(rappen: number) {
  return `CHF ${(rappen / 100).toFixed(2)}`;
}

function wrap(text: string, width: PaperWidth, indent = "") {
  const max = lineWidth[width] - indent.length;
  const words = text.trim().split(/\s+/);
  const rows: string[] = [];
  let row = "";
  for (const word of words) {
    if (word.length > max) {
      if (row) rows.push(row);
      for (let index = 0; index < word.length; index += max) rows.push(word.slice(index, index + max));
      row = "";
    } else if (!row || row.length + word.length + 1 <= max) {
      row += `${row ? " " : ""}${word}`;
    } else {
      rows.push(row);
      row = word;
    }
  }
  if (row) rows.push(row);
  return (rows.length ? rows : [""]).map((value) => `${indent}${value}`);
}

function priceLine(label: string, value: string, width: PaperWidth) {
  const gap = lineWidth[width] - label.length - value.length;
  return gap > 0 ? `${label}${" ".repeat(gap)}${value}` : [...wrap(label, width), value];
}

export function formatReceipt(order: Order, width: PaperWidth) {
  const divider = "-".repeat(lineWidth[width]);
  const german = order.locale === "DE";
  const dateTime = (value: string) => new Intl.DateTimeFormat(german ? "de-CH" : "en-CH", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Zurich",
  }).format(new Date(value));
  const rows = [
    "SALTNPPEPPER",
    ...wrap("Allmendstrasse 18, 8154 Oberglatt", width),
    "+41 76 408 94 30",
    "info@saltnpepper.ch",
    "saltnpepper.ch",
    "",
    divider,
    ...wrap(`Order / Bestellung: ${order.orderNumber}`, width),
    ...wrap(`Type / Art: ${order.fulfillmentType}`, width),
    ...wrap(`Placed / Bestellt: ${dateTime(order.createdAt)}`, width),
    ...(order.scheduledFor ? wrap(`Scheduled / Geplant: ${dateTime(order.scheduledFor)}`, width) : []),
    ...(order.estimatedReadyAt ? wrap(`ETA: ${dateTime(order.estimatedReadyAt)}`, width) : []),
    ...wrap(`Customer / Kunde: ${order.customerName}`, width),
    ...wrap(`Phone / Telefon: ${order.customerPhone}`, width),
    ...(order.address
      ? wrap(
          `Address / Adresse: ${order.address.street}${order.address.streetExtra ? `, ${order.address.streetExtra}` : ""}, ${order.address.postalCode} ${order.address.city}`,
          width,
        )
      : []),
    divider,
    ...order.items.flatMap((item) => [
      ...wrap(`${item.quantity}x ${german ? item.productNameDe : item.productNameEn}`, width),
      ...(item.variantNameDe || item.variantNameEn
        ? wrap((german ? item.variantNameDe : item.variantNameEn) || "", width, "  ")
        : []),
      ...item.options.flatMap((option) => wrap(`+ ${german ? option.nameDe : option.nameEn}`, width, "  ")),
      ...priceLine("", money(item.lineSubtotalRappen), width),
    ]),
    divider,
    ...priceLine("Subtotal / Zwischensumme", money(order.subtotalRappen), width),
    ...(order.discountRappen ? priceLine("Discount / Rabatt", `-${money(order.discountRappen)}`, width) : []),
    ...(order.deliveryFeeRappen ? priceLine("Delivery / Lieferung", money(order.deliveryFeeRappen), width) : []),
    ...(order.taxAmountRappen ? priceLine("Tax / MwSt.", money(order.taxAmountRappen), width) : []),
    ...priceLine("TOTAL / SUMME", money(order.totalRappen), width),
    ...wrap(`Payment / Zahlung: ${order.paymentMethod} (${order.payment?.status || "PENDING"})`, width),
    ...(order.note ? ["", ...wrap(`Note / Hinweis: ${order.note}`, width)] : []),
    "",
    divider,
    "Feedback / Beschwerden",
    "+41 76 408 94 30",
    "info@saltnpepper.ch",
    "",
    "Vielen Dank / Thank you!",
  ];
  return `${rows.flat().join("\n")}\n\n\n`;
}

export function receiptToEscPosText(order: Order, width: PaperWidth) {
  return formatReceipt(order, width);
}
