import type { Metadata } from "next";
import { CartPage } from "@/components/site/cart-page";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  return <CartPage locale={(await params).locale === "en" ? "en" : "de"} />;
}
