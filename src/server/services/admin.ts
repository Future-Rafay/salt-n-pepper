import type { Prisma } from "@/generated/prisma/client";
import type Stripe from "stripe";
import { formatOrderNumber, parseOrderNumber } from "@/lib/orders";
import { prisma } from "@/server/db";
import { getStripe } from "@/server/payments/stripe";

type Db = Prisma.TransactionClient | typeof prisma;

export class AdminError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

async function audit(db: Db, actorUserId: string, action: string, entityType: string, entityId: string, metadata?: Prisma.InputJsonValue) {
  await db.auditLog.create({ data: { actorUserId, action, entityType, entityId, metadata } });
}

export async function getMenuAdminData() {
  const [categories, products, allergens] = await Promise.all([
    prisma.category.findMany({ where: { deletedAt: null }, orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }] }),
    prisma.product.findMany({
      where: { deletedAt: null },
      include: {
        category: { select: { nameEn: true } },
        variants: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" } },
        optionGroups: { where: { deletedAt: null }, include: { choices: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } },
        suggestions: { include: { suggestedVariant: { include: { product: true } } }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
        availabilityWindows: { orderBy: [{ weekday: "asc" }, { startMinute: "asc" }] },
        allergens: { select: { allergenId: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }],
    }),
    prisma.allergen.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  return { categories, products, allergens };
}

export async function getSettingsAdminData() {
  const [site, fulfillment, windows, exceptions, zones] = await Promise.all([
    prisma.siteSettings.findUniqueOrThrow({ where: { id: 1 } }),
    prisma.fulfillmentSettings.findUniqueOrThrow({ where: { id: 1 } }),
    prisma.openingWindow.findMany({ orderBy: [{ weekday: "asc" }, { fulfillmentType: "asc" }, { sortOrder: "asc" }] }),
    prisma.serviceException.findMany({ where: { date: { gte: new Date(new Date().toISOString().slice(0, 10)) } }, orderBy: { date: "asc" }, take: 100 }),
    prisma.deliveryZone.findMany({ include: { postalCodes: { orderBy: { postalCode: "asc" } } }, orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }] }),
  ]);
  return { site, fulfillment, windows, exceptions, zones };
}

export async function getPromosAdminData() {
  return prisma.promoCode.findMany({ include: { _count: { select: { redemptions: true } } }, orderBy: { createdAt: "desc" } });
}

