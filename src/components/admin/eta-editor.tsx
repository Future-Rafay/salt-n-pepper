"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zurichDateToUtc, zurichParts } from "@/lib/zurich-time";

function timeValue(value: string | null) {
  const parts = zurichParts(value ? new Date(value) : new Date());
  return `${String(Math.floor(parts.minute / 60)).padStart(2, "0")}:${String(parts.minute % 60).padStart(2, "0")}`;
}

export function EtaEditor({ orderNumber, version, estimatedReadyAt, fulfillmentType }: { orderNumber: string; version: number; estimatedReadyAt: string | null; fulfillmentType: string }) {
  const router = useRouter();
  const [time, setTime] = useState(timeValue(estimatedReadyAt));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save(iso: string) {
    setBusy(true);
    setError("");
    const response = await fetch(`/api/v1/staff/orders/${orderNumber}/eta`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ version, estimatedReadyAt: iso }) });
    if (response.ok) router.refresh();
    else setError((await response.json()).error ?? "ETA update failed");
    setBusy(false);
  }

  function saveTime() {
    const source = estimatedReadyAt ? new Date(estimatedReadyAt) : new Date();
    const date = zurichParts(source).date;
    const [hour, minute] = time.split(":").map(Number);
    return save(zurichDateToUtc(date, hour * 60 + minute).toISOString());
  }

  function addMinutes(minutes: number) {
    const base = estimatedReadyAt ? new Date(estimatedReadyAt) : new Date();
    return save(new Date(base.getTime() + minutes * 60_000).toISOString());
  }

  return <div className="rounded-lg border bg-[#F6F6F7] p-3"><Label htmlFor={`eta-${orderNumber}`} className="text-xs">Estimated {fulfillmentType === "DELIVERY" ? "delivery" : "pickup"} time</Label><div className="mt-1 flex flex-wrap items-center gap-2"><Input id={`eta-${orderNumber}`} type="time" value={time} onChange={(event) => setTime(event.target.value)} className="h-9 w-32" /><Button type="button" size="compact" disabled={busy} onClick={saveTime}>Save time</Button><Button type="button" size="compact" variant="outline" disabled={busy} onClick={() => addMinutes(10)}>+10 min</Button><Button type="button" size="compact" variant="outline" disabled={busy} onClick={() => addMinutes(15)}>+15 min</Button></div>{error && <p role="alert" className="mt-2 text-xs font-semibold text-destructive">{error.replaceAll("_", " ")}</p>}</div>;
}
