import assert from "node:assert/strict";
import test from "node:test";

const valid = { sourceProductId: "source", sourceExists: true, targetProductId: "target", duplicate: false, requiredOptionGroups: 0 };

test("suggested products reject invalid relationships", async () => {
  process.env.DATABASE_URL = "mysql://test:test@127.0.0.1:3306/saltnpepper_test";
  const { assertProductSuggestionAllowed, assertPublishedOptionCapacity } = await import("@/server/services/menu-admin");
  for (const [change, code] of [
    [{ sourceExists: false }, "PRODUCT_NOT_FOUND"],
    [{ targetProductId: "source" }, "PRODUCT_CANNOT_SUGGEST_ITSELF"],
    [{ targetProductId: undefined }, "SUGGESTED_VARIANT_UNAVAILABLE"],
    [{ duplicate: true }, "PRODUCT_SUGGESTION_ALREADY_EXISTS"],
    [{ requiredOptionGroups: 1 }, "SUGGESTED_PRODUCT_REQUIRES_OPTIONS"],
  ] as const) {
    assert.throws(() => assertProductSuggestionAllowed({ ...valid, ...change }), (error) => error instanceof Error && "code" in error && error.code === code);
  }
  assert.doesNotThrow(() => assertProductSuggestionAllowed(valid));
  assert.throws(() => assertPublishedOptionCapacity({ productActive: true, groupActive: true, minimumSelections: 1, activeChoices: 0 }), (error) => error instanceof Error && "code" in error && error.code === "OPTION_GROUP_REQUIRES_CHOICES");
  assert.doesNotThrow(() => assertPublishedOptionCapacity({ productActive: true, groupActive: true, minimumSelections: 1, activeChoices: 1 }));
});
