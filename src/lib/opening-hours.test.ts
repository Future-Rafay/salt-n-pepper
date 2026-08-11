import assert from "node:assert/strict";
import test from "node:test";

import { groupOpeningHours } from "./opening-hours";

test("groups service windows by type and marks missing weekdays closed", () => {
  const [pickup, delivery] = groupOpeningHours(
    [
      { fulfillmentType: "PICKUP", weekday: "MONDAY", startMinute: 660, endMinute: 840 },
      { fulfillmentType: "PICKUP", weekday: "MONDAY", startMinute: 1020, endMinute: 1320 },
    ],
    "en",
  );

  assert.equal(pickup.days[0].value, "11:00–14:00, 17:00–22:00");
  assert.equal(delivery.days[0].value, "Closed");
});
