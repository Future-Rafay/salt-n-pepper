import assert from "node:assert/strict";
import { test } from "node:test";

import { allowedOrderActions } from "@/server/services/staff-mobile-actions";
import { toJsonSafeValue } from "@/server/services/json-safe";

test("staff allowed actions keep refund-required Stripe orders out of routine cancellation", () => {
  assert.deepEqual(
    allowedOrderActions({
      status: "CONFIRMED",
      fulfillmentType: "DELIVERY",
      payment: { provider: "STRIPE", status: "PAID" },
    }),
    { nextStatus: "PREPARING", canConfirmCash: false, canCancel: false, canRefundAndCancel: true },
  );
});

test("staff allowed actions expose routine cash confirmation and cancellation", () => {
  assert.deepEqual(
    allowedOrderActions({
      status: "CONFIRMED",
      fulfillmentType: "PICKUP",
      payment: { provider: "CASH", status: "PENDING" },
    }),
    { nextStatus: "PREPARING", canConfirmCash: true, canCancel: true, canRefundAndCancel: false },
  );
});


test("staff mobile DTO sanitizer converts nested BigInts before JSON responses", () => {
  const value = toJsonSafeValue({ id: 1n, payment: { orderId: 2n }, items: [{ orderId: 3n }] });
  assert.deepEqual(value, { id: "1", payment: { orderId: "2" }, items: [{ orderId: "3" }] });
  assert.doesNotThrow(() => JSON.stringify(value));
});
