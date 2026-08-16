import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/db";
import { AdminError, saveOptionChoice, saveOptionGroup, saveProduct, saveProductSuggestion, saveVariant, softDeleteMenuEntity } from "@/server/services/admin";

export async function saveManagedProduct(actorId: string, data: Omit<Prisma.ProductUncheckedCreateInput, "allergens"> & { id?: string; allergenIds: string[] }) {
  if (data.active) {
    if (!data.id) throw new AdminError("PUBLISHED_PRODUCT_REQUIRES_VARIANT");
    const [variants, groups] = await Promise.all([
      prisma.productVariant.count({ where: { productId: data.id, active: true, deletedAt: null } }),
      prisma.optionGroup.findMany({ where: { productId: data.id, active: true, deletedAt: null }, select: { minimumSelections: true, choices: { where: { active: true, deletedAt: null }, select: { id: true } } } }),
    ]);
    if (variants === 0) throw new AdminError("PUBLISHED_PRODUCT_REQUIRES_VARIANT");
    if (groups.some((group) => group.choices.length < group.minimumSelections)) throw new AdminError("OPTION_GROUP_REQUIRES_CHOICES");
  }
  return saveProduct(actorId, data);
}

export async function saveManagedVariant(actorId: string, data: Prisma.ProductVariantUncheckedCreateInput & { id?: string }) {
  if (data.id && !data.active) await assertVariantCanDeactivate(data.id);
  return saveVariant(actorId, data);
}

export async function deleteManagedMenuEntity(actorId: string, kind: "category" | "product" | "variant" | "optionGroup" | "optionChoice", id: string) {
  if (kind === "variant") await assertVariantCanDeactivate(id);
  if (kind === "optionChoice") await assertOptionChoiceCanDeactivate(id);
  return softDeleteMenuEntity(actorId, kind, id);
}

export async function saveManagedOptionGroup(actorId: string, data: Prisma.OptionGroupUncheckedCreateInput & { id?: string }) {
  const product = await prisma.product.findFirst({ where: { id: data.productId, deletedAt: null }, select: { active: true } });
  const activeChoices = data.id ? await prisma.optionChoice.count({ where: { optionGroupId: data.id, active: true, deletedAt: null } }) : 0;
  assertPublishedOptionCapacity({ productActive: Boolean(product?.active), groupActive: Boolean(data.active), minimumSelections: data.minimumSelections ?? 0, activeChoices });
  return saveOptionGroup(actorId, data);
}

export async function saveManagedOptionChoice(actorId: string, data: Prisma.OptionChoiceUncheckedCreateInput & { id?: string }) {
  if (data.id && !data.active) await assertOptionChoiceCanDeactivate(data.id);
  return saveOptionChoice(actorId, data);
}

export async function saveManagedProductSuggestion(actorId: string, data: Prisma.ProductSuggestionUncheckedCreateInput & { id?: string }) {
  const [source, target, duplicate] = await Promise.all([
    prisma.product.findFirst({ where: { id: data.productId, deletedAt: null }, select: { id: true } }),
    prisma.productVariant.findFirst({
      where: { id: data.suggestedVariantId, active: true, deletedAt: null, product: { deletedAt: null } },
      select: {
        productId: true,
        product: { select: { _count: { select: { optionGroups: { where: { active: true, deletedAt: null, minimumSelections: { gt: 0 } } } } } } },
      },
    }),
    prisma.productSuggestion.findFirst({
      where: { productId: data.productId, suggestedVariantId: data.suggestedVariantId, id: data.id ? { not: data.id } : undefined },
      select: { id: true },
    }),
  ]);
  assertProductSuggestionAllowed({ sourceProductId: data.productId, sourceExists: Boolean(source), targetProductId: target?.productId, duplicate: Boolean(duplicate), requiredOptionGroups: target?.product._count.optionGroups ?? 0 });
  return saveProductSuggestion(actorId, data);
}

export function assertProductSuggestionAllowed({ sourceProductId, sourceExists, targetProductId, duplicate, requiredOptionGroups }: { sourceProductId: string; sourceExists: boolean; targetProductId?: string; duplicate: boolean; requiredOptionGroups: number }) {
  if (!sourceExists) throw new AdminError("PRODUCT_NOT_FOUND");
  if (!targetProductId) throw new AdminError("SUGGESTED_VARIANT_UNAVAILABLE");
  if (targetProductId === sourceProductId) throw new AdminError("PRODUCT_CANNOT_SUGGEST_ITSELF");
  if (duplicate) throw new AdminError("PRODUCT_SUGGESTION_ALREADY_EXISTS");
  if (requiredOptionGroups > 0) throw new AdminError("SUGGESTED_PRODUCT_REQUIRES_OPTIONS");
}

export function assertPublishedOptionCapacity({ productActive, groupActive, minimumSelections, activeChoices }: { productActive: boolean; groupActive: boolean; minimumSelections: number; activeChoices: number }) {
  if (productActive && groupActive && activeChoices < minimumSelections) throw new AdminError("OPTION_GROUP_REQUIRES_CHOICES");
}

async function assertOptionChoiceCanDeactivate(choiceId: string) {
  const choice = await prisma.optionChoice.findFirst({
    where: { id: choiceId, active: true, deletedAt: null },
    select: { optionGroup: { select: { id: true, active: true, minimumSelections: true, product: { select: { active: true } } } } },
  });
  if (!choice) return;
  const group = choice.optionGroup;
  const alternatives = await prisma.optionChoice.count({ where: { optionGroupId: group.id, id: { not: choiceId }, active: true, deletedAt: null } });
  assertPublishedOptionCapacity({ productActive: group.product.active, groupActive: group.active, minimumSelections: group.minimumSelections, activeChoices: alternatives });
}

async function assertVariantCanDeactivate(variantId: string) {
  const variant = await prisma.productVariant.findUnique({ where: { id: variantId }, include: { product: { select: { active: true } } } });
  if (!variant || !variant.active || !variant.product.active) return;
  const alternatives = await prisma.productVariant.count({ where: { productId: variant.productId, id: { not: variantId }, active: true, deletedAt: null } });
  if (alternatives === 0) throw new AdminError("PUBLISHED_PRODUCT_REQUIRES_VARIANT");
}