export async function getStaffAdminData() {
  const [staff, invitations] = await Promise.all([
    prisma.user.findMany({ where: { role: "STAFF" }, select: { id: true, email: true, name: true, active: true, lastLoginAt: true, createdAt: true }, orderBy: { createdAt: "desc" } }),
    prisma.staffInvitation.findMany({ where: { acceptedAt: null }, select: { id: true, email: true, expiresAt: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 50 }),
  ]);
  return { staff, invitations };
}

const adminOrderInclude = {
  address: true,
  items: { include: { options: true } },
  payment: { include: { refunds: { orderBy: { createdAt: "desc" as const } } } },
  statusEvents: { include: { actor: { select: { name: true, email: true } } }, orderBy: { createdAt: "asc" as const } },
} satisfies Prisma.OrderInclude;

function adminOrderDto(order: Prisma.OrderGetPayload<{ include: typeof adminOrderInclude }>) {
  return {
    ...order,
    id: order.id.toString(),
    orderNumber: formatOrderNumber(order.id),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    scheduledFor: order.scheduledFor?.toISOString() ?? null,
    estimatedReadyAt: order.estimatedReadyAt?.toISOString() ?? null,
    remainingRefundableRappen: order.payment?.provider === "STRIPE" ? Math.max(0, order.payment.amountRappen - order.payment.refundedRappen) : 0,
  };
}

export async function getOrderHistory(status?: string) {
  const allowed = ["PAYMENT_PENDING", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"] as const;
  const where = allowed.includes(status as typeof allowed[number]) ? { status: status as typeof allowed[number] } : {};
  const orders = await prisma.order.findMany({ where, include: adminOrderInclude, orderBy: { createdAt: "desc" }, take: 200 });
  return orders.map(adminOrderDto);
}

export async function getAdminOrder(orderNumber: string) {
  const id = parseOrderNumber(orderNumber);
  if (!id) return null;
  const order = await prisma.order.findUnique({ where: { id }, include: adminOrderInclude });
  return order ? adminOrderDto(order) : null;
}

export async function getAuditLogs() {
  return prisma.auditLog.findMany({ include: { actor: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" }, take: 250 });
}

export async function getDashboardData() {
  const [payments, totalOrders, totalProducts, availableProducts, activeOrders, pendingStripe, recentRows] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: { in: ["PAID", "PARTIALLY_REFUNDED", "REFUNDED"] } },
      _sum: { amountRappen: true, refundedRappen: true },
    }),
    prisma.order.count(),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { deletedAt: null, active: true, available: true } }),
    prisma.order.count({ where: { status: { in: ["PAYMENT_PENDING", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY"] } } }),
    prisma.payment.count({ where: { provider: "STRIPE", status: "PENDING", order: { status: "PAYMENT_PENDING" } } }),
    prisma.order.findMany({ include: adminOrderInclude, orderBy: { createdAt: "desc" }, take: 10 }),
  ]);
  return {
    revenueRappen: Math.max(0, (payments._sum.amountRappen ?? 0) - (payments._sum.refundedRappen ?? 0)),
    totalOrders,
    totalProducts,
    availableProducts,
    unavailableProducts: totalProducts - availableProducts,
    activeOrders,
    pendingStripe,
    recentOrders: recentRows.map(adminOrderDto),
  };
}

export async function saveCategory(actorId: string, data: Prisma.CategoryUncheckedCreateInput & { id?: string }) {
  const { id, ...values } = data;
  const row = id
    ? await prisma.category.update({ where: { id, deletedAt: null }, data: values })
    : await prisma.category.create({ data: values });
  await audit(prisma, actorId, id ? "CATEGORY_UPDATED" : "CATEGORY_CREATED", "Category", row.id);
  return row;
}

export async function saveProduct(actorId: string, data: Omit<Prisma.ProductUncheckedCreateInput, "allergens"> & { id?: string; allergenIds: string[] }) {
  const { id, allergenIds, ...values } = data;
  return prisma.$transaction(async (tx) => {
    const row = id
      ? await tx.product.update({ where: { id, deletedAt: null }, data: values })
      : await tx.product.create({ data: values });
    await tx.productAllergen.deleteMany({ where: { productId: row.id } });
    if (allergenIds.length) await tx.productAllergen.createMany({ data: allergenIds.map((allergenId) => ({ productId: row.id, allergenId })) });
    await audit(tx, actorId, id ? "PRODUCT_UPDATED" : "PRODUCT_CREATED", "Product", row.id);
    return row;
  });
}

export async function saveVariant(actorId: string, data: Prisma.ProductVariantUncheckedCreateInput & { id?: string }) {
  const { id, ...values } = data;
  const row = id ? await prisma.productVariant.update({ where: { id, deletedAt: null }, data: values }) : await prisma.productVariant.create({ data: values });
  await audit(prisma, actorId, id ? "VARIANT_UPDATED" : "VARIANT_CREATED", "ProductVariant", row.id);
  return row;
}

export async function saveOptionGroup(actorId: string, data: Prisma.OptionGroupUncheckedCreateInput & { id?: string }) {
  const { id, ...values } = data;
  const row = id ? await prisma.optionGroup.update({ where: { id, deletedAt: null }, data: values }) : await prisma.optionGroup.create({ data: values });
  await audit(prisma, actorId, id ? "OPTION_GROUP_UPDATED" : "OPTION_GROUP_CREATED", "OptionGroup", row.id);
  return row;
}

export async function saveOptionChoice(actorId: string, data: Prisma.OptionChoiceUncheckedCreateInput & { id?: string }) {
  const { id, ...values } = data;
  const row = id ? await prisma.optionChoice.update({ where: { id, deletedAt: null }, data: values }) : await prisma.optionChoice.create({ data: values });
  await audit(prisma, actorId, id ? "OPTION_CHOICE_UPDATED" : "OPTION_CHOICE_CREATED", "OptionChoice", row.id);
  return row;
}

export async function saveProductSuggestion(actorId: string, data: Prisma.ProductSuggestionUncheckedCreateInput & { id?: string }) {
  const { id, ...values } = data;
  return prisma.$transaction(async (tx) => {
    const row = id ? await tx.productSuggestion.update({ where: { id }, data: values }) : await tx.productSuggestion.create({ data: values });
    await audit(tx, actorId, id ? "PRODUCT_SUGGESTION_UPDATED" : "PRODUCT_SUGGESTION_CREATED", "ProductSuggestion", row.id, { productId: row.productId, suggestedVariantId: row.suggestedVariantId });
    return row;
  });
}

export async function deleteProductSuggestion(actorId: string, id: string) {
  await prisma.$transaction(async (tx) => {
    const row = await tx.productSuggestion.delete({ where: { id } });
    await audit(tx, actorId, "PRODUCT_SUGGESTION_DELETED", "ProductSuggestion", row.id, { productId: row.productId, suggestedVariantId: row.suggestedVariantId });
  });
}

export async function saveAvailabilityWindow(actorId: string, data: Prisma.ProductAvailabilityWindowUncheckedCreateInput & { id?: string }) {
  const { id, ...values } = data;
  const row = id ? await prisma.productAvailabilityWindow.update({ where: { id }, data: values }) : await prisma.productAvailabilityWindow.create({ data: values });
  await audit(prisma, actorId, id ? "PRODUCT_WINDOW_UPDATED" : "PRODUCT_WINDOW_CREATED", "ProductAvailabilityWindow", row.id);
  return row;
}

const softDeleteModels = {
  category: "category",
  product: "product",
  variant: "productVariant",
  optionGroup: "optionGroup",
  optionChoice: "optionChoice",
} as const;

export async function softDeleteMenuEntity(actorId: string, kind: keyof typeof softDeleteModels, id: string) {
  await prisma.$transaction(async (tx) => {
    if (kind === "category") await tx.category.update({ where: { id }, data: { deletedAt: new Date(), active: false } });
    if (kind === "product") await tx.product.update({ where: { id }, data: { deletedAt: new Date(), active: false, available: false } });
    if (kind === "variant") await tx.productVariant.update({ where: { id }, data: { deletedAt: new Date(), active: false } });
    if (kind === "optionGroup") await tx.optionGroup.update({ where: { id }, data: { deletedAt: new Date(), active: false } });
    if (kind === "optionChoice") await tx.optionChoice.update({ where: { id }, data: { deletedAt: new Date(), active: false } });
    await audit(tx, actorId, `${kind.toUpperCase()}_DELETED`, softDeleteModels[kind], id);
  });
}

export async function deleteAvailabilityWindow(actorId: string, id: string) {
  await prisma.$transaction(async (tx) => { await tx.productAvailabilityWindow.delete({ where: { id } }); await audit(tx, actorId, "PRODUCT_WINDOW_DELETED", "ProductAvailabilityWindow", id); });
}

export async function saveFulfillment(actorId: string, data: Prisma.FulfillmentSettingsUpdateInput) {
  const row = await prisma.fulfillmentSettings.update({ where: { id: 1 }, data });
  await audit(prisma, actorId, "FULFILLMENT_SETTINGS_UPDATED", "FulfillmentSettings", "1");
  return row;
}

export async function saveOpeningWindow(actorId: string, data: Prisma.OpeningWindowUncheckedCreateInput & { id?: string }) {
  const { id, ...values } = data;
  const row = id ? await prisma.openingWindow.update({ where: { id }, data: values }) : await prisma.openingWindow.create({ data: values });
  await audit(prisma, actorId, id ? "OPENING_WINDOW_UPDATED" : "OPENING_WINDOW_CREATED", "OpeningWindow", row.id);
  return row;
}

export async function saveServiceException(actorId: string, data: Prisma.ServiceExceptionUncheckedCreateInput & { id?: string }) {
  const { id, ...values } = data;
  const row = id ? await prisma.serviceException.update({ where: { id }, data: values }) : await prisma.serviceException.create({ data: values });
  await audit(prisma, actorId, id ? "SERVICE_EXCEPTION_UPDATED" : "SERVICE_EXCEPTION_CREATED", "ServiceException", row.id);
  return row;
}

export async function deleteScheduleEntity(actorId: string, kind: "window" | "exception", id: string) {
  await prisma.$transaction(async (tx) => {
    if (kind === "window") await tx.openingWindow.delete({ where: { id } });
    else await tx.serviceException.delete({ where: { id } });
    await audit(tx, actorId, `${kind.toUpperCase()}_DELETED`, kind === "window" ? "OpeningWindow" : "ServiceException", id);
  });
}

export async function saveZone(actorId: string, data: Prisma.DeliveryZoneUncheckedCreateInput & { id?: string }) {
  const { id, ...values } = data;
  const row = id ? await prisma.deliveryZone.update({ where: { id }, data: values }) : await prisma.deliveryZone.create({ data: values });
  await audit(prisma, actorId, id ? "DELIVERY_ZONE_UPDATED" : "DELIVERY_ZONE_CREATED", "DeliveryZone", row.id);
  return row;
}

export async function savePostalCode(actorId: string, data: Prisma.DeliveryZonePostalCodeUncheckedCreateInput & { id?: string }) {
  const { id, ...values } = data;
  const row = id ? await prisma.deliveryZonePostalCode.update({ where: { id }, data: values }) : await prisma.deliveryZonePostalCode.create({ data: values });
  await audit(prisma, actorId, id ? "POSTCODE_UPDATED" : "POSTCODE_CREATED", "DeliveryZonePostalCode", row.id);
  return row;
}

export async function deletePostalCode(actorId: string, id: string) {
  await prisma.$transaction(async (tx) => { await tx.deliveryZonePostalCode.delete({ where: { id } }); await audit(tx, actorId, "POSTCODE_DELETED", "DeliveryZonePostalCode", id); });
}

export async function saveSiteSettings(actorId: string, data: Prisma.SiteSettingsUpdateInput) {
  const row = await prisma.siteSettings.update({ where: { id: 1 }, data });
  await audit(prisma, actorId, "SITE_SETTINGS_UPDATED", "SiteSettings", "1");
  return row;
}

export async function savePromo(actorId: string, data: Prisma.PromoCodeUncheckedCreateInput & { id?: string }) {
  const { id, ...values } = data;
  const row = id ? await prisma.promoCode.update({ where: { id }, data: values }) : await prisma.promoCode.create({ data: values });
  await audit(prisma, actorId, id ? "PROMO_UPDATED" : "PROMO_CREATED", "PromoCode", row.id);
  return row;
}

export async function setStaffActive(actorId: string, staffId: string, active: boolean) {
  const row = await prisma.user.update({ where: { id: staffId, role: "STAFF" }, data: { active } });
  if (!active) await prisma.session.deleteMany({ where: { userId: staffId } });
  await audit(prisma, actorId, active ? "STAFF_REACTIVATED" : "STAFF_DEACTIVATED", "User", row.id);
  return row;
}

export async function cancelOrder(actorId: string, orderNumber: string, reason: string) {
  const id = parseOrderNumber(orderNumber);
  if (!id) throw new AdminError("ORDER_NOT_FOUND");
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id }, include: { payment: true } });
    if (!order) throw new AdminError("ORDER_NOT_FOUND");
    if (["COMPLETED", "CANCELLED"].includes(order.status)) throw new AdminError("CANCELLATION_NOT_ALLOWED");
    if (order.payment?.provider === "STRIPE" && ["PAID", "PARTIALLY_REFUNDED"].includes(order.payment.status)) throw new AdminError("OWNER_REFUND_REQUIRED");
    await tx.order.update({ where: { id }, data: { status: "CANCELLED", cancelledAt: new Date(), cancellationReason: reason, version: { increment: 1 } } });
    await tx.orderStatusEvent.create({ data: { orderId: id, actorUserId: actorId, fromStatus: order.status, toStatus: "CANCELLED", reason } });
    if (order.slotId) await tx.fulfillmentSlot.updateMany({ where: { id: order.slotId, bookedCount: { gt: 0 } }, data: { bookedCount: { decrement: 1 }, updatedAt: new Date() } });
    await audit(tx, actorId, "ORDER_CANCELLED", "Order", id.toString(), { reason });
  });
}

