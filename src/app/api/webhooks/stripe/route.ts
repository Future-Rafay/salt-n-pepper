import { getStripeEnv } from "@/config/env";
import { getStripe } from "@/server/payments/stripe";
import { processStripeEvent } from "@/server/services/ordering";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return Response.json({ error: "MISSING_SIGNATURE" }, { status: 400 });
  try {
    const event = getStripe().webhooks.constructEvent(await request.text(), signature, getStripeEnv().STRIPE_WEBHOOK_SECRET);
    await processStripeEvent(event);
    return Response.json({ received: true });
  } catch {
    return Response.json({ error: "INVALID_WEBHOOK" }, { status: 400 });
  }
}
