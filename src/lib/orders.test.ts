import assert from "node:assert/strict";
import test from "node:test";

import { allocateDiscount, assertOptionCount, formatOrderNumber, nextOrderStatus, promoDiscount, publicOrderAddress } from "@/lib/orders";
import { zurichDateToUtc, zurichParts } from "@/lib/zurich-time";

test("order money and lifecycle rules stay server-shaped", () => {
  assert.equal(formatOrderNumber(42), "SNP-000042");
  assert.equal(promoDiscount(5_000, { type: "PERCENT", value: 1_000, minimumSubtotalRappen: 2_500 }), 500);
  assert.equal(promoDiscount(300, { type: "FIXED", value: 500, minimumSubtotalRappen: 0 }), 300);
  assert.equal(nextOrderStatus("PREPARING", "PICKUP"), "READY_FOR_PICKUP");
  assert.equal(nextOrderStatus("PREPARING", "DELIVERY"), "OUT_FOR_DELIVERY");
  assert.equal(nextOrderStatus("COMPLETED", "DELIVERY"), null);
  assert.equal(assertOptionCount({ minimumSelections: 1, maximumSelections: 2 }, 2), true);
  assert.equal(assertOptionCount({ minimumSelections: 1, maximumSelections: 2 }, 3), false);
  assert.deepEqual(allocateDiscount([850, 1_200], 1_000), [0, 1_050]);
});

test("public order addresses never expose the BigInt order id", () => {
  const address = publicOrderAddress({ recipientName: "Guest", phone: "+41", street: "Main 1", streetExtra: null, postalCode: "8304", city: "Wallisellen", countryCode: "CH", orderId: 42n } as Parameters<typeof publicOrderAddress>[0] & { orderId: bigint });
  assert.equal(JSON.stringify(address).includes("orderId"), false);
  assert.doesNotThrow(() => JSON.stringify(address));
});

test("Zurich local slots convert correctly across daylight saving time", () => {
  const winter = zurichDateToUtc("2026-01-15", 12 * 60);
  const summer = zurichDateToUtc("2026-07-15", 12 * 60);
  assert.equal(winter.toISOString(), "2026-01-15T11:00:00.000Z");
  assert.equal(summer.toISOString(), "2026-07-15T10:00:00.000Z");
  assert.deepEqual(zurichParts(summer), { date: "2026-07-15", weekday: "WEDNESDAY", minute: 720 });
});
