import type { Order } from "../types";

export type PaperWidth = 58 | 80;

const lineWidth = { 58: 32, 80: 48 };

function money(rappen: number) {
  return `CHF ${(rappen / 100).toFixed(2)}`;
}

function line(text = "", width: PaperWidth = 58) {
  return text.slice(0, lineWidth[width]).padEnd(lineWidth[width], " ");
}

export function formatReceipt(order: Order, width: PaperWidth) {
  const rows = [
    line("SALTNPPEPPER", width),
    line(order.orderNumber, width),
    line(order.fulfillmentType, width),
    line(`Customer: ${order.customerName}`, width),
    line(`Phone: ${order.customerPhone}`, width),
    line("", width),
    ...order.items.flatMap((item) => [
      line(`${item.quantity}x ${item.productNameEnSnapshot}`, width),
      ...(item.variantNameEnSnapshot ? [line(`  ${item.variantNameEnSnapshot}`, width)] : []),
      ...item.options.map((option) => line(`  + ${option.nameEnSnapshot}`, width)),
      line(`  ${money(item.lineSubtotalRappen)}`, width),
    ]),
    line("", width),
    line(`Total ${money(order.totalRappen)}`, width),
    order.note ? line(`Note: ${order.note}`, width) : "",
  ];
  return `${rows.filter(Boolean).join("\n")}\n\n`;
}

export function receiptToEscPosText(order: Order, width: PaperWidth) {
  return `\x1b@\x1ba\x01${formatReceipt(order, width)}\x1dV\x00`;
}
