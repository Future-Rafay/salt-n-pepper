import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { hash } from "bcryptjs";
import "dotenv/config";

import { PrismaClient } from "../src/generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;
const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();
const ownerPassword = process.env.OWNER_PASSWORD;
const ownerName = process.env.OWNER_NAME?.trim() || "SaltNPepper Owner";

if (!databaseUrl) throw new Error("DATABASE_URL is required.");
if (!ownerEmail) throw new Error("OWNER_EMAIL is required.");
if (!ownerPassword || ownerPassword.startsWith("replace-with")) {
  throw new Error("Set a real OWNER_PASSWORD before running the seed.");
}

const bootstrapEmail = ownerEmail;
const bootstrapPassword = ownerPassword;

const prisma = new PrismaClient({ adapter: new PrismaMariaDb(databaseUrl) });

const allergens = [
  ["gluten", "Gluten", "Gluten"],
  ["crustaceans", "Krebstiere", "Crustaceans"],
  ["eggs", "Eier", "Eggs"],
  ["fish", "Fisch", "Fish"],
  ["peanuts", "Erdnüsse", "Peanuts"],
  ["soy", "Soja", "Soy"],
  ["milk", "Milch", "Milk"],
  ["nuts", "Schalenfrüchte", "Tree nuts"],
  ["celery", "Sellerie", "Celery"],
  ["mustard", "Senf", "Mustard"],
  ["sesame", "Sesam", "Sesame"],
  ["sulphites", "Sulfite", "Sulphites"],
  ["lupin", "Lupinen", "Lupin"],
  ["molluscs", "Weichtiere", "Molluscs"],
] as const;

async function main() {
  const passwordHash = await hash(bootstrapPassword, 12);
  const siteSettings = {
    displayName: "SaltNPepper",
    legalName: "SaltNPepper",
    slug: "saltnpepper",
    email: "info@saltnpepper.ch",
    phone: "+41 76 408 94 30",
    street: "Allmendstrasse 18",
    postalCode: "8154",
    city: "Oberglatt",
    countryCode: "CH",
    timezone: "Europe/Zurich",
    currency: "CHF",
    primaryColor: "#1C1917",
    secondaryColor: "#B43A25",
    logoKey: null,
    compactLogoKey: null,
    faviconKey: null,
    heroImageKey: "/images/editorial/restaurant-table.jpg",
    heroTitleDe: "Frisch. Lokal. SaltNPepper.",
    heroTitleEn: "Fresh. Local. SaltNPepper.",
    heroSubtitleDe: "SaltNPepper ist Ihr lokales Restaurant in Oberglatt – frisch zubereitet und einfach online bestellt.",
    heroSubtitleEn: "SaltNPepper is your local restaurant in Oberglatt, serving freshly prepared food with simple online ordering.",
    aboutDe: "Wir schaffen einen Ort für frisch zubereitetes Essen, herzliche Begegnungen und einfache Bestellungen.",
    aboutEn: "We are creating a place for freshly prepared food, warm encounters, and simple ordering.",
  } as const;
  const fulfillmentSettings = {
    deliveryEnabled: false,
    pickupEnabled: false,
    asapEnabled: false,
    scheduledEnabled: false,
  } as const;

  await prisma.$transaction([
    prisma.siteSettings.upsert({
      where: { id: 1 },
      create: { id: 1, ...siteSettings },
      update: siteSettings,
    }),
    prisma.fulfillmentSettings.upsert({
      where: { id: 1 },
      create: { id: 1, ...fulfillmentSettings },
      update: fulfillmentSettings,
    }),
    prisma.user.upsert({
      where: { email: bootstrapEmail },
      create: {
        email: bootstrapEmail,
        name: ownerName,
        passwordHash,
        role: "OWNER",
        active: true,
      },
      update: {
        name: ownerName,
        passwordHash,
        role: "OWNER",
        active: true,
      },
    }),
    ...allergens.map(([code, nameDe, nameEn], sortOrder) =>
      prisma.allergen.upsert({
        where: { code },
        create: { code, nameDe, nameEn, sortOrder },
        update: { nameDe, nameEn, sortOrder },
      }),
    ),
  ]);

}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
