import assert from "node:assert/strict";
import test from "node:test";

import { securityHeaders } from "@/config/security";

test("global security headers block framing and unsafe object embedding", () => {
  const headers = new Map(securityHeaders.map(({ key, value }) => [key, value]));
  assert.equal(headers.get("X-Frame-Options"), "DENY");
  assert.match(headers.get("Content-Security-Policy") ?? "", /frame-ancestors 'none'/);
  assert.match(headers.get("Content-Security-Policy") ?? "", /object-src 'none'/);
  assert.doesNotMatch(headers.get("Content-Security-Policy") ?? "", /unsafe-eval/);
  assert.equal(headers.get("X-Content-Type-Options"), "nosniff");
});
