import { ArrowUpRight, Clock3, Mail, MapPin, Phone } from "lucide-react";

import { ContactForm } from "@/components/site/contact-form";
import { Card } from "@/components/ui/card";
import { restaurantContent } from "@/content/restaurant";
import { localizedMetadata } from "@/lib/metadata";
import { getPublicConfig } from "@/server/services/catalog";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return localizedMetadata((await params).locale, "/contact", { de: "Kontakt und Anfahrt", en: "Contact and location" }, { de: "Kontaktieren Sie SaltNPepper oder finden Sie uns in Oberglatt.", en: "Contact SaltNPepper or find us in Oberglatt." });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale === "en" ? "en" : "de";
  const de = locale === "de";
  const { hours } = await getPublicConfig();

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

      <section className="mx-auto grid max-w-7xl gap-8 px-5 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[0.7fr_1.3fr]">
        <Card className="h-fit p-7 sm:p-8">
          <Clock3 className="h-7 w-7 text-secondary" aria-hidden="true" />
          <h2 className="mt-5 font-display text-2xl text-primary">{de ? "Öffnungszeiten" : "Opening hours"}</h2>
          <p className="mt-4 text-sm leading-6 text-muted">{hours.length > 0 ? (de ? "Die bestätigten Servicezeiten werden vom Restaurant verwaltet und beim Bestellen angezeigt." : "Confirmed service hours are managed by the restaurant and shown during ordering.") : (de ? "Die bestätigten Öffnungszeiten werden hier veröffentlicht, sobald sie vorliegen." : "Confirmed opening hours will be published here as soon as they are available.")}</p>
        </Card>
        <Card className="p-7 sm:p-10" aria-labelledby="contact-form-heading">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{de ? "Nachricht senden" : "Send a message"}</p>
          <h2 id="contact-form-heading" className="mt-3 font-display text-3xl tracking-[-0.03em] text-primary">{de ? "Wie können wir helfen?" : "How can we help?"}</h2>
          <p className="mb-7 mt-3 text-sm leading-6 text-muted">{de ? "Wir antworten so bald wie möglich per E-Mail." : "We will reply by email as soon as possible."}</p>
          <ContactForm locale={locale} />
        </Card>
      </section>
    </div>
  );
}
