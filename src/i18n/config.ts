export const locales = ["de", "en"] as const;
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = "de";

export function isAppLocale(value: string): value is AppLocale {
  return locales.includes(value as AppLocale);
}
