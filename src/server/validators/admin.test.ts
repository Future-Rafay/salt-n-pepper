import assert from "node:assert/strict";
import test from "node:test";

import { openingWindowSchema, optionGroupSchema, postalCodeSchema, productSchema, productSuggestionSchema, promoSchema, refundSchema } from "@/server/validators/admin";

test("Phase 4 admin trust boundaries reject unsafe schedule, promo, and refund input", () => {
  assert.equal(openingWindowSchema.safeParse({ fulfillmentType: "DELIVERY", weekday: "MONDAY", startMinute: 900, endMinute: 800, active: "on", sortOrder: 0 }).success, false);
  assert.equal(promoSchema.safeParse({ code: "TOO-MUCH", type: "PERCENT", value: "100.01", minimumSubtotalRappen: "0", startsAt: "", endsAt: "", totalUsageLimit: "", perCustomerLimit: "", active: "on" }).success, false);
  assert.equal(refundSchema.safeParse({ orderNumber: "SNP-000123", amountRappen: "0", reason: "requested", refundKey: crypto.randomUUID(), cancelOrder: "false" }).success, false);
});

test("admin form decoding accepts omitted checkboxes and fixture IDs", () => {
  const product = productSchema.parse({ categoryId: "mock-category-1", slug: "test", nameDe: "Test", nameEn: "Test", sortOrder: "0", spiceLevel: "", allergenIds: "" });
  assert.equal(product.active, false);
  assert.equal(product.isVegetarian, false);
  assert.equal(optionGroupSchema.parse({ productId: "mock-product-1", nameDe: "Sauce", nameEn: "Sauce", minimumSelections: "0", maximumSelections: "1", sortOrder: "0" }).required, false);
  assert.equal(optionGroupSchema.parse({ productId: "mock-product-1", nameDe: "Drink", nameEn: "Drink", minimumSelections: "1", maximumSelections: "1", sortOrder: "0" }).required, true);
  assert.equal(productSuggestionSchema.parse({ productId: "mock-product-1", suggestedVariantId: "mock-variant-2", sortOrder: "2" }).sortOrder, 2);
  assert.equal(promoSchema.parse({ code: "SAVE10", type: "PERCENT", value: "10", minimumSubtotalRappen: "25.00", startsAt: "", endsAt: "", totalUsageLimit: "", perCustomerLimit: "" }).value, 1000);
  assert.equal(postalCodeSchema.parse({ deliveryZoneId: "mock-zone-1", postalCode: "8304" }).deliveryZoneId, "mock-zone-1");
});
