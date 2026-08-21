export const supportedLocales = ["de", "en"] as const;
export type SiteLocale = (typeof supportedLocales)[number];

export const supportedCurrencies = ["CHF", "EUR", "USD"] as const;
export type SiteCurrency = (typeof supportedCurrencies)[number];

export const siteConfig: { locale: SiteLocale; currency: SiteCurrency } = {
  locale: "de",
  currency: "CHF",
};
