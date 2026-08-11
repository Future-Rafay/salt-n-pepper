"use client";

import { ChevronRight, Globe2, LogOut, Mail, MapPin, Menu, Phone, Settings, ShoppingBag, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { CustomerNotifications } from "@/components/site/customer-notifications";
import { useCart } from "@/components/site/cart-context";
import { restaurantContent } from "@/content/restaurant";
import { formatChf } from "@/lib/orders";

type SiteUser = { name?: string | null; email?: string | null; image?: string | null; role?: string } | null;

export function SiteShell({ locale, user, children }: { locale: "de" | "en"; user?: SiteUser; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { count, items } = useCart();
  const other = locale === "de" ? "en" : "de";
  const cartTotalRappen = items.reduce((sum, item) => sum + item.unitPriceRappen * item.quantity, 0);
  const de = locale === "de";
  const labels = de
    ? { home: "Start", menu: "Menü", about: "Über uns", contact: "Kontakt", account: "Meine Bestellungen", logout: "Abmelden", login: "Anmelden", register: "Registrieren", cart: "Warenkorb", rights: "Alle Rechte vorbehalten.", privacy: "Datenschutz", terms: "AGB", welcome: "Willkommen bei SaltNPepper" }
    : { home: "Home", menu: "Menu", about: "About", contact: "Contact", account: "My orders", logout: "Sign out", login: "Sign in", register: "Create account", cart: "Cart", rights: "All rights reserved.", privacy: "Privacy", terms: "Terms", welcome: "Welcome to SaltNPepper" };
  const navLinks = [
    { href: `/${locale}`, label: labels.home },
    { href: `/${locale}/menu`, label: labels.menu },
    { href: `/${locale}/about`, label: labels.about },
    { href: `/${locale}/contact`, label: labels.contact },
  ];

  useEffect(() => {
    function closeDropdown(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setUserDropdownOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setUserDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", closeDropdown);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeDropdown);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  function isActive(href: string) {
    return href === `/${locale}` ? pathname === href || pathname === `${href}/` : pathname?.startsWith(href);
  }

  const switchLangPath = pathname ? pathname.replace(`/${locale}`, `/${other}`) : `/${other}`;
  const initial = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="flex min-h-dvh flex-col" lang={locale}>
      <a href="#main-content" className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:block focus:rounded-xl focus:bg-primary focus:px-5 focus:py-3 focus:font-bold focus:text-white">
        {de ? "Zum Inhalt springen" : "Skip to content"}
      </a>

      <div className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
        <header className="mx-auto max-w-7xl rounded-2xl border border-border/80 bg-surface/95 shadow-[0_10px_35px_rgba(28,25,23,0.12)] backdrop-blur-xl">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-5">
            <Link href={`/${locale}`} className="flex min-h-11 items-center" aria-label={de ? "SaltNPepper Startseite" : "SaltNPepper home"}>
              <BrandLogo priority className="h-8 w-auto object-contain sm:h-9" />
            </Link>

            <nav aria-label={de ? "Hauptnavigation" : "Main navigation"} className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} aria-current={isActive(link.href) ? "page" : undefined} className={`inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-bold transition-colors ${isActive(link.href) ? "bg-primary text-white" : "text-foreground hover:bg-surface-warm"}`}>
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {user?.role === "CUSTOMER" && <CustomerNotifications locale={locale} />}
              <Link href={switchLangPath} hrefLang={other} className="hidden min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-foreground hover:bg-surface-warm sm:flex" aria-label={de ? "Switch to English" : "Zu Deutsch wechseln"}>
                <Globe2 className="h-4 w-4 text-secondary" aria-hidden="true" />
                {other.toUpperCase()}
              </Link>
              <Link href={`/${locale}/cart`} className="relative inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-3.5 text-sm font-bold text-white transition-colors hover:bg-primary-light" aria-label={`${labels.cart}: ${count}`}>
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                <span className="hidden lg:inline">{labels.cart}</span>
                {count > 0 && <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-[11px] text-white">{count}</span>}
              </Link>

              <div className="relative" ref={dropdownRef}>
                <button type="button" onClick={() => setUserDropdownOpen((open) => !open)} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border bg-surface text-primary hover:border-secondary" aria-expanded={userDropdownOpen} aria-haspopup="menu" aria-label={de ? "Benutzermenü" : "User menu"}>
                  {user?.image ? <Image src={user.image} alt="" width={30} height={30} className="rounded-lg object-cover" /> : user ? <span className="font-bold">{initial}</span> : <User className="h-5 w-5" aria-hidden="true" />}
                </button>
                {userDropdownOpen && (
                  <div role="menu" className="absolute right-0 top-[3.25rem] z-50 w-72 rounded-2xl border border-border bg-surface p-2 shadow-2xl">
                    {user ? (
                      <>
                        <div className="rounded-xl bg-surface-warm p-3">
                          <p className="truncate font-bold text-primary">{user.name || initial}</p>
                          <p className="mt-1 truncate text-xs text-muted">{user.email}</p>
                        </div>
                        <div className="mt-2 space-y-1">
                          <Link role="menuitem" href={`/${locale}/account/orders`} onClick={() => setUserDropdownOpen(false)} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold hover:bg-surface-warm"><ShoppingBag className="h-4 w-4 text-secondary" aria-hidden="true" />{labels.account}</Link>
                          {user.role && user.role !== "CUSTOMER" && <Link role="menuitem" href="/admin" onClick={() => setUserDropdownOpen(false)} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold hover:bg-surface-warm"><Settings className="h-4 w-4 text-secondary" aria-hidden="true" />Admin</Link>}
                        </div>
                        <div className="my-2 border-t border-border" />
                        <button role="menuitem" type="button" onClick={() => signOut({ callbackUrl: `/${locale}` })} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-bold text-destructive hover:bg-destructive/10"><LogOut className="h-4 w-4" aria-hidden="true" />{labels.logout}</button>
                      </>
                    ) : (
                      <div className="p-2">
                        <p className="font-bold text-primary">{labels.welcome}</p>
                        <p className="mt-1 text-xs leading-5 text-muted">{de ? "Melden Sie sich an, um Bestellungen zu verfolgen." : "Sign in to track your orders."}</p>
                        <div className="mt-4 grid gap-2">
                          <Link role="menuitem" href={`/${locale}/login`} onClick={() => setUserDropdownOpen(false)} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary font-bold text-white">{labels.login}</Link>
                          <Link role="menuitem" href={`/${locale}/register`} onClick={() => setUserDropdownOpen(false)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-primary/25 font-bold text-primary">{labels.register}</Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button type="button" onClick={() => setMobileMenuOpen((open) => !open)} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border md:hidden" aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation" aria-label={de ? "Navigation öffnen" : "Open navigation"}>
                {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <nav id="mobile-navigation" aria-label={de ? "Mobile Navigation" : "Mobile navigation"} className="border-t border-border p-3 md:hidden">
              <div className="grid gap-1">
                {navLinks.map((link) => <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} aria-current={isActive(link.href) ? "page" : undefined} className={`flex min-h-12 items-center rounded-xl px-4 font-bold ${isActive(link.href) ? "bg-primary text-white" : "hover:bg-surface-warm"}`}>{link.label}</Link>)}
                <Link href={switchLangPath} onClick={() => setMobileMenuOpen(false)} className="flex min-h-12 items-center gap-3 rounded-xl px-4 font-bold hover:bg-surface-warm"><Globe2 className="h-5 w-5 text-secondary" aria-hidden="true" />{de ? "English" : "Deutsch"}</Link>
              </div>
            </nav>
          )}
        </header>
      </div>

      <main id="main-content" tabIndex={-1} className="flex-1 pt-[5.5rem] focus:outline-none">{children}</main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
          <div className="grid gap-10 md:grid-cols-[1.25fr_0.75fr_1fr]">
            <div>
              <BrandLogo className="h-10 w-auto object-contain" />
              <p className="mt-5 max-w-sm text-sm leading-6 text-muted">{de ? "Frisch. Lokal. Einfach in Oberglatt." : "Fresh. Local. Simple in Oberglatt."}</p>
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">{de ? "Entdecken" : "Explore"}</h2>
              <ul className="mt-4 space-y-3 text-sm font-medium">{navLinks.map((link) => <li key={link.href}><Link href={link.href} className="hover:text-secondary">{link.label}</Link></li>)}</ul>
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">{labels.contact}</h2>
              <address className="mt-4 space-y-3 text-sm not-italic text-muted">
                <a href={restaurantContent.mapUrl} target="_blank" rel="noreferrer" className="flex min-h-11 items-start gap-3 hover:text-primary"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-secondary" aria-hidden="true" /><span>Allmendstrasse 18<br />8154 Oberglatt</span></a>
                <a href={`tel:${restaurantContent.phone.replace(/\s/g, "")}`} className="flex min-h-11 items-center gap-3 hover:text-primary"><Phone className="h-5 w-5 text-secondary" aria-hidden="true" />{restaurantContent.phone}</a>
                <a href={`mailto:${restaurantContent.email}`} className="flex min-h-11 items-center gap-3 break-all hover:text-primary"><Mail className="h-5 w-5 shrink-0 text-secondary" aria-hidden="true" />{restaurantContent.email}</a>
              </address>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-4 border-t border-border pt-7 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} SaltNPepper. {labels.rights}</p>
            <div className="flex gap-5"><Link href={`/${locale}/privacy`} className="hover:text-primary">{labels.privacy}</Link><Link href={`/${locale}/terms`} className="hover:text-primary">{labels.terms}</Link></div>
          </div>
        </div>
      </footer>

      {count > 0 && (
        <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 sm:hidden">
          <button type="button" onClick={() => router.push(`/${locale}/cart`)} className="flex min-h-14 w-full items-center justify-between rounded-2xl bg-primary px-5 text-white shadow-2xl" aria-label={de ? `Warenkorb ansehen, ${count} Artikel` : `View cart, ${count} items`}>
            <span className="flex items-center gap-3"><ShoppingBag className="h-5 w-5 text-secondary-light" aria-hidden="true" /><span className="font-bold">{labels.cart} · {count}</span></span>
            <span className="flex items-center gap-2 font-bold tabular-nums">{formatChf(cartTotalRappen, locale)}<ChevronRight className="h-5 w-5" aria-hidden="true" /></span>
          </button>
        </div>
      )}
    </div>
  );
}
