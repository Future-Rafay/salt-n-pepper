import { MenuClient } from "@/components/site/menu-client";
import { getPublicMenu } from "@/server/services/catalog";
import { localizedMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return localizedMetadata((await params).locale, "/menu", { de: "Speisekarte", en: "Menu" }, { de: "Entdecken Sie die Speisekarte von SaltNPepper.", en: "Explore the SaltNPepper menu." });
}

export default async function MenuPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale === "en" ? "en" : "de";
  return <MenuClient locale={locale} categories={await getPublicMenu(locale.toUpperCase() as "DE" | "EN")} />;
}
