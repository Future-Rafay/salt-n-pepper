import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/db";
import { AdminError, saveProduct, saveVariant, softDeleteMenuEntity } from "@/server/services/admin";

export async function saveManagedProduct(actorId: string, data: Omit<Prisma.ProductUncheckedCreateInput, "allergens"> & { id?: string; allergenIds: string[] }) {
  if (data.active) {
    if (!data.id || await prisma.productVariant.count({ where: { productId: data.id, active: true, deletedAt: null } }) === 0) {
      throw new AdminError("PUBLISHED_PRODUCT_REQUIRES_VARIANT");
    }
  }
  return saveProduct(actorId, data);
}

export async function saveManagedVariant(actorId: string, data: Prisma.ProductVariantUncheckedCreateInput & { id?: string }) {
  if (data.id && !data.active) await assertVariantCanDeactivate(data.id);
  return saveVariant(actorId, data);
}

export async function deleteManagedMenuEntity(actorId: string, kind: "category" | "product" | "variant" | "optionGroup" | "optionChoice", id: string) {
  if (kind === "variant") await assertVariantCanDeactivate(id);
  return softDeleteMenuEntity(actorId, kind, id);
}

async function assertVariantCanDeactivate(variantId: string) {
  const variant = await prisma.productVariant.findUnique({ where: { id: variantId }, include: { product: { select: { active: true } } } });
  if (!variant || !variant.active || !variant.product.active) return;
  const alternatives = await prisma.productVariant.count({ where: { productId: variant.productId, id: { not: variantId }, active: true, deletedAt: null } });
  if (alternatives === 0) throw new AdminError("PUBLISHED_PRODUCT_REQUIRES_VARIANT");
}