export async function refundOrder(actorId: string, input: { orderNumber: string; amountRappen: number; reason: string; refundKey: string; cancelOrder: boolean }) {
  const id = parseOrderNumber(input.orderNumber);
  if (!id) throw new AdminError("ORDER_NOT_FOUND");
  const [order, actor] = await Promise.all([
    prisma.order.findUnique({ where: { id }, include: { payment: true } }),
    prisma.user.findFirst({ where: { id: actorId, active: true, role: { in: ["OWNER", "STAFF"] } }, select: { role: true } }),
  ]);
  const payment = order?.payment;
  if (!order || !payment || !actor) throw new AdminError("ORDER_NOT_FOUND");
  if (payment.provider !== "STRIPE" || !payment.stripePaymentIntentId || !["PAID", "PARTIALLY_REFUNDED"].includes(payment.status)) throw new AdminError("REFUND_NOT_ALLOWED");
  const remaining = payment.amountRappen - payment.refundedRappen;
  if (input.amountRappen > remaining || (input.cancelOrder && input.amountRappen !== remaining)) throw new AdminError("REFUND_AMOUNT_INVALID");
  if (actor.role === "STAFF" && (!input.cancelOrder || input.amountRappen !== remaining)) throw new AdminError("FULL_REFUND_REQUIRED");
  if (input.cancelOrder && ["COMPLETED", "CANCELLED"].includes(order.status)) throw new AdminError("CANCELLATION_NOT_ALLOWED");

  const stripeRefund = await getStripe().refunds.create({ payment_intent: payment.stripePaymentIntentId, amount: input.amountRappen, metadata: { orderId: id.toString(), reason: input.reason, cancelOrder: String(input.cancelOrder), actorUserId: actorId } }, { idempotencyKey: input.refundKey });
  const refund = await prisma.$transaction(async (tx) => {
    const existing = await tx.refund.findUnique({ where: { stripeRefundId: stripeRefund.id } });
    if (existing) return existing;
    const failed = stripeRefund.status === "failed" || stripeRefund.status === "canceled";
    const created = await tx.refund.create({ data: { paymentId: payment.id, requestedByUserId: actorId, stripeRefundId: stripeRefund.id, amountRappen: input.amountRappen, reason: input.reason, status: failed ? "FAILED" : "PENDING", failureMessage: stripeRefund.failure_reason } });
    await audit(tx, actorId, "STRIPE_REFUND_REQUESTED", "Order", id.toString(), { amountRappen: input.amountRappen, reason: input.reason, stripeRefundId: stripeRefund.id });
    return created;
  });
  if (stripeRefund.status === "succeeded") {
    await settleSucceededRefund(stripeRefund.id, input.cancelOrder);
    return prisma.refund.findUniqueOrThrow({ where: { stripeRefundId: stripeRefund.id } });
  }
  return refund;
}

