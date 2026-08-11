import type Stripe from "stripe";

import { Prisma } from "@/generated/prisma/client";
import type { FulfillmentType, Locale, OrderStatus } from "@/generated/prisma/enums";
import { getStripeEnv } from "@/config/env";
import { allocateDiscount, assertOptionCount, formatOrderNumber, hashToken, nextOrderStatus, parseOrderNumber, promoDiscount, publicOrderAddress } from "@/lib/orders";
import { zurichDateToUtc, zurichParts } from "@/lib/zurich-time";
import { prisma } from "@/server/db";
import { sendEmail } from "@/server/email/client";
import { orderConfirmationEmail, orderStatusEmail } from "@/server/email/templates";
import { getStripe } from "@/server/payments/stripe";
import { resolvePublicImageUrl } from "@/server/storage/s3";
import { syncStripeRefund } from "@/server/services/admin";
import type { CreateOrderInput, QuoteInput } from "@/server/validators/order";

type Db = Prisma.TransactionClient | typeof prisma;

export class OrderError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

async function findPromo(db: Db, code?: string, email?: string, userId?: string) {
  if (!code) return null;
  const now = new Date();
  const promo = await db.promoCode.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!promo || !promo.active || (promo.startsAt && promo.startsAt > now) || (promo.endsAt && promo.endsAt < now)) {
    throw new OrderError("PROMO_INVALID");
  }
  const [totalUses, customerUses] = await Promise.all([
    promo.totalUsageLimit === null ? Promise.resolve(0) : db.promoRedemption.count({ where: { promoCodeId: promo.id } }),
    promo.perCustomerLimit === null || !email
      ? Promise.resolve(0)
      : db.promoRedemption.count({
          where: { promoCodeId: promo.id, OR: [{ customerEmail: email }, ...(userId ? [{ userId }] : [])] },
        }),
  ]);
  if (
    (promo.totalUsageLimit !== null && totalUses >= promo.totalUsageLimit) ||
    (promo.perCustomerLimit !== null && customerUses >= promo.perCustomerLimit)
  ) throw new OrderError("PROMO_LIMIT_REACHED");
  return promo;
}

export async function getDeliveryQuote(postcode: string, subtotalRappen: number, db: Db = prisma) {
  const match = await db.deliveryZonePostalCode.findUnique({
    where: { postalCode: postcode },
    include: { deliveryZone: true },
  });
  if (!match?.deliveryZone.active) throw new OrderError("POSTCODE_NOT_DELIVERABLE");
  const zone = match.deliveryZone;
  const remainingToMinimumRappen = Math.max(0, zone.minimumSubtotalRappen - subtotalRappen);
  return {
    zoneId: zone.id,
    nameDe: zone.nameDe,
    nameEn: zone.nameEn,
    deliveryFeeRappen:
      zone.freeDeliveryThresholdRappen !== null && subtotalRappen >= zone.freeDeliveryThresholdRappen ? 0 : zone.feeRappen,
    minimumSubtotalRappen: zone.minimumSubtotalRappen,
    remainingToMinimumRappen,
    freeDeliveryThresholdRappen: zone.freeDeliveryThresholdRappen,
    estimatedMinutes: zone.estimatedMinutes,
    eligible: remainingToMinimumRappen === 0,
  };
}

