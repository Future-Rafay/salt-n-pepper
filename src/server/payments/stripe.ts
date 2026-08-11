import Stripe from "stripe";

import { getStripeEnv } from "@/config/env";

let client: Stripe | undefined;

export function getStripe() {
  client ??= new Stripe(getStripeEnv().STRIPE_SECRET_KEY);
  return client;
}
