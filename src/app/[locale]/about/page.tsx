import { ArrowUpRight, HeartHandshake, MapPin, Sparkles, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { restaurantContent } from "@/content/restaurant";
import { localizedMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return localizedMetadata((await params).locale, "/about", { de: "Über SaltNPepper", en: "About SaltNPepper" }, { de: "Lernen Sie SaltNPepper in Oberglatt kennen.", en: "Get to know SaltNPepper in Oberglatt." });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale === "en" ? "en" : "de";
  const de = locale === "de";
  const copy = restaurantContent.copy[locale];
  const values = [
    { icon: Sparkles, title: de ? "Frisch gedacht" : "Fresh by design", text: de ? "Unser echtes Angebot wird klar, ehrlich und ohne erfundene Platzhalter veröffentlicht." : "Our real offering will be published clearly and honestly, without invented placeholders." },
    { icon: HeartHandshake, title: de ? "Lokal verbunden" : "Locally connected", text: de ? "SaltNPepper entsteht als unkomplizierter Treffpunkt für Oberglatt und die Umgebung." : "SaltNPepper is being created as an uncomplicated meeting place for Oberglatt and its surroundings." },
    { icon: UtensilsCrossed, title: de ? "Einfach bestellen" : "Simple ordering", text: de ? "Menü, Varianten, Abholung und Lieferung bleiben verständlich und direkt." : "Menu choices, options, pickup, and delivery stay clear and direct." },
  ];

  return (
    <div className="pb-20 sm:pb-28">
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">SaltNPepper · Oberglatt</p>
          <h1 className="mt-5 font-display text-5xl leading-[0.9] tracking-[-0.055em] text-primary sm:text-7xl">{de ? "Ein lokaler Ort für gutes Essen." : "A local place for good food."}</h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-muted">{copy.about}</p>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-card border border-border">
          <Image src="/images/editorial/restaurant-table.jpg" alt={de ? "Editorial gedeckter Restauranttisch" : "Editorial restaurant table setting"} fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
        </div>
      </section>

      <section className="border-y border-border bg-primary py-20 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary-contrast">{de ? "Unsere Richtung" : "Our direction"}</p>
            <h2 className="mt-4 font-display text-4xl leading-none tracking-[-0.04em] sm:text-6xl">{copy.aboutTitle}</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {values.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-card border border-white/15 bg-white/[0.04] p-7">
                <Icon className="h-7 w-7 text-secondary-light" aria-hidden="true" />
                <h3 className="mt-6 font-display text-2xl">{title}</h3>
                <p className="mt-4 text-sm leading-6 text-white/65">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:items-center">
        <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-border">
          <Image src="/images/editorial/restaurant-atmosphere.jpg" alt={de ? "Editoriale Restaurantatmosphäre" : "Editorial restaurant atmosphere"} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
        </div>
        <div className="lg:pl-10">
          <MapPin className="h-8 w-8 text-secondary" aria-hidden="true" />
          <h2 className="mt-6 font-display text-4xl leading-none tracking-[-0.04em] text-primary sm:text-5xl">{de ? "Zu Hause in Oberglatt." : "At home in Oberglatt."}</h2>
          <p className="mt-6 text-lg leading-8 text-muted">Allmendstrasse 18<br />8154 Oberglatt</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={restaurantContent.mapUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-6 font-bold text-white">{de ? "Route öffnen" : "Open directions"}<ArrowUpRight className="h-5 w-5" aria-hidden="true" /></a>
            <Link href={`/${locale}/contact`} className="inline-flex min-h-12 items-center rounded-xl border border-primary/25 px-6 font-bold text-primary">{de ? "Kontakt" : "Contact"}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