export async function calculateQuote(input: QuoteInput, db: Db = prisma, userId?: string) {
  const settings = await db.fulfillmentSettings.findUniqueOrThrow({ where: { id: 1 } });
  if (
    (input.fulfillmentType === "DELIVERY" && !settings.deliveryEnabled) ||
    (input.fulfillmentType === "PICKUP" && !settings.pickupEnabled)
  ) throw new OrderError("FULFILLMENT_DISABLED");
  if (
    (!input.scheduledFor && !settings.asapEnabled) ||
    (input.scheduledFor && !settings.scheduledEnabled)
  ) throw new OrderError("ORDER_TIMING_DISABLED");

  const variants = await db.productVariant.findMany({
    where: { id: { in: input.items.map((item) => item.variantId) }, active: true, deletedAt: null },
    include: {
      product: {
        include: {
          availabilityWindows: true,
          optionGroups: {
            where: { active: true, deletedAt: null },
            include: { choices: { where: { active: true, deletedAt: null } } },
          },
        },
      },
    },
  });
  const variantsById = new Map(variants.map((variant) => [variant.id, variant]));
  const local = zurichParts(input.scheduledFor ? new Date(input.scheduledFor) : new Date());
  const items = input.items.map((item) => {
    const variant = variantsById.get(item.variantId);
    if (!variant || !variant.product.active || variant.product.deletedAt || !variant.product.available) {
      throw new OrderError("PRODUCT_UNAVAILABLE");
    }
    if (
      variant.product.availabilityWindows.length > 0 &&
      !variant.product.availabilityWindows.some(
        (window) => window.weekday === local.weekday && local.minute >= window.startMinute && local.minute < window.endMinute,
      )
    ) throw new OrderError("PRODUCT_UNAVAILABLE_AT_TIME");

    const selectedIds = new Set(item.choiceIds);
    if (selectedIds.size !== item.choiceIds.length) throw new OrderError("DUPLICATE_OPTION");
    const choices = variant.product.optionGroups.flatMap((group) => {
      const selected = group.choices.filter((choice) => selectedIds.has(choice.id));
      if (!assertOptionCount(group, selected.length)) throw new OrderError("OPTION_SELECTION_INVALID");
      return selected;
    });
    if (choices.length !== selectedIds.size) throw new OrderError("OPTION_SELECTION_INVALID");
    const unitPriceRappen = variant.priceRappen + choices.reduce((sum, choice) => sum + choice.priceDeltaRappen, 0);
    return {
      productId: variant.product.id,
      variantId: variant.id,
      productNameDe: variant.product.nameDe,
      productNameEn: variant.product.nameEn,
      variantNameDe: variant.nameDe,
      variantNameEn: variant.nameEn,
      imageUrl: resolvePublicImageUrl(variant.product.imageKey),
      unitPriceRappen,
      quantity: item.quantity,
      lineSubtotalRappen: unitPriceRappen * item.quantity,
      choices: choices.map((choice) => ({
        id: choice.id,
        nameDe: choice.nameDe,
        nameEn: choice.nameEn,
        priceDeltaRappen: choice.priceDeltaRappen,
      })),
    };
  });

  const subtotalRappen = items.reduce((sum, item) => sum + item.lineSubtotalRappen, 0);
  const promo = await findPromo(db, input.promoCode, input.customerEmail, userId);
  const discountRappen = promoDiscount(subtotalRappen, promo);
  const delivery = input.fulfillmentType === "DELIVERY"
    ? await getDeliveryQuote(input.postcode ?? "", subtotalRappen, db)
    : null;
  if (delivery && !delivery.eligible) throw new OrderError("DELIVERY_MINIMUM_NOT_MET");
  const deliveryFeeRappen = delivery?.deliveryFeeRappen ?? 0;
  return {
    items,
    subtotalRappen,
    discountRappen,
    deliveryFeeRappen,
    totalRappen: Math.max(0, subtotalRappen - discountRappen) + deliveryFeeRappen,
    estimatedMinutes: delivery?.estimatedMinutes ?? settings.pickupPrepMinutes,
    promo,
    delivery,
  };
}

export async function getAvailableSlots(fulfillmentType: FulfillmentType, date: string) {
  const settings = await prisma.fulfillmentSettings.findUniqueOrThrow({ where: { id: 1 } });
  if (!settings.scheduledEnabled) return [];
  const weekday = zurichParts(zurichDateToUtc(date, 720)).weekday;
  const exception = await prisma.serviceException.findFirst({
    where: { date: new Date(`${date}T00:00:00.000Z`), fulfillmentType },
  });
  if (exception?.closed) return [];
  const windows = exception?.startMinute !== null && exception?.startMinute !== undefined
    ? [{ startMinute: exception.startMinute, endMinute: exception.endMinute ?? exception.startMinute }]
    : await prisma.openingWindow.findMany({ where: { fulfillmentType, weekday, active: true }, orderBy: { sortOrder: "asc" } });
  const earliest = new Date(Date.now() + settings.minimumLeadMinutes * 60_000);
  const latest = new Date(Date.now() + settings.maximumAdvanceDays * 86_400_000);
  const starts = windows.flatMap((window) => {
    const result: Date[] = [];
    for (let minute = window.startMinute; minute < window.endMinute; minute += settings.slotIntervalMinutes) {
      const start = zurichDateToUtc(date, minute);
      if (start >= earliest && start <= latest) result.push(start);
    }
    return result;
  });
  await Promise.all(starts.map((startsAt) => prisma.fulfillmentSlot.upsert({
    where: { fulfillmentType_startsAt: { fulfillmentType, startsAt } },
    create: { fulfillmentType, startsAt, capacity: settings.defaultSlotCapacity },
    update: {},
  })));
  const slots = await prisma.fulfillmentSlot.findMany({
    where: { fulfillmentType, startsAt: { in: starts }, closed: false },
    select: { id: true, startsAt: true, capacity: true, bookedCount: true },
    orderBy: { startsAt: "asc" },
  });
  return slots.filter((slot) => slot.bookedCount < slot.capacity);
}

