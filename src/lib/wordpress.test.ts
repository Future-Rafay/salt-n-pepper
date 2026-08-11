import assert from "node:assert/strict";
import test from "node:test";

import { buildPostContent, sanitizeBlogHtml } from "./wordpress";

test("sanitizes WordPress markup while preserving article formatting", () => {
  const result = sanitizeBlogHtml('<h2>Guide</h2><script>alert(1)</script><a href="javascript:alert(1)" onclick="bad()">link</a><img src="https://example.com/food.jpg" onerror="bad()">');

  assert.match(result, /<h2>Guide<\/h2>/);
  assert.doesNotMatch(result, /script|javascript|onclick|onerror/);
  assert.match(result, /loading="lazy"/);
});

test("adds the WordPress excerpt when an article body is only a short introduction", () => {
  const result = buildPostContent("<p>Short introduction</p>", "<p>Useful summary for the reader.</p>");
  assert.match(result, /Short introduction/);
  assert.match(result, /Useful summary/);
});
