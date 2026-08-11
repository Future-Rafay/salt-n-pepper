import type { Metadata } from "next";

export function localizedMetadata(locale: string, path: string, title: { de: string; en: string }, description: { de: string; en: string }): Metadata {
  const language = locale === "en" ? "en" : "de";
  return { title: title[language], description: description[language], alternates: { canonical: `/${language}${path}`, languages: { "de-CH": `/de${path}`, "en-CH": `/en${path}` } }, openGraph: { locale: language === "de" ? "de_CH" : "en_CH", title: title[language], description: description[language], url: `/${language}${path}` } };
}
