import { ArrowUpRight, Clock3, Mail, MapPin, Phone, ShoppingBag, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { restaurantContent } from "@/content/restaurant";
import { formatChf } from "@/lib/orders";
import { localizedMetadata } from "@/lib/metadata";
import { getPublicConfig, getPublicMenu } from "@/server/services/catalog";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return localizedMetadata(
    (await params).locale,
    "",
    { de: "SaltNPepper Restaurant Oberglatt", en: "SaltNPepper Restaurant Oberglatt" },
    {
      de: "SaltNPepper ist Ihr lokales Restaurant an der Allmendstrasse 18 in Oberglatt.",
      en: "SaltNPepper is your local restaurant at Allmendstrasse 18 in Oberglatt.",
    },
  );
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale === "en" ? "en" : "de";
  const de = locale === "de";
  const [{ brand, fulfillment, hours }, categories] = await Promise.all([
    getPublicConfig(),
    getPublicMenu(de ? "DE" : "EN"),
  ]);
  const copy = restaurantContent.copy[locale];
  const products = categories.flatMap((category) =>
    category.products.map((product) => ({ ...product, category: category.name })),
  );
  const featured = products.slice(0, 3);
  const orderingReady = products.length > 0 && (fulfillment.deliveryEnabled || fulfillment.pickupEnabled);
  const heroTitle = (de ? brand.heroTitleDe : brand.heroTitleEn) || copy.heroTitle;
  const heroSubtitle = (de ? brand.heroSubtitleDe : brand.heroSubtitleEn) || copy.heroSubtitle;
  const about = (de ? brand.aboutDe : brand.aboutEn) || copy.about;

  return (
    <div className="overflow-hidden pb-20 sm:pb-28">
      <section className="mx-auto grid min-h-[calc(100dvh-5rem)] max-w-[1440px] items-stretch lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-center px-5 py-16 sm:px-10 lg:px-16 lg:py-24 xl:px-24">
          <div className="inline-flex w-fit items-center gap-2 border-l-4 border-secondary pl-3 text-xs font-bold uppercase tracking-[0.18em] text-muted">
            <MapPin className="h-4 w-4 text-secondary" aria-hidden="true" />
            {copy.eyebrow}
          </div>
          <h1 className="mt-8 max-w-3xl font-display text-[clamp(3.35rem,8vw,7.75rem)] leading-[0.88] tracking-[-0.065em] text-primary">
            {heroTitle}
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-muted sm:text-xl">{heroSubtitle}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            {orderingReady ? (
              <Link href={`/${locale}/menu`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-bold text-primary-foreground transition-colors hover:bg-primary-light">
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                {de ? "Menü ansehen" : "View menu"}
              </Link>
            ) : (
              <a href={`tel:${restaurantContent.phone.replace(/\s/g, "")}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-bold text-primary-foreground transition-colors hover:bg-primary-light">
                <Phone className="h-5 w-5" aria-hidden="true" />
                {de ? "Jetzt anrufen" : "Call us"}
              </a>
            )}
            <a href={restaurantContent.mapUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-primary/25 bg-surface px-6 font-bold text-primary transition-colors hover:border-secondary hover:text-secondary">
              {de ? "Route öffnen" : "Open directions"}
              <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="relative min-h-[58dvh] overflow-hidden bg-primary lg:min-h-full">
          <Image src={brand.heroImageKey} alt={de ? "Editorial gedeckter Restauranttisch" : "Editorial restaurant table setting"} fill priority sizes="(max-width: 1024px) 100vw, 48vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 text-white sm:bottom-10 sm:left-10 sm:right-10">
            <p className="max-w-xs text-sm leading-6 text-white/85">{de ? "Editoriales Stockbild – echte SaltNPepper Fotografie folgt." : "Editorial stock image — real SaltNPepper photography will follow."}</p>
            <span className="font-display text-5xl text-secondary sm:text-7xl">SNP</span>
          </div>
        </div>
      </section>

      <section aria-label={de ? "Kontaktinformationen" : "Contact information"} className="border-y border-border bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl divide-y divide-white/15 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <a href={restaurantContent.mapUrl} target="_blank" rel="noreferrer" className="flex min-h-20 items-center gap-3 px-5 py-4 transition-colors hover:bg-white/5 sm:px-8">
            <MapPin className="h-5 w-5 shrink-0 text-secondary-light" aria-hidden="true" />
            <span className="text-sm font-medium">Allmendstrasse 18, 8154 Oberglatt</span>
          </a>
          <a href={`tel:${restaurantContent.phone.replace(/\s/g, "")}`} className="flex min-h-20 items-center gap-3 px-5 py-4 transition-colors hover:bg-white/5 sm:px-8">
            <Phone className="h-5 w-5 shrink-0 text-secondary-light" aria-hidden="true" />
            <span className="text-sm font-medium">{restaurantContent.phone}</span>
          </a>
          <a href={`mailto:${restaurantContent.email}`} className="flex min-h-20 items-center gap-3 px-5 py-4 transition-colors hover:bg-white/5 sm:px-8">
            <Mail className="h-5 w-5 shrink-0 text-secondary-light" aria-hidden="true" />
            <span className="break-all text-sm font-medium">{restaurantContent.email}</span>
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="flex flex-col justify-between gap-5 border-b border-primary/15 pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{de ? "Von der Küche" : "From the kitchen"}</p>
            <h2 className="mt-3 max-w-3xl font-display text-4xl leading-none tracking-[-0.04em] text-primary sm:text-6xl">
              {featured.length ? (de ? "Aktuell auf der Karte." : "Currently on the menu.") : (de ? "Unser Menü kommt bald." : "Our menu is coming soon.")}
            </h2>
          </div>
          {featured.length > 0 && <Link href={`/${locale}/menu`} className="inline-flex min-h-11 items-center gap-2 font-bold text-primary hover:text-secondary">{de ? "Alles ansehen" : "View everything"}<ArrowUpRight className="h-5 w-5" aria-hidden="true" /></Link>}
        </div>

        {featured.length > 0 ? (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {featured.map((product) => (
              <article key={product.id} className="overflow-hidden rounded-card border border-border bg-surface">
                <div className="relative aspect-[4/3] bg-surface-warm">
                  <Image src={product.imageKey || restaurantContent.heroImage} alt={product.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                </div>
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">{product.category}</p>
                  <h3 className="mt-2 font-display text-2xl tracking-[-0.03em] text-primary">{product.name}</h3>
                  {product.description && <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{product.description}</p>}
                  <p className="mt-5 font-bold tabular-nums text-primary">{formatChf(Math.min(...product.variants.map((variant) => variant.priceRappen)), locale)}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-10 grid overflow-hidden rounded-card border border-border bg-surface lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative min-h-72 lg:min-h-[420px]">
              <Image src="/images/editorial/restaurant-atmosphere.jpg" alt={de ? "Editoriale Restaurantatmosphäre" : "Editorial restaurant atmosphere"} fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
            </div>
            <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
              <UtensilsCrossed className="h-8 w-8 text-secondary" aria-hidden="true" />
              <h3 className="mt-6 font-display text-3xl tracking-[-0.035em] text-primary sm:text-4xl">{de ? "Echte Gerichte statt Platzhalter." : "Real dishes, not placeholders."}</h3>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted">{de ? "Sobald das SaltNPepper Menü bestätigt ist, finden Sie hier Namen, Preise, Varianten und Bestellmöglichkeiten." : "As soon as the SaltNPepper menu is confirmed, you will find real names, prices, options, and ordering here."}</p>
              <Link href={`/${locale}/contact`} className="mt-8 inline-flex min-h-11 w-fit items-center gap-2 font-bold text-primary hover:text-secondary">{de ? "Kontakt aufnehmen" : "Contact us"}<ArrowUpRight className="h-5 w-5" aria-hidden="true" /></Link>
            </div>
          </div>
        )}
      </section>

      <section className="bg-primary py-20 text-primary-foreground sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary-light">SaltNPepper · Oberglatt</p>
            <h2 className="mt-4 max-w-3xl font-display text-4xl leading-[0.95] tracking-[-0.04em] sm:text-6xl">{copy.aboutTitle}</h2>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/70">{about}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={`/${locale}/about`} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-secondary px-6 font-bold text-white hover:bg-secondary-light">{de ? "Über uns" : "About us"}</Link>
              <Link href={`/${locale}/contact`} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 px-6 font-bold text-white hover:bg-white/5">{de ? "Kontakt" : "Contact"}</Link>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-card border border-white/15">
            <Image src="/images/editorial/food-preparation.jpg" alt={de ? "Editorial gedeckter Tisch mit frischen Speisen" : "Editorial table with freshly prepared food"} fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-6 md:grid-cols-3">
          <article className="rounded-card border border-border bg-surface p-7">
            <ShoppingBag className="h-7 w-7 text-secondary" aria-hidden="true" />
            <h2 className="mt-5 font-display text-2xl text-primary">{de ? "Online bestellen" : "Order online"}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{orderingReady ? (de ? "Wählen Sie Ihre Gerichte und die verfügbare Abhol- oder Lieferoption." : "Choose your dishes and an available pickup or delivery option.") : (de ? "Die Online-Bestellung wird freigeschaltet, sobald Menü und Servicezeiten bestätigt sind." : "Online ordering will open once the menu and service hours are confirmed.")}</p>
          </article>
          <article className="rounded-card border border-border bg-surface p-7">
            <Clock3 className="h-7 w-7 text-secondary" aria-hidden="true" />
            <h2 className="mt-5 font-display text-2xl text-primary">{de ? "Öffnungszeiten" : "Opening hours"}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{hours.length > 0 ? (de ? "Die aktuellen Servicezeiten finden Sie auf unserer Kontaktseite." : "Current service hours are available on our contact page.") : (de ? "Bestätigte Öffnungszeiten werden hier veröffentlicht." : "Confirmed opening hours will be published here.")}</p>
          </article>
          <article className="rounded-card border border-border bg-surface p-7">
            <MapPin className="h-7 w-7 text-secondary" aria-hidden="true" />
            <h2 className="mt-5 font-display text-2xl text-primary">{de ? "In Oberglatt" : "In Oberglatt"}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">Allmendstrasse 18<br />8154 Oberglatt</p>
            <a href={restaurantContent.mapUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 font-bold text-primary hover:text-secondary">{de ? "Route öffnen" : "Open directions"}<ArrowUpRight className="h-5 w-5" aria-hidden="true" /></a>
          </article>
        </div>
      </section>
    </div>
  );
}
