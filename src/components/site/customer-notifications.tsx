"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type OrderNotice = { orderNumber: string; status: string; updatedAt: string; estimatedReadyAt: string | null };

export function CustomerNotifications({ locale }: { locale: "de" | "en" }) {
  const [orders, setOrders] = useState<OrderNotice[]>([]);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(() => typeof window === "undefined" ? "" : localStorage.getItem("saltnpepper-notifications-seen-v1") ?? new Date().toISOString());
  const ref = useRef<HTMLDivElement>(null);
  const storageKey = "saltnpepper-notifications-seen-v1";
  const unread = orders.filter((order) => order.updatedAt > seen).length;
  useEffect(() => { let active = true; const load = async () => { const response = await fetch("/api/v1/customer/orders"); if (response.ok && active) setOrders((await response.json()).orders ?? []); }; load(); const timer = window.setInterval(load, 30_000); return () => { active = false; window.clearInterval(timer); }; }, []);
  useEffect(() => { const close = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false); }; document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close); }, []);
  function toggle() { const next = !open; setOpen(next); if (next) { const latest = orders[0]?.updatedAt ?? new Date().toISOString(); localStorage.setItem(storageKey, latest); setSeen(latest); } }
  return <div className="relative" ref={ref}><button type="button" onClick={toggle} className="relative grid size-10 place-items-center rounded-full border border-border bg-surface hover:bg-background" aria-label={locale === "de" ? "Bestellbenachrichtigungen" : "Order notifications"} aria-expanded={open}><Bell className="size-5" />{unread > 0 && <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">{Math.min(unread, 9)}</span>}</button>{open && <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"><div className="border-b border-border px-4 py-3 font-display font-bold">{locale === "de" ? "Bestellupdates" : "Order updates"}</div>{orders.length === 0 ? <p className="p-5 text-sm text-muted">{locale === "de" ? "Keine Updates verfügbar." : "No updates available."}</p> : <ul className="divide-y divide-border">{orders.slice(0, 5).map((order) => <li key={order.orderNumber} className="p-4"><div className="flex items-center justify-between gap-3"><div><strong className="block text-sm">{order.orderNumber}</strong><span className="text-xs text-muted">{order.status.replaceAll("_", " ")}{order.estimatedReadyAt ? ` · ${new Intl.DateTimeFormat(locale === "de" ? "de-CH" : "en-CH", { timeZone: "Europe/Zurich", hour: "2-digit", minute: "2-digit" }).format(new Date(order.estimatedReadyAt))}` : ""}</span></div><Link href={`/${locale}/order/${order.orderNumber}`} onClick={() => setOpen(false)} className="shrink-0 text-xs font-bold text-primary underline-offset-4 hover:underline">{locale === "de" ? "Details" : "View details"}</Link></div></li>)}</ul>}</div>}</div>;
}
