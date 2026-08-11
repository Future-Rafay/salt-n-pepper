import type { OrderStatus } from "@/generated/prisma/enums";
import { prisma } from "@/server/db";
import { getAdminOrder, getOrderHistory } from "@/server/services/admin";
import { toJsonSafeValue } from "@/server/services/json-safe";
import { allowedOrderActions } from "@/server/services/staff-mobile-actions";

const activeStatuses: OrderStatus[] = ["PAYMENT_PENDING", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY"];

export async function getStaffContext() {
  const [site, fulfillment] = await Promise.all([
    prisma.siteSettings.findUniqueOrThrow({ where: { id: 1 }, select: { displayName: true, timezone: true, primaryColor: true, secondaryColor: true } }),
    prisma.fulfillmentSettings.findUniqueOrThrow({ where: { id: 1 } }),
  ]);
  return {
    site,
    fulfillment: {
      deliveryEnabled: fulfillment.deliveryEnabled,
      pickupEnabled: fulfillment.pickupEnabled,
      asapEnabled: fulfillment.asapEnabled,
      scheduledEnabled: fulfillment.scheduledEnabled,
    },
    activeStatuses,
    pollSeconds: 10,
  };
}

export async function getStaffOrders(status?: string) {
  const orders = await getOrderHistory(status);
  return orders
    .filter((order) => status || activeStatuses.includes(order.status))
    .map((order) => toJsonSafeValue({ ...order, allowedActions: allowedOrderActions(order) }));
}

export async function getStaffOrder(orderNumber: string) {
  const order = await getAdminOrder(orderNumber);
  return order ? toJsonSafeValue({ ...order, allowedActions: allowedOrderActions(order) }) : null;
}
