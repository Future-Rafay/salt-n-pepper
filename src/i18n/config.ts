import { siteConfig, supportedLocales } from "@/config/site";

export const locales = supportedLocales;
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = siteConfig.locale;

export function isAppLocale(value: string): value is AppLocale {
  return locales.includes(value as AppLocale);
}
