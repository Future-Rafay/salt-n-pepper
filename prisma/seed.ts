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

const categories = [
  { slug: "starters", nameDe: "Vorspeisen", nameEn: "Starters", descriptionDe: "Knusprige Kleinigkeiten zum Teilen.", descriptionEn: "Crisp bites made for sharing." },
  { slug: "grill", nameDe: "Vom Grill", nameEn: "From the grill", descriptionDe: "Würzig marinierte Grillgerichte.", descriptionEn: "Boldly marinated dishes from the grill." },
  { slug: "curries", nameDe: "Currys", nameEn: "Curries", descriptionDe: "Wärmende Klassiker mit aromatischen Gewürzen.", descriptionEn: "Comforting classics layered with aromatic spices." },
  { slug: "rice-bread", nameDe: "Reis & Brot", nameEn: "Rice & bread", descriptionDe: "Duftender Reis und frisch gebackene Beilagen.", descriptionEn: "Fragrant rice and freshly baked sides." },
  { slug: "drinks-desserts", nameDe: "Getränke & Desserts", nameEn: "Drinks & desserts", descriptionDe: "Erfrischende und süsse Abschlüsse.", descriptionEn: "Refreshing and sweet finishes." },
] as const;

const products = [
  { category: "starters", slug: "vegetable-samosa", nameDe: "Gemüse-Samosa", nameEn: "Vegetable Samosa", descriptionDe: "Knusprige Teigtaschen mit würziger Gemüsefüllung.", descriptionEn: "Crisp pastry filled with gently spiced vegetables.", imageKey: "SaltNPepper/products/samosa.jpg", priceRappen: 750, vegetarian: true, vegan: false, halal: false, spiceLevel: "MILD", allergens: ["gluten"] },
  { category: "starters", slug: "chicken-pakora", nameDe: "Chicken Pakora", nameEn: "Chicken Pakora", descriptionDe: "Saftige Pouletstücke in einem knusprig gewürzten Teigmantel.", descriptionEn: "Tender chicken bites in a crisp, seasoned coating.", imageKey: "SaltNPepper/products/chicken-pakora.jpg", priceRappen: 1150, vegetarian: false, vegan: false, halal: true, spiceLevel: "MILD", allergens: [] },
  { category: "grill", slug: "chicken-tikka", nameDe: "Chicken Tikka", nameEn: "Chicken Tikka", descriptionDe: "Joghurtmariniertes Poulet, kräftig gewürzt und gegrillt.", descriptionEn: "Yogurt-marinated chicken, boldly seasoned and grilled.", imageKey: "SaltNPepper/products/chicken-tikka.jpg", priceRappen: 2250, vegetarian: false, vegan: false, halal: true, spiceLevel: "MEDIUM", allergens: ["milk"] },
  { category: "grill", slug: "seekh-kebab", nameDe: "Seekh Kebab", nameEn: "Seekh Kebab", descriptionDe: "Saftige Hackfleischspiesse mit Kräutern und Gewürzen.", descriptionEn: "Juicy minced-meat skewers with herbs and warm spices.", imageKey: "SaltNPepper/products/chicken-tikka.jpg", priceRappen: 2150, vegetarian: false, vegan: false, halal: true, spiceLevel: "MEDIUM", allergens: [] },
  { category: "grill", slug: "mixed-grill", nameDe: "Mixed Grill", nameEn: "Mixed Grill", descriptionDe: "Eine grosszügige Auswahl unserer Grillfavoriten.", descriptionEn: "A generous selection of our grilled favourites.", imageKey: "SaltNPepper/products/mixed-grill.jpg", priceRappen: 2950, vegetarian: false, vegan: false, halal: true, spiceLevel: "MEDIUM", allergens: ["milk"] },
  { category: "curries", slug: "butter-chicken", nameDe: "Butter Chicken", nameEn: "Butter Chicken", descriptionDe: "Zartes Poulet in einer cremigen Tomaten-Butter-Sauce.", descriptionEn: "Tender chicken in a creamy tomato and butter sauce.", imageKey: "SaltNPepper/products/butter-chicken.jpg", priceRappen: 2350, vegetarian: false, vegan: false, halal: true, spiceLevel: "MILD", allergens: ["milk"] },
  { category: "curries", slug: "chicken-karahi", nameDe: "Chicken Karahi", nameEn: "Chicken Karahi", descriptionDe: "Poulet mit Tomaten, Ingwer, Kräutern und kräftigen Gewürzen.", descriptionEn: "Chicken cooked with tomato, ginger, herbs, and bold spices.", imageKey: "SaltNPepper/products/chicken-karahi.jpg", priceRappen: 2450, vegetarian: false, vegan: false, halal: true, spiceLevel: "MEDIUM", allergens: [] },
  { category: "curries", slug: "chana-masala", nameDe: "Chana Masala", nameEn: "Chana Masala", descriptionDe: "Kichererbsen in einer aromatischen Tomaten-Gewürz-Sauce.", descriptionEn: "Chickpeas in an aromatic tomato and spice sauce.", imageKey: "SaltNPepper/products/chana-masala.jpg", priceRappen: 1850, vegetarian: true, vegan: true, halal: false, spiceLevel: "MEDIUM", allergens: [] },
  { category: "rice-bread", slug: "chicken-biryani", nameDe: "Chicken Biryani", nameEn: "Chicken Biryani", descriptionDe: "Duftender Basmatireis mit gewürztem Poulet und Kräutern.", descriptionEn: "Fragrant basmati rice layered with spiced chicken and herbs.", imageKey: "SaltNPepper/products/chicken-biryani.jpg", priceRappen: 2250, vegetarian: false, vegan: false, halal: true, spiceLevel: "MEDIUM", allergens: [] },
  { category: "rice-bread", slug: "vegetable-biryani", nameDe: "Gemüse-Biryani", nameEn: "Vegetable Biryani", descriptionDe: "Aromatischer Basmatireis mit saisonalem Gemüse.", descriptionEn: "Aromatic basmati rice with seasonal vegetables.", imageKey: "SaltNPepper/products/vegetable-biryani.jpg", priceRappen: 1950, vegetarian: true, vegan: true, halal: false, spiceLevel: "MILD", allergens: [] },
  { category: "rice-bread", slug: "naan", nameDe: "Naan", nameEn: "Naan", descriptionDe: "Weiches, frisch gebackenes Fladenbrot.", descriptionEn: "Soft, freshly baked flatbread.", imageKey: "SaltNPepper/products/naan.jpg", priceRappen: 400, vegetarian: true, vegan: false, halal: false, spiceLevel: null, allergens: ["gluten", "milk"] },
  { category: "drinks-desserts", slug: "mango-lassi", nameDe: "Mango Lassi", nameEn: "Mango Lassi", descriptionDe: "Cremiger Joghurt-Drink mit Mango.", descriptionEn: "A creamy yogurt drink blended with mango.", imageKey: "SaltNPepper/products/mango-lassi.jpg", priceRappen: 650, vegetarian: true, vegan: false, halal: false, spiceLevel: null, allergens: ["milk"] },
  { category: "drinks-desserts", slug: "gulab-jamun", nameDe: "Gulab Jamun", nameEn: "Gulab Jamun", descriptionDe: "Warme Milchteigbällchen in duftendem Zuckersirup.", descriptionEn: "Warm milk-dough dumplings in fragrant sugar syrup.", imageKey: "SaltNPepper/products/gulab-jamun.jpg", priceRappen: 750, vegetarian: true, vegan: false, halal: false, spiceLevel: null, allergens: ["gluten", "milk"] },
] as const;

