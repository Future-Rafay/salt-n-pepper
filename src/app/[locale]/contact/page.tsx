import { ArrowUpRight, Clock3, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { ContactForm } from "@/components/site/contact-form";
import { SocialLinks } from "@/components/site/social-links";
import { Card } from "@/components/ui/card";
import { restaurantContent } from "@/content/restaurant";
import { localizedMetadata } from "@/lib/metadata";
import { groupOpeningHours } from "@/lib/opening-hours";
import { getPublicConfig } from "@/server/services/catalog";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return localizedMetadata((await params).locale, "/contact", { de: "Kontakt und Anfahrt", en: "Contact and location" }, { de: "Kontaktieren Sie SaltNPepper oder finden Sie uns in Oberglatt.", en: "Contact SaltNPepper or find us in Oberglatt." });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale === "en" ? "en" : "de";
  const de = locale === "de";
  const { brand, hours } = await getPublicConfig();
  const groupedHours = groupOpeningHours(hours, locale);
  const whatsappUrl = `https://wa.me/${restaurantContent.phone.replace(/\D/g, "")}`;
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(`${restaurantContent.address.street}, ${restaurantContent.address.postalCode} ${restaurantContent.address.city}`)}&output=embed`;

  return (
    <div className="pb-20 sm:pb-28">
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">SaltNPepper · Oberglatt</p>
        <h1 className="mt-5 max-w-4xl font-display text-5xl leading-[0.9] tracking-[-0.055em] text-primary sm:text-7xl">{de ? "Sprechen wir über gutes Essen." : "Let’s talk about good food."}</h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">{de ? "Rufen Sie uns an, schreiben Sie uns oder besuchen Sie uns an der Allmendstrasse 18." : "Call, email, or visit us at Allmendstrasse 18."}</p>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 sm:px-8 md:grid-cols-3">
        <a href={restaurantContent.mapUrl} target="_blank" rel="noreferrer" className="rounded-card border border-border bg-surface p-7 transition-colors hover:border-secondary">
          <MapPin className="h-7 w-7 text-secondary" aria-hidden="true" />
          <h2 className="mt-5 font-display text-2xl text-primary">{de ? "Besuchen" : "Visit"}</h2>
          <p className="mt-3 text-sm leading-6 text-muted">Allmendstrasse 18<br />8154 Oberglatt</p>
          <span className="mt-6 inline-flex min-h-11 items-center gap-2 font-bold text-primary">{de ? "Route öffnen" : "Open directions"}<ArrowUpRight className="h-5 w-5" aria-hidden="true" /></span>
        </a>
        <a href={`tel:${restaurantContent.phone.replace(/\s/g, "")}`} className="rounded-card border border-border bg-surface p-7 transition-colors hover:border-secondary">
          <Phone className="h-7 w-7 text-secondary" aria-hidden="true" />
          <h2 className="mt-5 font-display text-2xl text-primary">{de ? "Anrufen" : "Call"}</h2>
          <p className="mt-3 text-sm leading-6 text-muted">{restaurantContent.phone}</p>
        </a>
        <a href={`mailto:${restaurantContent.email}`} className="rounded-card border border-border bg-surface p-7 transition-colors hover:border-secondary">
          <Mail className="h-7 w-7 text-secondary" aria-hidden="true" />
          <h2 className="mt-5 font-display text-2xl text-primary">E-Mail</h2>
          <p className="mt-3 break-all text-sm leading-6 text-muted">{restaurantContent.email}</p>
        </a>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-8 sm:px-8">
        <Card className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <div className="flex items-center gap-2 text-secondary">
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              <h2 className="font-display text-2xl text-primary">{de ? "Direkt verbunden" : "Stay connected"}</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">{de ? "Schreiben Sie uns auf WhatsApp oder besuchen Sie unsere Social-Media-Kanäle." : "Message us on WhatsApp or visit our social channels."}</p>
          </div>
          <SocialLinks facebookUrl={brand.facebookUrl} instagramUrl={brand.instagramUrl} whatsappUrl={whatsappUrl} locale={locale} />
        </Card>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[0.7fr_1.3fr]">
        <Card className="h-fit p-7 sm:p-8">
          <Clock3 className="h-7 w-7 text-secondary" aria-hidden="true" />
          <h2 className="mt-5 font-display text-2xl text-primary">{de ? "Öffnungszeiten" : "Opening hours"}</h2>
          <div className="mt-6 space-y-7">
            {groupedHours.map((group) => (
              <section key={group.fulfillmentType} aria-labelledby={`hours-${group.fulfillmentType.toLowerCase()}`}>
                <h3 id={`hours-${group.fulfillmentType.toLowerCase()}`} className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">{group.label}</h3>
                <dl className="mt-3 space-y-2 text-sm">
                  {group.days.map((day) => (
                    <div key={day.weekday} className="flex items-center justify-between gap-4 border-b border-border/70 pb-2 last:border-0">
                      <dt className="text-muted">{day.label}</dt>
                      <dd className="font-bold tabular-nums text-primary">{day.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        </Card>
        <Card className="p-7 sm:p-10" aria-labelledby="contact-form-heading">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{de ? "Nachricht senden" : "Send a message"}</p>
          <h2 id="contact-form-heading" className="mt-3 font-display text-3xl tracking-[-0.03em] text-primary">{de ? "Wie können wir helfen?" : "How can we help?"}</h2>
          <p className="mb-7 mt-3 text-sm leading-6 text-muted">{de ? "Wir antworten so bald wie möglich per E-Mail." : "We will reply by email as soon as possible."}</p>
          <ContactForm locale={locale} />
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 sm:pt-24" aria-labelledby="map-heading">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{de ? "Anfahrt" : "Directions"}</p>
            <h2 id="map-heading" className="mt-3 font-display text-4xl tracking-[-0.04em] text-primary">{de ? "Finden Sie uns in Oberglatt." : "Find us in Oberglatt."}</h2>
          </div>
          <a href={restaurantContent.mapUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 font-bold text-primary hover:text-secondary">{de ? "In Google Maps öffnen" : "Open in Google Maps"}<ArrowUpRight className="h-5 w-5" aria-hidden="true" /></a>
        </div>
        <div className="overflow-hidden rounded-card border border-border bg-surface shadow-sm">
          <iframe
            title={de ? "Google-Karte mit dem Standort von SaltNPepper" : "Google map showing the SaltNPepper location"}
            src={mapEmbedUrl}
            className="h-[420px] w-full border-0 sm:h-[520px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </section>
    </div>
  );
}
