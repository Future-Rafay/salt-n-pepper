import { formatChf, groupOrders, localizedSnapshot, totalItemQuantity } from "./presentation.ts";
import { formatReceipt } from "./printer/receipt.ts";
import type { Order } from "./types.ts";

function equal(actual: unknown, expected: unknown) {
  if (actual !== expected) throw new Error(`Expected ${String(expected)}, received ${String(actual)}`);
}

function order(status: Order["status"], createdAt: string, quantity = 1): Order {
  return {
    orderNumber: `SNP-${createdAt}`,
    locale: "DE",
    customerName: "Test",
    customerEmail: "test@example.com",
    customerPhone: "+41000000000",
    fulfillmentType: "PICKUP",
    status,
    paymentMethod: "PAY_AT_PICKUP",
    payment: { provider: "CASH", status: "PENDING", amountRappen: 1000, refundedRappen: 0, paidAt: null },
    createdAt,
    updatedAt: createdAt,
    scheduledFor: null,
    estimatedReadyAt: null,
    subtotalRappen: 1000,
    discountRappen: 0,
    deliveryFeeRappen: 0,
    taxRateBps: null,
    taxAmountRappen: 0,
    totalRappen: 1000,
    remainingRefundableRappen: 0,
    version: 0,
    note: null,
    deliveryZoneNameDe: null,
    deliveryZoneNameEn: null,
    completedAt: null,
    cancelledAt: null,
    cancellationReason: null,
    address: null,
    items: [{
      imageUrl: null,
      productNameDe: "Gericht",
      productNameEn: "Dish",
      variantNameDe: null,
      variantNameEn: null,
      unitPriceRappen: 1000,
      quantity,
      lineSubtotalRappen: 1000,
      options: [],
    }],
    statusEvents: [],
    allowedActions: { nextStatus: null, canConfirmCash: false, canCancel: false, canRefundAndCancel: false },
  };
}

const sections = groupOrders([
  order("PREPARING", "2026-08-12T11:00:00Z"),
  order("CONFIRMED", "2026-08-12T10:30:00Z", 3),
  order("CONFIRMED", "2026-08-12T10:00:00Z"),
], "de");

equal(sections.map((section) => section.key).join(","), "new,preparing");
equal(sections[0].data[0].createdAt, "2026-08-12T10:00:00Z");
equal(totalItemQuantity(sections[0].data[1]), 3);
equal(localizedSnapshot("Gericht", "Dish", "en"), "Dish");
if (!/12\.34/.test(formatChf(1234, "de"))) throw new Error("CHF formatting failed");
const longOrder = order("CONFIRMED", "2026-08-12T10:00:00Z");
longOrder.items[0].productNameDe = "Sehr langes Poulet Tikka mit hausgemachter Spezialmarinade";
longOrder.note = "Bitte klingeln und die Bestellung vorsichtig transportieren.";
for (const width of [58, 80] as const) {
  const receipt = formatReceipt(longOrder, width);
  const columns = width === 58 ? 32 : 48;
  if (receipt.trimEnd().split("\n").some((line) => line.length > columns)) throw new Error(`${width}mm receipt overflowed`);
  if (!receipt.includes("Feedback / Beschwerden") || !receipt.includes("+41 76 408 94 30")) throw new Error("Receipt contact section missing");
  if (receipt.includes("\x1dV")) throw new Error("Receipt preview must not cut paper");
}
console.log("presentation helpers: ok");
