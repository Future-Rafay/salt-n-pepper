import type { MetadataRoute } from "next";

const pages = ["", "/menu", "/about", "/contact", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.APP_URL ?? "http://localhost:3000";
  return pages.flatMap((path) => (["de", "en"] as const).map((locale) => ({ url: `${origin}/${locale}${path}`, changeFrequency: path === "/menu" ? "daily" as const : "monthly" as const, priority: path === "" ? 1 : path === "/menu" ? 0.9 : 0.6, alternates: { languages: { de: `${origin}/de${path}`, en: `${origin}/en${path}` } } })));
}
