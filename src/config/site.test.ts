import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";

import { siteConfig, supportedCurrencies, supportedLocales } from "@/config/site";
import proxy from "@/proxy";
import { contactSchema } from "@/server/validators/contact";

test("site locale and currency use supported single-site values", () => {
  assert.equal(supportedLocales.includes(siteConfig.locale), true);
  assert.equal(supportedCurrencies.includes(siteConfig.currency), true);
});

test("both configured public locales remain routable", () => {
  for (const locale of supportedLocales) {
    const response = proxy(new NextRequest(`https://saltnpepper.ch/${locale}/menu?view=all`));
    assert.equal(response.headers.get("location"), null);
  }
});

test("public contact input accepts both public locales", () => {
  const input = {
    name: "Test Guest",
    email: "guest@example.com",
    subject: "Reservation",
    message: "Please contact me about a reservation.",
    locale: siteConfig.locale,
    website: "",
  };
  for (const locale of supportedLocales) {
    assert.equal(contactSchema.safeParse({ ...input, locale }).success, true);
  }
});
