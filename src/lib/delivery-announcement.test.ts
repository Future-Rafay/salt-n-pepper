import assert from "node:assert/strict";
import test from "node:test";

import { buildDeliveryAnnouncement } from "./delivery-announcement";
import { formatMoney } from "./orders";

test("builds localized delivery copy from the checkout zone", () => {
  const zone = { postalCodes: ["8154"], minimumSubtotalRappen: 3000, freeDeliveryThresholdRappen: 6000 };

  assert.equal(
    buildDeliveryAnnouncement(zone, "de"),
    `Oberglatt, wir liefern! 8154 · Mindestbestellung ${formatMoney(3000, "de")} · Gratislieferung ab ${formatMoney(6000, "de")}`,
  );
  assert.equal(
    buildDeliveryAnnouncement(zone, "en"),
    `Oberglatt, we deliver! 8154 · ${formatMoney(3000, "en")} minimum · Free delivery from ${formatMoney(6000, "en")}`,
  );
});

test("omits the free-delivery claim when no threshold is configured", () => {
  assert.equal(
    buildDeliveryAnnouncement(
      { postalCodes: ["8154"], minimumSubtotalRappen: 3000, freeDeliveryThresholdRappen: null },
      "en",
    ),
    `Oberglatt, we deliver! 8154 · ${formatMoney(3000, "en")} minimum`,
  );
});