type EmailContent = { subject: string; text: string; html: string };

async function sendOrderNotification(orderId: bigint, kind: string, email: string, message: EmailContent) {
  const deduplicationKey = `order:${orderId}:${kind}:email`;
  const delivery = await prisma.notificationDelivery.upsert({
    where: { deduplicationKey },
    create: { orderId, channel: "EMAIL", kind, recipient: email, deduplicationKey },
    update: {},
  });
  if (delivery.status === "SENT") return;
  try {
    const result = await sendEmail({ to: email, ...message });
    await prisma.notificationDelivery.update({
      where: { id: delivery.id },
      data: { status: "SENT", attemptCount: { increment: 1 }, providerId: result?.id, sentAt: new Date(), lastError: null },
    });
  } catch (error) {
    await prisma.notificationDelivery.update({
      where: { id: delivery.id },
      data: { status: "FAILED", attemptCount: { increment: 1 }, lastError: error instanceof Error ? error.message : "Email failed" },
    });
  }
}

function createdOrderDto(order: { id: bigint; status: OrderStatus; totalRappen: number }, trackingToken: string) {
  return { orderNumber: formatOrderNumber(order.id), status: order.status, totalRappen: order.totalRappen, trackingToken };
}

async function failPendingOrder(orderId: bigint) {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({ where: { id: orderId } });
    if (order.status !== "PAYMENT_PENDING") return;
    await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED", cancelledAt: new Date(), cancellationReason: "PAYMENT_SESSION_FAILED" },
    });
    await tx.payment.update({ where: { orderId }, data: { status: "FAILED", failedAt: new Date() } });
    if (order.slotId) {
      await tx.fulfillmentSlot.update({ where: { id: order.slotId }, data: { bookedCount: { decrement: 1 } } });
    }
  });
}

