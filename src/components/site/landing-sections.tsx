import {
  ArrowUpRight,
  MapPin,
  Phone,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { restaurantContent } from "@/content/restaurant";
import { formatMoney } from "@/lib/orders";
import type { getPublicConfig, getPublicMenu } from "@/server/services/catalog";

type Locale = "de" | "en";
type PublicBrand = Awaited<ReturnType<typeof getPublicConfig>>["brand"];
type MenuCategories = Awaited<ReturnType<typeof getPublicMenu>>;
type FeaturedProduct = MenuCategories[number]["products"][number] & {
  category: string;
};

export type GalleryItem = {
  id: string;
  image: string;
  alt: Record<Locale, string>;
  credit: string;
  source: string;
};

export function SplitHero({
  locale,
  brand,
  title,
  subtitle,
  eyebrow,
  orderingReady,
}: {
  locale: Locale;
  brand: PublicBrand;
  title: string;
  subtitle: string;
  eyebrow: string;
  orderingReady: boolean;
}) {
  const de = locale === "de";

  return (
    <section className="mx-auto grid min-h-[calc(100dvh-5rem)] max-w-[1440px] items-stretch lg:grid-cols-[1.05fr_0.95fr]">
      <div className="flex flex-col justify-center px-5 py-16 sm:px-10 lg:px-16 lg:py-24 xl:px-24">
        <div className="inline-flex w-fit items-center gap-2 border-l-4 border-secondary pl-3 text-xs font-bold uppercase tracking-[0.18em] text-muted">
          <MapPin className="h-4 w-4 text-secondary" aria-hidden="true" />
          {eyebrow}
        </div>
        <h1 className="mt-8 max-w-3xl font-display text-[clamp(3.35rem,8vw,7.75rem)] leading-[0.88] tracking-[-0.065em] text-primary">
          {title}
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-8 text-muted sm:text-xl">
          {subtitle}
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          {orderingReady ? (
            <Link
              href={`/${locale}/menu`}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-bold text-primary-foreground transition-colors hover:bg-primary-light"
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              {de ? "Menü ansehen" : "View menu"}
            </Link>
          ) : (
            <a
              href={`tel:${restaurantContent.phone.replace(/\s/g, "")}`}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-bold text-primary-foreground transition-colors hover:bg-primary-light"
            >
              <Phone className="h-5 w-5" aria-hidden="true" />
              {de ? "Jetzt anrufen" : "Call us"}
            </a>
          )}
          <a
            href={restaurantContent.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-primary/25 bg-surface px-6 font-bold text-primary transition-colors hover:border-secondary hover:text-secondary"
          >
            {de ? "Route öffnen" : "Open directions"}
            <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="relative min-h-[58dvh] overflow-hidden bg-primary lg:min-h-full">
        <Image
          src={brand.heroImageKey}
          alt={de ? "Editorial gedeckter Restauranttisch" : "Editorial restaurant table setting"}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 48vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 text-white sm:bottom-10 sm:left-10 sm:right-10">
          <p className="max-w-xs text-sm leading-6 text-white/85">
            {de
              ? "Editoriales Stockbild – echte SaltNPepper Fotografie folgt."
              : "Editorial stock image — real SaltNPepper photography will follow."}
          </p>
          <span className="font-display text-5xl text-secondary sm:text-7xl" aria-hidden="true">
            SNP
          </span>
        </div>
      </div>
    </section>
  );
}

export function CategoryShowcase({
  locale,
  categories,
}: {
  locale: Locale;
  categories: MenuCategories;
}) {
  const de = locale === "de";
  const visibleCategories = categories.filter((category) => category.products.length > 0).slice(0, 6);
  if (!visibleCategories.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28" aria-labelledby="category-showcase-heading">
      <div className="border-b border-primary/15 pb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
          {de ? "Menü entdecken" : "Explore the menu"}
        </p>
        <h2 id="category-showcase-heading" className="mt-3 max-w-3xl font-display text-4xl leading-none tracking-[-0.04em] text-primary sm:text-6xl">
          {de ? "Für jeden Appetit." : "Something for every appetite."}
        </h2>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visibleCategories.map((category) => {
          const image = category.products.find((product) => product.imageKey)?.imageKey || restaurantContent.heroImage;
          return (
            <Link
              key={category.id}
              href={`/${locale}/menu#${category.slug}`}
              className="group relative min-h-72 overflow-hidden rounded-card bg-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
            >
              <Image src={image} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary-light">
                  {category.products.length} {de ? "Gerichte" : "items"}
                </p>
                <h3 className="mt-2 flex items-end justify-between gap-3 font-display text-3xl tracking-[-0.03em]">
                  {category.name}
                  <ArrowUpRight className="h-6 w-6 shrink-0" aria-hidden="true" />
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-muted">
        {de ? "Repräsentative Produktbilder." : "Representative product images."}
      </p>
    </section>
  );
}

export function CategoryMenuIndex({
  locale,
  categories,
}: {
  locale: Locale;
  categories: MenuCategories;
}) {
  const de = locale === "de";
  const visibleCategories = categories.filter((category) => category.products.length > 0).slice(0, 6);
  if (!visibleCategories.length) return null;

  return (
    <section className="bg-surface-warm py-20 sm:py-28" aria-labelledby="category-index-heading">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
              {de ? "Kategorien im Überblick" : "Menu index"}
            </p>
            <h2 id="category-index-heading" className="mt-3 font-display text-4xl leading-none tracking-[-0.04em] text-primary sm:text-6xl">
              {de ? "Direkt zum Lieblingsgericht." : "Go straight to what you like."}
            </h2>
            <p className="mt-5 max-w-md leading-7 text-muted">
              {de ? "Wählen Sie eine Kategorie und springen Sie direkt zum passenden Bereich der Speisekarte." : "Choose a category and jump directly to that part of the menu."}
            </p>
          </div>

          <nav aria-label={de ? "Menükategorien" : "Menu categories"}>
            <ul className="divide-y divide-primary/15 border-y border-primary/15">
              {visibleCategories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/${locale}/menu#${category.slug}`}
                    className="group grid min-h-24 grid-cols-[1fr_auto] items-center gap-4 py-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
                  >
                    <span>
                      <span className="block font-display text-2xl tracking-[-0.03em] text-primary sm:text-3xl">{category.name}</span>
                      <span className="mt-1 block text-sm text-muted">
                        {category.products.slice(0, 2).map((product) => product.name).join(" · ")}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 text-sm font-bold text-primary group-hover:text-secondary">
                      <span className="hidden sm:inline">{category.products.length} {de ? "Gerichte" : "items"}</span>
                      <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}

export function PromotionalBanner({ announcement, locale }: { announcement: string | null; locale: Locale }) {
  if (!announcement) return null;
  const de = locale === "de";

  return (
    <section className="bg-secondary py-14 text-white sm:py-16" aria-labelledby="promotion-heading">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/75">
            {de ? "Lieferangebot" : "Delivery offer"}
          </p>
          <h2 id="promotion-heading" className="mt-3 max-w-4xl font-display text-3xl leading-tight tracking-[-0.035em] sm:text-5xl">
            {announcement}
          </h2>
        </div>
        <Link href={`/${locale}/menu`} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-bold text-white hover:bg-primary-light">
          {de ? "Menü ansehen" : "View menu"}
          <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

export function FeaturedProducts({ locale, products }: { locale: Locale; products: FeaturedProduct[] }) {
  const de = locale === "de";

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28" aria-labelledby="featured-products-heading">
      <div className="flex flex-col justify-between gap-5 border-b border-primary/15 pb-8 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{de ? "Von der Küche" : "From the kitchen"}</p>
          <h2 id="featured-products-heading" className="mt-3 max-w-3xl font-display text-4xl leading-none tracking-[-0.04em] text-primary sm:text-6xl">
            {products.length ? (de ? "Aktuell auf der Karte." : "Currently on the menu.") : (de ? "Unser Menü kommt bald." : "Our menu is coming soon.")}
          </h2>
        </div>
        {products.length > 0 && (
          <Link href={`/${locale}/menu`} className="inline-flex min-h-11 items-center gap-2 font-bold text-primary hover:text-secondary">
            {de ? "Alles ansehen" : "View everything"}
            <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        )}
      </div>

      {products.length > 0 ? (
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="overflow-hidden rounded-card border border-border bg-surface">
              <div className="relative aspect-[4/3] bg-surface-warm">
                <Image src={product.imageKey || restaurantContent.heroImage} alt={product.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                <span className="absolute bottom-3 left-3 rounded-full bg-primary/85 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
                  {de ? "Beispielfoto" : "Representative image"}
                </span>
              </div>
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">{product.category}</p>
                <h3 className="mt-2 font-display text-2xl tracking-[-0.03em] text-primary">{product.name}</h3>
                {product.description && <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{product.description}</p>}
                <p className="mt-5 font-bold tabular-nums text-primary">
                  {formatMoney(Math.min(...product.variants.map((variant) => variant.priceRappen)), locale)}
                </p>
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
            <Link href={`/${locale}/contact`} className="mt-8 inline-flex min-h-11 w-fit items-center gap-2 font-bold text-primary hover:text-secondary">
              {de ? "Kontakt aufnehmen" : "Contact us"}
              <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

export function ProductMosaic({ locale, products }: { locale: Locale; products: FeaturedProduct[] }) {
  if (!products.length) return null;
  const de = locale === "de";
  const [leadProduct, ...otherProducts] = products.slice(0, 4);

  return (
    <section className="bg-primary py-20 text-primary-foreground sm:py-28" aria-labelledby="product-mosaic-heading">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-5 border-b border-white/15 pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary-contrast">
              {de ? "Aus der Küche" : "Kitchen selection"}
            </p>
            <h2 id="product-mosaic-heading" className="mt-3 max-w-3xl font-display text-4xl leading-none tracking-[-0.04em] sm:text-6xl">
              {de ? "Gerichte im Fokus." : "Dishes in focus."}
            </h2>
          </div>
          <Link href={`/${locale}/menu`} className="inline-flex min-h-11 items-center gap-2 font-bold text-white hover:text-secondary-contrast">
            {de ? "Vollständiges Menü" : "Full menu"}
            <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="group relative min-h-[30rem] overflow-hidden rounded-card bg-surface-warm sm:min-h-[38rem]">
            <Image
              src={leadProduct.imageKey || restaurantContent.heroImage}
              alt={leadProduct.name}
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary-contrast">{leadProduct.category}</p>
              <div className="mt-2 flex items-end justify-between gap-5">
                <h3 className="font-display text-3xl tracking-[-0.035em] text-white sm:text-5xl">{leadProduct.name}</h3>
                <p className="shrink-0 text-lg font-bold tabular-nums text-white">
                  {formatMoney(Math.min(...leadProduct.variants.map((variant) => variant.priceRappen)), locale)}
                </p>
              </div>
            </div>
          </article>

          <div className="grid gap-5">
            {otherProducts.map((product) => (
              <article key={product.id} className="grid min-h-40 grid-cols-[8rem_1fr] overflow-hidden rounded-card border border-white/15 bg-white/5 sm:grid-cols-[11rem_1fr]">
                <div className="relative bg-surface-warm">
                  <Image src={product.imageKey || restaurantContent.heroImage} alt={product.name} fill sizes="(max-width: 640px) 8rem, 11rem" className="object-cover" />
                </div>
                <div className="flex min-w-0 flex-col justify-center p-5 sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary-contrast">{product.category}</p>
                  <h3 className="mt-2 font-display text-2xl tracking-[-0.03em] text-white">{product.name}</h3>
                  <p className="mt-3 font-bold tabular-nums text-white/80">
                    {formatMoney(Math.min(...product.variants.map((variant) => variant.priceRappen)), locale)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <p className="mt-4 text-xs text-white/60">
          {de ? "Produktbilder sind repräsentativ." : "Product images are representative."}
        </p>
      </div>
    </section>
  );
}

export function ImageTextStory({ locale, title, body, imagePosition = "right" }: { locale: Locale; title: string; body: string; imagePosition?: "left" | "right" }) {
  const de = locale === "de";
  const image = (
    <div className="relative aspect-[4/5] overflow-hidden rounded-card border border-white/15">
      <Image src="/images/editorial/food-preparation.jpg" alt={de ? "Editorial gedeckter Tisch mit frischen Speisen" : "Editorial table with freshly prepared food"} fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
    </div>
  );

  return (
    <section className="bg-primary py-20 text-primary-foreground sm:py-28" aria-labelledby="restaurant-story-heading">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        {imagePosition === "left" && image}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary-contrast">SaltNPepper · Oberglatt</p>
          <h2 id="restaurant-story-heading" className="mt-4 max-w-3xl font-display text-4xl leading-[0.95] tracking-[-0.04em] sm:text-6xl">{title}</h2>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/70">{body}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href={`/${locale}/about`} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-secondary px-6 font-bold text-white hover:bg-secondary-light">{de ? "Über uns" : "About us"}</Link>
            <Link href={`/${locale}/contact`} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 px-6 font-bold text-white hover:bg-white/5">{de ? "Kontakt" : "Contact"}</Link>
          </div>
        </div>
        {imagePosition === "right" && image}
      </div>
    </section>
  );
}

export function InstagramGallery({
  locale,
  items,
  profileUrl,
  profileHandle,
}: {
  locale: Locale;
  items: GalleryItem[];
  profileUrl: string;
  profileHandle: string;
}) {
  if (!items.length) return null;
  const de = locale === "de";

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28" aria-labelledby="instagram-gallery-heading">
      <div className="flex flex-col justify-between gap-5 border-b border-primary/15 pb-8 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Instagram · {de ? "Präsentationsvorschau" : "Presentation preview"}</p>
          <h2 id="instagram-gallery-heading" className="mt-3 max-w-3xl font-display text-4xl leading-none tracking-[-0.04em] text-primary sm:text-6xl">{de ? `${profileHandle} auf Instagram folgen.` : `Follow ${profileHandle} on Instagram.`}</h2>
        </div>
        <div className="max-w-md">
          <p className="text-sm leading-6 text-muted">{de ? "Diese Vorschau zeigt temporäre Editorialbilder, keine Beiträge aus dem Instagram-Feed." : "This preview uses temporary editorial images, not posts fetched from the Instagram feed."}</p>
          <a href={profileUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 font-bold text-primary hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary">
            {de ? `${profileHandle} auf Instagram öffnen` : `Open ${profileHandle} on Instagram`}
            <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
        {items.map((item, index) => (
          <figure key={item.id} className={index === 0 ? "col-span-2 row-span-2" : ""}>
            <div className={`relative overflow-hidden rounded-card bg-surface-warm ${index === 0 ? "aspect-square sm:aspect-[2/1] lg:aspect-square" : "aspect-square"}`}>
              <Image src={item.image} alt={item.alt[locale]} fill sizes={index === 0 ? "(max-width: 1024px) 100vw, 66vw" : "(max-width: 640px) 50vw, 33vw"} className="object-cover" />
              <span className="absolute left-3 top-3 rounded-full bg-primary/85 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur">Mock</span>
            </div>
            <figcaption className="mt-2 text-xs text-muted">
              <a href={item.source} target="_blank" rel="noreferrer" className="underline decoration-border underline-offset-4 hover:text-primary">{item.credit}</a>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
