import assert from "node:assert/strict";
import test from "node:test";

import { buildDeliveryAnnouncement } from "./delivery-announcement";

test("builds localized delivery copy from the checkout zone", () => {
  const zone = { postalCodes: ["8154"], minimumSubtotalRappen: 3000, freeDeliveryThresholdRappen: 6000 };

  assert.equal(
    buildDeliveryAnnouncement(zone, "de"),
    "Oberglatt, wir liefern! 8154 · Mindestbestellung CHF 30 · Gratislieferung ab CHF 60",
  );
  assert.equal(
    buildDeliveryAnnouncement(zone, "en"),
    "Oberglatt, we deliver! 8154 · CHF 30 minimum · Free delivery from CHF 60",
  );
});

test("omits the free-delivery claim when no threshold is configured", () => {
  assert.equal(
    buildDeliveryAnnouncement(
      { postalCodes: ["8154"], minimumSubtotalRappen: 3000, freeDeliveryThresholdRappen: null },
      "en",
    ),
    "Oberglatt, we deliver! 8154 · CHF 30 minimum",
  );
});