export async function createOrder(input: CreateOrderInput, userId?: string) {
  let stripeEnv: ReturnType<typeof getStripeEnv> | undefined;
  if (input.paymentMethod === "STRIPE") {
    try { stripeEnv = getStripeEnv(); } catch { throw new OrderError("PAYMENT_NOT_CONFIGURED"); }
  }
  const checkoutKeyHash = hashToken(input.checkoutKey);
  const existing = await prisma.order.findUnique({ where: { checkoutKeyHash }, include: { payment: true } });
  if (existing) return createdOrderDto(existing, input.checkoutKey);
  if (
    (input.fulfillmentType === "DELIVERY" && input.paymentMethod === "PAY_AT_PICKUP") ||
    (input.fulfillmentType === "PICKUP" && input.paymentMethod === "CASH_ON_DELIVERY") ||
    (input.fulfillmentType === "DELIVERY" && !input.address)
  ) throw new OrderError("PAYMENT_OR_ADDRESS_INVALID");

  const order = await prisma.$transaction(async (tx) => {
    const quote = await calculateQuote(input, tx, userId);
    let slotId: string | undefined;
    if (input.scheduledFor) {
      const startsAt = new Date(input.scheduledFor);
      const slot = await tx.fulfillmentSlot.findUnique({
        where: { fulfillmentType_startsAt: { fulfillmentType: input.fulfillmentType, startsAt } },
      });
      if (!slot || slot.closed) throw new OrderError("SLOT_UNAVAILABLE");
      const reservation = await tx.fulfillmentSlot.updateMany({
        where: { id: slot.id, closed: false, bookedCount: { lt: slot.capacity } },
        data: { bookedCount: { increment: 1 }, updatedAt: new Date() },
      });
      if (reservation.count !== 1) throw new OrderError("SLOT_FULL");
      slotId = slot.id;
    }
    const status: OrderStatus = input.paymentMethod === "STRIPE" ? "PAYMENT_PENDING" : "CONFIRMED";
    return tx.order.create({
      data: {
        checkoutKeyHash,
        guestTrackingTokenHash: userId ? null : checkoutKeyHash,
        userId,
        locale: input.locale.toUpperCase() as Locale,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        fulfillmentType: input.fulfillmentType,
        status,
        paymentMethod: input.paymentMethod,
        slotId,
        scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : null,
        estimatedReadyAt: input.scheduledFor
          ? new Date(input.scheduledFor)
          : new Date(Date.now() + quote.estimatedMinutes * 60_000),
        note: input.note,
        subtotalRappen: quote.subtotalRappen,
        discountRappen: quote.discountRappen,
        deliveryFeeRappen: quote.deliveryFeeRappen,
        totalRappen: quote.totalRappen,
        promoCodeId: quote.promo?.id,
        deliveryZoneId: quote.delivery?.zoneId,
        deliveryZoneNameDeSnapshot: quote.delivery?.nameDe,
        deliveryZoneNameEnSnapshot: quote.delivery?.nameEn,
        address: input.address ? { create: input.address } : undefined,
        items: {
          create: quote.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            productNameDeSnapshot: item.productNameDe,
            productNameEnSnapshot: item.productNameEn,
            variantNameDeSnapshot: item.variantNameDe,
            variantNameEnSnapshot: item.variantNameEn,
            unitPriceRappen: item.unitPriceRappen,
            quantity: item.quantity,
            lineSubtotalRappen: item.lineSubtotalRappen,
            options: {
              create: item.choices.map((choice) => ({
                optionChoiceId: choice.id,
                nameDeSnapshot: choice.nameDe,
                nameEnSnapshot: choice.nameEn,
                priceDeltaRappen: choice.priceDeltaRappen,
              })),
            },
          })),
        },
        payment: {
          create: {
            provider: input.paymentMethod === "STRIPE" ? "STRIPE" : "CASH",
            status: "PENDING",
            amountRappen: quote.totalRappen,
          },
        },
        statusEvents: { create: { toStatus: status, reason: "ORDER_CREATED" } },
        promoRedemption: quote.promo ? {
          create: {
            promoCodeId: quote.promo.id,
            userId,
            customerEmail: input.customerEmail,
            discountRappen: quote.discountRappen,
          },
        } : undefined,
      },
      include: { payment: true, items: { include: { options: true, product: { select: { imageKey: true } } } } },
    });
  }, { isolationLevel: "Serializable" });

  if (input.paymentMethod === "STRIPE") {
    try {
      const orderNumber = formatOrderNumber(order.id);
      const discountedTotals = allocateDiscount(order.items.map((item) => item.lineSubtotalRappen), order.discountRappen);
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = order.items.map((item, index) => {
        const options = item.options.map((option) => input.locale === "de" ? option.nameDeSnapshot : option.nameEnSnapshot);
        const imageUrl = resolvePublicImageUrl(item.product?.imageKey);
        const absoluteImageUrl = imageUrl && (imageUrl.startsWith("http") ? imageUrl : new URL(imageUrl, stripeEnv!.APP_URL).toString());
        return { quantity: 1, price_data: { currency: "chf", unit_amount: discountedTotals[index], product_data: {
          name: `${item.quantity}× ${input.locale === "de" ? item.productNameDeSnapshot : item.productNameEnSnapshot}`,
          description: [input.locale === "de" ? item.variantNameDeSnapshot : item.variantNameEnSnapshot, ...options].filter(Boolean).join(" · ") || undefined,
          images: absoluteImageUrl ? [absoluteImageUrl] : undefined,
        } } };
      });
      if (order.deliveryFeeRappen > 0) lineItems.push({ quantity: 1, price_data: { currency: "chf", unit_amount: order.deliveryFeeRappen, product_data: { name: input.locale === "de" ? "Liefergebühr" : "Delivery fee" } } });
      const session = await getStripe().checkout.sessions.create({
        mode: "payment",
        customer_email: order.customerEmail,
        line_items: lineItems,
        metadata: { orderId: order.id.toString(), orderNumber },
        success_url: `${stripeEnv!.APP_URL}/${input.locale}/order/${orderNumber}?token=${input.checkoutKey}`,
        cancel_url: `${stripeEnv!.APP_URL}/${input.locale}/checkout?cancelled=1`,
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      }, { idempotencyKey: input.checkoutKey });
      await prisma.payment.update({ where: { orderId: order.id }, data: { stripeCheckoutSessionId: session.id } });
      return { ...createdOrderDto(order, input.checkoutKey), checkoutUrl: session.url };
    } catch (error) {
      await failPendingOrder(order.id);
      throw error;
    }
  }

  await sendOrderNotification(
    order.id,
    "confirmed",
    order.customerEmail,
    orderConfirmationEmail({ orderNumber: formatOrderNumber(order.id) }),
  );
  return createdOrderDto(order, input.checkoutKey);
}