const weekdays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const;

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
    announcementDe: "Oberglatt, wir liefern! 8154 · Mindestbestellung CHF 30 · Gratislieferung ab CHF 60",
    announcementEn: "Oberglatt, we deliver! 8154 · CHF 30 minimum · Free delivery from CHF 60",
    announcementActive: true,
    instagramUrl: "https://www.instagram.com/foodeez.ch",
    facebookUrl: "https://facebook.com/foodeez.ch",
  } as const;
  const fulfillmentSettings = {
    deliveryEnabled: true,
    pickupEnabled: true,
    asapEnabled: true,
    scheduledEnabled: true,
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

  const allergenRows = await prisma.allergen.findMany({ select: { id: true, code: true } });
  const allergenIds = new Map(allergenRows.map(({ id, code }) => [code, id]));
  const categoryIds = new Map<string, string>();

  for (const [sortOrder, category] of categories.entries()) {
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      create: { ...category, sortOrder, active: true },
      update: { ...category, sortOrder, active: true, deletedAt: null },
    });
    categoryIds.set(category.slug, row.id);
  }

  for (const [sortOrder, product] of products.entries()) {
    const categoryId = categoryIds.get(product.category);
    if (!categoryId) throw new Error(`Missing seed category: ${product.category}`);

    const row = await prisma.product.upsert({
      where: { slug: product.slug },
      create: {
        categoryId,
        slug: product.slug,
        nameDe: product.nameDe,
        nameEn: product.nameEn,
        descriptionDe: product.descriptionDe,
        descriptionEn: product.descriptionEn,
        imageKey: product.imageKey,
        active: true,
        available: true,
        sortOrder,
        isHalal: product.halal,
        isVegetarian: product.vegetarian,
        isVegan: product.vegan,
        spiceLevel: product.spiceLevel,
      },
      update: {
        categoryId,
        nameDe: product.nameDe,
        nameEn: product.nameEn,
        descriptionDe: product.descriptionDe,
        descriptionEn: product.descriptionEn,
        imageKey: product.imageKey,
        active: true,
        available: true,
        sortOrder,
        isHalal: product.halal,
        isVegetarian: product.vegetarian,
        isVegan: product.vegan,
        spiceLevel: product.spiceLevel,
        deletedAt: null,
      },
    });

    await prisma.productVariant.upsert({
      where: { sku: `SNP-${product.slug.toUpperCase()}` },
      create: { productId: row.id, sku: `SNP-${product.slug.toUpperCase()}`, nameDe: "Standard", nameEn: "Standard", priceRappen: product.priceRappen },
      update: { productId: row.id, nameDe: "Standard", nameEn: "Standard", priceRappen: product.priceRappen, active: true, deletedAt: null },
    });

    await prisma.productAllergen.deleteMany({ where: { productId: row.id } });
    if (product.allergens.length > 0) {
      await prisma.productAllergen.createMany({
        data: product.allergens.map((code) => {
          const allergenId = allergenIds.get(code);
          if (!allergenId) throw new Error(`Missing seed allergen: ${code}`);
          return { productId: row.id, allergenId };
        }),
      });
    }
  }

  await prisma.$transaction([
    prisma.openingWindow.deleteMany(),
    prisma.openingWindow.createMany({
      data: (["PICKUP", "DELIVERY"] as const).flatMap((fulfillmentType) =>
        weekdays.map((weekday, sortOrder) => ({ fulfillmentType, weekday, startMinute: 660, endMinute: 1320, sortOrder })),
      ),
    }),
  ]);

  const existingPostcode = await prisma.deliveryZonePostalCode.findUnique({ where: { postalCode: "8154" } });
  if (existingPostcode) {
    await prisma.deliveryZone.update({
      where: { id: existingPostcode.deliveryZoneId },
      data: { nameDe: "Oberglatt", nameEn: "Oberglatt", active: true, feeRappen: 500, minimumSubtotalRappen: 3000, freeDeliveryThresholdRappen: 6000, estimatedMinutes: 45, sortOrder: 0 },
    });
  } else {
    await prisma.deliveryZone.create({
      data: {
        nameDe: "Oberglatt",
        nameEn: "Oberglatt",
        active: true,
        feeRappen: 500,
        minimumSubtotalRappen: 3000,
        freeDeliveryThresholdRappen: 6000,
        estimatedMinutes: 45,
        sortOrder: 0,
        postalCodes: { create: { postalCode: "8154" } },
      },
    });
  }

}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