async function settleSucceededRefund(stripeRefundId: string, cancelOrder: boolean) {
  return prisma.$transaction(async (tx) => {
    const refund = await tx.refund.findUnique({ where: { stripeRefundId }, include: { payment: { include: { order: true } } } });
    if (!refund || refund.status === "FAILED") return;
    if (refund.status === "SUCCEEDED") return;
    const payment = refund.payment;
    const order = payment.order;
    const refundedRappen = Math.min(payment.amountRappen, payment.refundedRappen + refund.amountRappen);
    await tx.refund.update({ where: { id: refund.id }, data: { status: "SUCCEEDED", failureMessage: null } });
    await tx.payment.update({ where: { id: payment.id }, data: { refundedRappen, status: refundedRappen === payment.amountRappen ? "REFUNDED" : "PARTIALLY_REFUNDED" } });
    await tx.auditLog.create({ data: { actorUserId: refund.requestedByUserId, action: "STRIPE_REFUND_SUCCEEDED", entityType: "Order", entityId: order.id.toString(), metadata: { amountRappen: refund.amountRappen, stripeRefundId } } });
    if (cancelOrder && refundedRappen === payment.amountRappen && !["COMPLETED", "CANCELLED"].includes(order.status)) {
      await tx.order.update({ where: { id: order.id }, data: { status: "CANCELLED", cancelledAt: new Date(), cancellationReason: refund.reason, version: { increment: 1 } } });
      await tx.orderStatusEvent.create({ data: { orderId: order.id, actorUserId: refund.requestedByUserId, fromStatus: order.status, toStatus: "CANCELLED", reason: refund.reason } });
      if (order.slotId) await tx.fulfillmentSlot.updateMany({ where: { id: order.slotId, bookedCount: { gt: 0 } }, data: { bookedCount: { decrement: 1 }, updatedAt: new Date() } });
      await tx.auditLog.create({ data: { actorUserId: refund.requestedByUserId, action: "ORDER_CANCELLED_AFTER_REFUND", entityType: "Order", entityId: order.id.toString(), metadata: { stripeRefundId } } });
    }
  });
}