async function claimStripeEvent(event: Stripe.Event) {
  const replayAfter = new Date(Date.now() - 5 * 60 * 1000);
  const replay = await prisma.stripeWebhookEvent.updateMany({
    where: {
      eventId: event.id,
      OR: [{ status: "FAILED" }, { status: "PROCESSING", updatedAt: { lt: replayAfter } }],
    },
    data: { status: "PROCESSING", error: null, processedAt: null },
  });
  if (replay.count === 1) return true;

  try {
    await prisma.stripeWebhookEvent.create({ data: { eventId: event.id, type: event.type } });
    return true;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return false;
    throw error;
  }
}

export async function processStripeEvent(event: Stripe.Event) {
  if (!(await claimStripeEvent(event))) return;

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId ? BigInt(session.metadata.orderId) : null;
      if (!orderId || session.payment_status !== "paid") throw new OrderError("STRIPE_EVENT_INVALID");
      const order = await prisma.$transaction(async (tx) => {
        const current = await tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { payment: true } });
        if (
          current.payment?.provider !== "STRIPE"
          || current.payment.stripeCheckoutSessionId !== session.id
          || session.currency !== "chf"
          || session.amount_total !== current.payment.amountRappen
          || session.metadata?.orderNumber !== formatOrderNumber(current.id)
        ) {
          throw new OrderError("STRIPE_EVENT_INVALID");
        }
        if (current.status !== "PAYMENT_PENDING") return current;
        const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
        await tx.payment.update({
          where: { orderId },
          data: { status: "PAID", stripePaymentIntentId: paymentIntentId, paidAt: new Date() },
        });
        await tx.orderStatusEvent.create({
          data: { orderId, fromStatus: "PAYMENT_PENDING", toStatus: "CONFIRMED", reason: "STRIPE_PAID" },
        });
        return tx.order.update({ where: { id: orderId }, data: { status: "CONFIRMED", version: { increment: 1 } } });
      });
      await sendOrderNotification(
        order.id,
        "confirmed",
        order.customerEmail,
        orderConfirmationEmail({ orderNumber: formatOrderNumber(order.id) }),
      );
    } else if (event.type === "checkout.session.expired" && event.data.object.metadata?.orderId) {
      const orderId = BigInt(event.data.object.metadata.orderId);
      const payment = await prisma.payment.findUnique({ where: { orderId }, select: { stripeCheckoutSessionId: true } });
      if (payment?.stripeCheckoutSessionId !== event.data.object.id) throw new OrderError("STRIPE_EVENT_INVALID");
      await failPendingOrder(orderId);
    } else if (event.type === "refund.created" || event.type === "refund.updated" || event.type === "refund.failed") {
      await syncStripeRefund(event.data.object);
    }
    await prisma.stripeWebhookEvent.update({
      where: { eventId: event.id },
      data: { status: "PROCESSED", processedAt: new Date() },
    });
  } catch (error) {
    await prisma.stripeWebhookEvent.update({
      where: { eventId: event.id },
      data: { status: "FAILED", error: error instanceof Error ? error.message : "Webhook failed" },
    });
    throw error;
  }
}

const orderInclude = {
  items: { include: { options: true, product: { select: { imageKey: true } } } },
  address: true,
  payment: true,
  statusEvents: { orderBy: { createdAt: "asc" as const } },
} satisfies Prisma.OrderInclude;

