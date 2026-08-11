import type { Metadata } from "next";
import { CheckoutForm } from "@/components/site/checkout-form";
import { getCurrentUser } from "@/server/auth/current-user";

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale === "en" ? "en" : "de";
  const user = await getCurrentUser();
  return <div className="mx-auto max-w-6xl px-4 py-12"><h1 className="mb-8 font-display text-4xl font-bold">{locale === "de" ? "Kasse" : "Checkout"}</h1><CheckoutForm locale={locale} user={user ? { name: user.name, email: user.email } : undefined} /></div>;
}
export const metadata: Metadata = { robots: { index: false, follow: false } };
