import type { Metadata } from "next";
import { Archivo_Black, DM_Sans } from "next/font/google";
import { headers } from "next/headers";
import type { CSSProperties, ReactNode } from "react";

import { getPublicConfig } from "@/server/services/catalog";

import "./globals.css";

export const dynamic = "force-dynamic";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo-black",
});
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: {
    default: "SaltNPepper Restaurant Oberglatt",
    template: "%s | SaltNPepper",
  },
  description:
    "SaltNPepper is your local restaurant at Allmendstrasse 18 in Oberglatt.",
  openGraph: {
    type: "website",
    siteName: "SaltNPepper",
    title: "SaltNPepper Restaurant Oberglatt",
    description: "Fresh, local and simple in Oberglatt.",
  },
  twitter: {
    card: "summary",
    title: "SaltNPepper Restaurant Oberglatt",
    description: "Fresh, local and simple in Oberglatt.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [{ brand }, requestHeaders] = await Promise.all([
    getPublicConfig(),
    headers(),
  ]);
  const language =
    requestHeaders.get("x-next-intl-locale") === "de" ? "de" : "en";
  const brandStyle = {
    "--brand-primary": brand.primaryColor,
    "--brand-secondary": brand.secondaryColor,
  } as CSSProperties;
  const restaurantJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: brand.displayName,
    url: process.env.APP_URL ?? "http://localhost:3000",
    telephone: brand.phone || undefined,
    email: brand.email || undefined,
    address: brand.address || undefined,
  }).replaceAll("<", "\\u003c");
  return (
    <html
      lang={language}
      data-scroll-behavior="smooth"
      className={`${dmSans.variable} ${archivoBlack.variable}`}
    >
      <body suppressHydrationWarning style={brandStyle}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: restaurantJsonLd }}
        />
        {children}
      </body>
    </html>
  );
}
