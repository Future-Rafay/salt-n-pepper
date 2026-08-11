import assert from "node:assert/strict";
import test from "node:test";
import type Stripe from "stripe";

test("failed Stripe events can be replayed and processed events remain deduplicated", async (context) => {
  const testDatabaseUrl = process.env.TEST_DATABASE_URL;
  if (!testDatabaseUrl || testDatabaseUrl === process.env.DATABASE_URL) {
    context.skip("TEST_DATABASE_URL must point to a separate isolated database.");
    return;
  }

  process.env.DATABASE_URL = testDatabaseUrl;
  process.env.DATABASE_CONNECTION_LIMIT = "1";
  process.env.DATABASE_SSL ??= "false";

  const [{ prisma }, { processStripeEvent }] = await Promise.all([
    import("@/server/db"),
    import("@/server/services/ordering"),
  ]);
  const eventId = `evt_phase5_replay_${crypto.randomUUID()}`;
  const event = { id: eventId, type: "customer.created" } as Stripe.Event;

  try {
    await prisma.stripeWebhookEvent.create({
      data: { eventId, type: event.type, status: "FAILED", error: "Previous delivery failed" },
    });
    await processStripeEvent(event);
    await processStripeEvent(event);

    const rows = await prisma.stripeWebhookEvent.findMany({ where: { eventId } });
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.status, "PROCESSED");
    assert.equal(rows[0]?.error, null);
  } finally {
    await prisma.stripeWebhookEvent.deleteMany({ where: { eventId } });
    await prisma.$disconnect();
  }
});
