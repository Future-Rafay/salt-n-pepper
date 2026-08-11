import type { Locale } from "@/generated/prisma/enums";
import { cache } from "react";
import { buildDeliveryAnnouncement } from "@/lib/delivery-announcement";
import { prisma } from "@/server/db";
import { zurichParts } from "@/lib/zurich-time";
import { resolvePublicImageUrl } from "@/server/storage/s3";
import { restaurantContent } from "@/content/restaurant";

export const getPublicConfig = cache(async function getPublicConfig() {
  const [site, fulfillment, hours, deliveryZones] = await Promise.all([
    prisma.siteSettings.findUniqueOrThrow({ where: { id: 1 } }),
    prisma.fulfillmentSettings.findUniqueOrThrow({ where: { id: 1 } }),
    prisma.openingWindow.findMany({ where: { active: true }, orderBy: [{ weekday: "asc" }, { sortOrder: "asc" }] }),
    prisma.deliveryZone.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      include: { postalCodes: { orderBy: { postalCode: "asc" } } },
    }),
  ]);

  const announcementZone = deliveryZones[0];
  const announcementInput = announcementZone
    ? {
        postalCodes: announcementZone.postalCodes.map(({ postalCode }) => postalCode),
        minimumSubtotalRappen: announcementZone.minimumSubtotalRappen,
        freeDeliveryThresholdRappen: announcementZone.freeDeliveryThresholdRappen,
      }
    : null;

  return {
    locales: ["de", "en"],
    brand: {
      displayName: site.displayName,
      email: site.email,
      phone: site.phone,
      address: [site.street, site.postalCode, site.city].filter(Boolean).join(", "),
      primaryColor: site.primaryColor,
      secondaryColor: site.secondaryColor,
      logoKey: resolvePublicImageUrl(site.logoKey) ?? restaurantContent.logo,
      compactLogoKey: resolvePublicImageUrl(site.compactLogoKey) ?? restaurantContent.compactLogo,
      heroImageKey: resolvePublicImageUrl(site.heroImageKey) ?? restaurantContent.heroImage,
      heroTitleDe: site.heroTitleDe,
      heroTitleEn: site.heroTitleEn,
      heroSubtitleDe: site.heroSubtitleDe,
      heroSubtitleEn: site.heroSubtitleEn,
      aboutDe: site.aboutDe,
      aboutEn: site.aboutEn,
      street: site.street,
      postalCode: site.postalCode,
      city: site.city,
      instagramUrl: site.instagramUrl,
      facebookUrl: site.facebookUrl,
    },
    fulfillment: {
      deliveryEnabled: fulfillment.deliveryEnabled,
      pickupEnabled: fulfillment.pickupEnabled,
      asapEnabled: fulfillment.asapEnabled,
      scheduledEnabled: fulfillment.scheduledEnabled,
    },
    announcement:
      site.announcementActive && announcementInput
        ? {
            de: buildDeliveryAnnouncement(announcementInput, "de"),
            en: buildDeliveryAnnouncement(announcementInput, "en"),
          }
        : null,
    hours,
  };
});

export async function getPublicMenu(locale: Locale, at = new Date()) {
  const current = zurichParts(at);
  const categories = await prisma.category.findMany({
    where: { active: true, deletedAt: null },
    orderBy: { sortOrder: "asc" },
    include: {
      products: {
        where: { active: true, deletedAt: null },
        orderBy: { sortOrder: "asc" },
        include: {
          variants: { where: { active: true, deletedAt: null }, orderBy: { sortOrder: "asc" } },
          optionGroups: {
            where: { active: true, deletedAt: null },
            orderBy: { sortOrder: "asc" },
            include: { choices: { where: { active: true, deletedAt: null }, orderBy: { sortOrder: "asc" } } },
          },
          availabilityWindows: true,
          allergens: { include: { allergen: true } },
        },
      },
    },
  });

  return categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    name: locale === "DE" ? category.nameDe : category.nameEn,
    description: locale === "DE" ? category.descriptionDe : category.descriptionEn,
    products: category.products.filter((product) => product.variants.length > 0).map((product) => {
      const timedAvailable =
        product.availabilityWindows.length === 0 ||
        product.availabilityWindows.some(
          (window) =>
            window.weekday === current.weekday &&
            current.minute >= window.startMinute &&
            current.minute < window.endMinute,
        );
      return {
        id: product.id,
        slug: product.slug,
        name: locale === "DE" ? product.nameDe : product.nameEn,
        description: locale === "DE" ? product.descriptionDe : product.descriptionEn,
        imageKey: resolvePublicImageUrl(product.imageKey),
        available: product.available && timedAvailable,
        isHalal: product.isHalal,
        isVegetarian: product.isVegetarian,
        isVegan: product.isVegan,
        spiceLevel: product.spiceLevel,
        allergens: product.allergens.map(({ allergen }) => ({
          code: allergen.code,
          name: locale === "DE" ? allergen.nameDe : allergen.nameEn,
        })),
        variants: product.variants.map((variant) => ({
          id: variant.id,
          name: locale === "DE" ? variant.nameDe : variant.nameEn,
          priceRappen: variant.priceRappen,
        })),
        optionGroups: product.optionGroups.map((group) => ({
          id: group.id,
          name: locale === "DE" ? group.nameDe : group.nameEn,
          required: group.required,
          minimumSelections: group.minimumSelections,
          maximumSelections: group.maximumSelections,
          choices: group.choices.map((choice) => ({
            id: choice.id,
            name: locale === "DE" ? choice.nameDe : choice.nameEn,
            priceDeltaRappen: choice.priceDeltaRappen,
          })),
        })),
      };
    }),
  }));
}
