import assert from "node:assert/strict";
import { test } from "node:test";

import { createStaffAccessToken, StaffMobileAuthError, verifyStaffAccessToken } from "@/server/auth/staff-mobile-token";

const payload = { sid: "session-1", sub: "user-1", role: "STAFF" as const };

test("staff access tokens verify with the signing secret", () => {
  const token = createStaffAccessToken(payload, "secret-1", 1_000);
  assert.equal(verifyStaffAccessToken(token, "secret-1", 1_000).sub, payload.sub);
  assert.throws(() => verifyStaffAccessToken(token, "secret-2", 1_000), StaffMobileAuthError);
});

test("staff access tokens expire", () => {
  const token = createStaffAccessToken(payload, "secret-1", 1_000);
  assert.throws(() => verifyStaffAccessToken(token, "secret-1", 901_001), StaffMobileAuthError);
});