function orderDto(order: Prisma.OrderGetPayload<{ include: typeof orderInclude }>) {
  return {
    orderNumber: formatOrderNumber(order.id),
    locale: order.locale.toLowerCase(),
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    fulfillmentType: order.fulfillmentType,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.payment?.status,
    scheduledFor: order.scheduledFor?.toISOString() ?? null,
    estimatedReadyAt: order.estimatedReadyAt?.toISOString() ?? null,
    note: order.note,
    subtotalRappen: order.subtotalRappen,
    discountRappen: order.discountRappen,
    deliveryFeeRappen: order.deliveryFeeRappen,
    totalRappen: order.totalRappen,
    version: order.version,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    address: publicOrderAddress(order.address),
    items: order.items.map((item) => ({
      id: item.id,
      name: order.locale === "DE" ? item.productNameDeSnapshot : item.productNameEnSnapshot,
      variant: order.locale === "DE" ? item.variantNameDeSnapshot : item.variantNameEnSnapshot,
      unitPriceRappen: item.unitPriceRappen,
      quantity: item.quantity,
      lineSubtotalRappen: item.lineSubtotalRappen,
      imageUrl: resolvePublicImageUrl(item.product?.imageKey),
      options: item.options.map((option) => order.locale === "DE" ? option.nameDeSnapshot : option.nameEnSnapshot),
    })),
    timeline: order.statusEvents.map((event) => ({ status: event.toStatus, at: event.createdAt.toISOString() })),
  };
}

export async function getTrackedOrder(orderNumber: string, userId?: string, token?: string) {
  const id = parseOrderNumber(orderNumber);
  if (!id) return null;
  const order = await prisma.order.findUnique({ where: { id }, include: orderInclude });
  if (!order || (order.userId !== userId && (!token || order.guestTrackingTokenHash !== hashToken(token)))) return null;
  return orderDto(order);
}

export async function getCustomerOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return orders.map(orderDto);
}

export async function getAdminOrders() {
  const orders = await prisma.order.findMany({
    where: { status: { in: ["PAYMENT_PENDING", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY"] } },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
  return orders.map((order) => ({ ...orderDto(order), allowedNextStatus: nextOrderStatus(order.status, order.fulfillmentType) }));
}

export async function advanceOrder(orderNumber: string, expectedVersion: number, actorUserId: string) {
  const id = parseOrderNumber(orderNumber);
  if (!id) throw new OrderError("ORDER_NOT_FOUND");
  const updated = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({ where: { id } });
    const next = nextOrderStatus(order.status, order.fulfillmentType);
    if (!next) throw new OrderError("TRANSITION_NOT_ALLOWED");
    const result = await tx.order.updateMany({
      where: { id, version: expectedVersion, status: order.status },
      data: { status: next, version: { increment: 1 }, ...(next === "COMPLETED" ? { completedAt: new Date() } : {}) },
    });
    if (result.count !== 1) throw new OrderError("ORDER_CHANGED");
    await tx.orderStatusEvent.create({
      data: { orderId: id, actorUserId, fromStatus: order.status, toStatus: next },
    });
    return tx.order.findUniqueOrThrow({ where: { id } });
  });
  await sendOrderNotification(
    updated.id,
    `status-${updated.status.toLowerCase()}`,
    updated.customerEmail,
    orderStatusEmail({ orderNumber: formatOrderNumber(updated.id), status: updated.status, locale: updated.locale }),
  );
  return { status: updated.status, version: updated.version };
}

export async function setProductAvailability(productId: string, available: boolean, actorUserId: string) {
  const product = await prisma.product.update({ where: { id: productId }, data: { available } });
  await prisma.auditLog.create({
    data: {
      actorUserId,
      action: available ? "PRODUCT_AVAILABLE" : "PRODUCT_SOLD_OUT",
      entityType: "Product",
      entityId: product.id,
    },
  });
  return { id: product.id, available: product.available };
}

export async function confirmCashPayment(orderNumber: string, actorUserId: string) {
  const id = parseOrderNumber(orderNumber);
  if (!id) throw new OrderError("ORDER_NOT_FOUND");
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUniqueOrThrow({ where: { orderId: id } });
    if (payment.provider !== "CASH" || payment.status !== "PENDING") {
      throw new OrderError("CASH_CONFIRMATION_NOT_ALLOWED");
    }
    await tx.payment.update({ where: { orderId: id }, data: { status: "PAID", paidAt: new Date() } });
    await tx.auditLog.create({
      data: { actorUserId, action: "CASH_PAYMENT_CONFIRMED", entityType: "Order", entityId: id.toString() },
    });
    return { paymentStatus: "PAID" as const };
  });
}
