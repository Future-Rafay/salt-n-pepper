import { ArrowUpRight, Clock3, Mail, MapPin, Phone, ShoppingBag } from "lucide-react";
import Link from "next/link";

import { BlogCard } from "@/components/site/blog-card";
import {
  CategoryMenuIndex,
  CategoryShowcase,
  FeaturedProducts,
  ImageTextStory,
  InstagramGallery,
  ProductMosaic,
  PromotionalBanner,
  SplitHero,
  type GalleryItem,
} from "@/components/site/landing-sections";
import { editorialPhotography, restaurantContent } from "@/content/restaurant";
import { localizedMetadata } from "@/lib/metadata";
import { listLatestBlogPosts } from "@/lib/wordpress";
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
  const [{ brand, fulfillment, hours, announcement }, categories, latestPosts] = await Promise.all([
    getPublicConfig(),
    getPublicMenu(de ? "DE" : "EN"),
    listLatestBlogPosts(4),
  ]);
  const copy = restaurantContent.copy[locale];
  const products = categories.flatMap((category) =>
    category.products.map((product) => ({ ...product, category: category.name })),
  );
  const orderingReady = products.length > 0 && (fulfillment.deliveryEnabled || fulfillment.pickupEnabled);
  const galleryItems: GalleryItem[] = editorialPhotography.map((image) => ({
    id: image.file,
    image: image.file,
    alt: {
      de: `Temporäres Editorialbild: ${image.use}`,
      en: `Temporary editorial image: ${image.use}`,
    },
    credit: image.credit,
    source: image.source,
  }));

  return (
    <div className="overflow-hidden pb-20 sm:pb-28">
      <SplitHero
        locale={locale}
        brand={brand}
        title={(de ? brand.heroTitleDe : brand.heroTitleEn) || copy.heroTitle}
        subtitle={(de ? brand.heroSubtitleDe : brand.heroSubtitleEn) || copy.heroSubtitle}
        eyebrow={copy.eyebrow}
        orderingReady={orderingReady}
      />

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

      <CategoryShowcase locale={locale} categories={categories} />
      <CategoryMenuIndex locale={locale} categories={categories} />
      <PromotionalBanner locale={locale} announcement={announcement?.[locale] ?? null} />
      <FeaturedProducts locale={locale} products={products.slice(0, 3)} />
      <ProductMosaic locale={locale} products={products.slice(0, 4)} />
      <ImageTextStory locale={locale} title={copy.aboutTitle} body={(de ? brand.aboutDe : brand.aboutEn) || copy.about} />
      <InstagramGallery
        locale={locale}
        items={galleryItems}
        profileUrl="https://www.instagram.com/foodeez.ch"
        profileHandle="@foodeez.ch"
      />

      {latestPosts.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28" aria-labelledby="latest-blog-heading">
          <div className="flex flex-col justify-between gap-5 border-b border-primary/15 pb-8 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">SweetNSavour · SaltNPepper</p>
              <h2 id="latest-blog-heading" className="mt-3 max-w-3xl font-display text-4xl leading-none tracking-[-0.04em] text-primary sm:text-6xl">
                {de ? "Frische Ideen aus dem Blog." : "Fresh ideas from the blog."}
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-muted">
                {de ? "Food-Guides, Ernährungstipps und Inspiration für Ihren Alltag." : "Food guides, nutrition tips, and practical inspiration for everyday life."}
              </p>
            </div>
            <Link href={`/${locale}/blog`} className="inline-flex min-h-11 items-center gap-2 font-bold text-primary hover:text-secondary">
              {de ? "Alle Artikel" : "All articles"}
              <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {latestPosts.map((post) => <BlogCard key={post.id} post={post} locale={locale} />)}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-6 md:grid-cols-3">
          <article className="rounded-card border border-border bg-surface p-7">
            <ShoppingBag className="h-7 w-7 text-secondary" aria-hidden="true" />
            <h2 className="mt-5 font-display text-2xl text-primary">{de ? "Online bestellen" : "Order online"}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              {orderingReady
                ? de ? "Wählen Sie Ihre Gerichte und die verfügbare Abhol- oder Lieferoption." : "Choose your dishes and an available pickup or delivery option."
                : de ? "Die Online-Bestellung wird freigeschaltet, sobald Menü und Servicezeiten bestätigt sind." : "Online ordering will open once the menu and service hours are confirmed."}
            </p>
          </article>
          <article className="rounded-card border border-border bg-surface p-7">
            <Clock3 className="h-7 w-7 text-secondary" aria-hidden="true" />
            <h2 className="mt-5 font-display text-2xl text-primary">{de ? "Öffnungszeiten" : "Opening hours"}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              {hours.length > 0
                ? de ? "Die aktuellen Servicezeiten finden Sie auf unserer Kontaktseite." : "Current service hours are available on our contact page."
                : de ? "Bestätigte Öffnungszeiten werden hier veröffentlicht." : "Confirmed opening hours will be published here."}
            </p>
          </article>
          <article className="rounded-card border border-border bg-surface p-7">
            <MapPin className="h-7 w-7 text-secondary" aria-hidden="true" />
            <h2 className="mt-5 font-display text-2xl text-primary">{de ? "In Oberglatt" : "In Oberglatt"}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">Allmendstrasse 18<br />8154 Oberglatt</p>
            <a href={restaurantContent.mapUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 font-bold text-primary hover:text-secondary">
              {de ? "Route öffnen" : "Open directions"}
              <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
            </a>
          </article>
        </div>
      </section>
    </div>
  );
}
