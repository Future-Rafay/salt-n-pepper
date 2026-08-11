import { parseOrderNumber } from "@/lib/orders";
import { prisma } from "@/server/db";
import { OrderError } from "@/server/services/ordering";

export async function updateOrderEta(orderNumber: string, expectedVersion: number, estimatedReadyAt: string, actorUserId: string) {
  const id = parseOrderNumber(orderNumber);
  if (!id) throw new OrderError("ORDER_NOT_FOUND");
  const eta = new Date(estimatedReadyAt);
  if (Number.isNaN(eta.getTime())) throw new OrderError("INVALID_ETA");

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({ where: { id } });
    if (["COMPLETED", "CANCELLED"].includes(order.status)) throw new OrderError("ETA_NOT_ALLOWED");
    const result = await tx.order.updateMany({
      where: { id, version: expectedVersion },
      data: { estimatedReadyAt: eta, version: { increment: 1 }, updatedAt: new Date() },
    });
    if (result.count !== 1) throw new OrderError("ORDER_CHANGED");
    await tx.auditLog.create({
      data: { actorUserId, action: "ORDER_ETA_UPDATED", entityType: "Order", entityId: id.toString(), metadata: { estimatedReadyAt } },
    });
    const updated = await tx.order.findUniqueOrThrow({ where: { id }, select: { estimatedReadyAt: true, version: true } });
    return { estimatedReadyAt: updated.estimatedReadyAt?.toISOString() ?? null, version: updated.version };
  });
}
