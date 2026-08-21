import type { MetadataRoute } from "next";

import { locales } from "@/i18n/config";

const pages = [
  "",
  "/menu",
  "/blog",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.APP_URL ?? "http://localhost:3000";
  return pages.flatMap((path) =>
    locales.map((locale) => ({
      url: `${origin}/${locale}${path}`,
      changeFrequency:
        path === "/menu" || path === "/blog"
          ? ("daily" as const)
          : ("monthly" as const),
      priority:
        path === "" ? 1 : path === "/menu" ? 0.9 : path === "/blog" ? 0.8 : 0.6,
      alternates: {
        languages: { de: `${origin}/de${path}`, en: `${origin}/en${path}` },
      },
    })),
  );
}
