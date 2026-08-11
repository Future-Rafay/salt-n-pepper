import { randomUUID } from "node:crypto";
import { notFound } from "next/navigation";

import { AdminPage, Notice } from "@/components/admin/admin-ui";
import { CancelOrderDialog, RefundDialog } from "@/components/admin/danger-actions";
import { EtaEditor } from "@/components/admin/eta-editor";
import { Card } from "@/components/ui/card";
import { formatChf } from "@/lib/orders";
import { getCurrentUser } from "@/server/auth/current-user";
import { getAdminOrder } from "@/server/services/admin";

export default async function OrderDetailPage({ params, searchParams }: { params: Promise<{ orderNumber: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const [{ orderNumber }, feedback, user] = await Promise.all([params, searchParams, getCurrentUser()]);
  const order = await getAdminOrder(orderNumber);
  if (!order) notFound();
  const returnTo = `/admin/orders/${order.orderNumber}`;
  const canCancel = !["COMPLETED", "CANCELLED"].includes(order.status);
  return <AdminPage title={order.orderNumber} description={`${order.fulfillmentType.replaceAll("_", " ")} · placed ${new Date(order.createdAt).toLocaleString("en-CH", { timeZone: "Europe/Zurich" })}`}>
    <Notice {...feedback} />
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="lg:col-span-2"><h2 className="font-display text-xl font-semibold">Order</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2"><div><dt className="text-xs font-semibold uppercase text-muted">Customer</dt><dd>{order.customerName}<br /><a href={`mailto:${order.customerEmail}`}>{order.customerEmail}</a><br /><a href={`tel:${order.customerPhone}`}>{order.customerPhone}</a></dd></div><div><dt className="text-xs font-semibold uppercase text-muted">Status</dt><dd className="font-semibold">{order.status.replaceAll("_", " ")}</dd></div><div><dt className="text-xs font-semibold uppercase text-muted">Scheduled</dt><dd>{order.scheduledFor ? new Date(order.scheduledFor).toLocaleString("en-CH", { timeZone: "Europe/Zurich" }) : "ASAP"}</dd></div><div><dt className="text-xs font-semibold uppercase text-muted">Payment</dt><dd>{order.paymentMethod.replaceAll("_", " ")} · {order.payment?.status ?? "—"}</dd></div></dl>
        <div className="mt-5"><EtaEditor orderNumber={order.orderNumber} version={order.version} estimatedReadyAt={order.estimatedReadyAt} fulfillmentType={order.fulfillmentType} /></div>
        {order.address && <div className="mt-5 border-t pt-4"><h3 className="font-semibold">Delivery address</h3><p className="mt-1 text-sm">{order.address.recipientName}, {order.address.street} {order.address.streetExtra}, {order.address.postalCode} {order.address.city}</p></div>}
        <ul className="mt-5 space-y-3 border-t pt-4">{order.items.map((item) => <li key={item.id} className="flex justify-between gap-4"><span>{item.quantity}× {item.productNameEnSnapshot}<small className="block text-muted">{item.variantNameEnSnapshot}{item.options.length ? ` · ${item.options.map((option) => option.nameEnSnapshot).join(", ")}` : ""}</small></span><strong>{formatChf(item.lineSubtotalRappen, "en")}</strong></li>)}</ul>
        <dl className="mt-5 ml-auto max-w-xs space-y-2 border-t pt-4 text-sm"><div className="flex justify-between"><dt>Subtotal</dt><dd>{formatChf(order.subtotalRappen, "en")}</dd></div><div className="flex justify-between"><dt>Discount</dt><dd>−{formatChf(order.discountRappen, "en")}</dd></div><div className="flex justify-between"><dt>Delivery</dt><dd>{formatChf(order.deliveryFeeRappen, "en")}</dd></div><div className="flex justify-between text-base font-bold"><dt>Total</dt><dd>{formatChf(order.totalRappen, "en")}</dd></div></dl>
      </Card>
      <Card><h2 className="font-display text-xl font-semibold">Timeline</h2><ol className="mt-4 space-y-4">{order.statusEvents.map((event) => <li key={event.id} className="border-l-2 border-secondary pl-3"><strong>{event.toStatus.replaceAll("_", " ")}</strong><br /><span className="text-xs text-muted">{event.createdAt.toLocaleString("en-CH", { timeZone: "Europe/Zurich" })}{event.actor && ` · ${event.actor.name || event.actor.email}`}</span>{event.reason && <p className="text-sm">{event.reason}</p>}</li>)}</ol></Card>
    </div>
    <section className="mt-8 rounded-[var(--radius-card)] border border-destructive/40 bg-surface p-5" aria-labelledby="danger-zone"><h2 id="danger-zone" className="font-display text-xl font-semibold text-destructive">Danger zone</h2><p className="mt-1 text-sm text-muted">Cancellation and refunds are intentionally separated from routine status actions.</p><div className="mt-5 flex flex-wrap gap-3">{canCancel && !(order.payment?.provider === "STRIPE" && ["PAID", "PARTIALLY_REFUNDED"].includes(order.payment.status)) && <CancelOrderDialog orderNumber={order.orderNumber} returnTo={returnTo} />}{canCancel && order.remainingRefundableRappen > 0 && <RefundDialog orderNumber={order.orderNumber} remainingRappen={order.remainingRefundableRappen} refundKey={randomUUID()} returnTo={returnTo} fullRefundOnly={user?.role === "STAFF"} />}</div>{order.payment?.refunds.length ? <div className="mt-6 border-t pt-4"><h3 className="font-semibold">Refunds</h3><ul className="mt-3 space-y-2 text-sm">{order.payment.refunds.map((refund) => <li key={refund.id}>{formatChf(refund.amountRappen, "en")} · {refund.status} · {refund.reason}</li>)}</ul></div> : null}</section>
  </AdminPage>;
}