export async function syncStripeRefund(stripeRefund: Stripe.Refund) {
  const existing = await prisma.refund.findUnique({ where: { stripeRefundId: stripeRefund.id }, select: { id: true, status: true } });
  if (!existing) return;
  if (existing.status === "SUCCEEDED") return;
  if (stripeRefund.status === "succeeded") {
    await settleSucceededRefund(stripeRefund.id, stripeRefund.metadata?.cancelOrder === "true");
    return;
  }
  const failed = stripeRefund.status === "failed" || stripeRefund.status === "canceled";
  await prisma.refund.update({ where: { stripeRefundId: stripeRefund.id }, data: { status: failed ? "FAILED" : "PENDING", failureMessage: stripeRefund.failure_reason } });
}

export async function refundAndCancelOrder(actorId: string, orderNumber: string, reason: string, refundKey: string) {
  const id = parseOrderNumber(orderNumber);
  if (!id) throw new AdminError("ORDER_NOT_FOUND");
  const payment = await prisma.payment.findUnique({ where: { orderId: id }, select: { amountRappen: true, refundedRappen: true } });
  if (!payment) throw new AdminError("ORDER_NOT_FOUND");
  return refundOrder(actorId, { orderNumber, reason, refundKey, cancelOrder: true, amountRappen: payment.amountRappen - payment.refundedRappen });
}
