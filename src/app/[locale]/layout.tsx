import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { CartProvider } from "@/components/site/cart-context";
import { SiteShell } from "@/components/site/site-shell";
import { locales } from "@/i18n/config";
import { getCurrentUser } from "@/server/auth/current-user";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!locales.includes(locale as "de" | "en")) notFound();
  
  const currentUser = await getCurrentUser();
  const user = currentUser ? { name: currentUser.name, email: currentUser.email, image: currentUser.image, role: currentUser.role } : null;

  return (
    <CartProvider>
      <SiteShell locale={locale as "de" | "en"} user={user}>
        {children}
      </SiteShell>
    </CartProvider>
  );
}

