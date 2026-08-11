"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ContactForm({ locale }: { locale: "de" | "en" }) {
  const de = locale === "de";
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const response = await fetch("/api/v1/public/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, locale }) }).catch(() => null);
    if (!response?.ok) {
      setStatus("error");
      return;
    }
    form.reset();
    setStatus("sent");
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2"><Label htmlFor="contact-name">{de ? "Name" : "Name"}</Label><Input id="contact-name" name="name" autoComplete="name" required minLength={2} /></div>
      <div className="space-y-2"><Label htmlFor="contact-email">Email</Label><Input id="contact-email" name="email" type="email" autoComplete="email" required /></div>
      <div className="space-y-2"><Label htmlFor="contact-phone">{de ? "Telefon (optional)" : "Phone (optional)"}</Label><Input id="contact-phone" name="phone" type="tel" autoComplete="tel" /></div>
      <div className="space-y-2"><Label htmlFor="contact-subject">{de ? "Betreff" : "Subject"}</Label><Input id="contact-subject" name="subject" required minLength={3} maxLength={160} /></div>
      <div className="hidden" aria-hidden="true"><Label htmlFor="contact-website">Website</Label><Input id="contact-website" name="website" tabIndex={-1} autoComplete="off" /></div>
      <div className="space-y-2 sm:col-span-2"><Label htmlFor="contact-message">{de ? "Nachricht" : "Message"}</Label><textarea id="contact-message" name="message" required minLength={10} maxLength={5000} rows={6} className="w-full rounded-[var(--radius-control)] border border-border bg-surface px-4 py-3 text-base focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20" /></div>
      <div className="flex flex-col items-start gap-3 sm:col-span-2 sm:flex-row sm:items-center">
        <Button type="submit" disabled={status === "sending"}><Send aria-hidden="true" className="size-4" />{status === "sending" ? (de ? "Wird gesendet…" : "Sending…") : (de ? "Nachricht senden" : "Send message")}</Button>
        <p role="status" aria-live="polite" className={`text-sm font-semibold ${status === "error" ? "text-destructive" : "text-emerald-700"}`}>{status === "sent" ? (de ? "Nachricht gesendet. Wir melden uns bald." : "Message sent. We will reply soon.") : status === "error" ? (de ? "Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut." : "The message could not be sent. Please try again.") : ""}</p>
      </div>
    </form>
  );
}
