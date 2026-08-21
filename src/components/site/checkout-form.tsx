"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";

import { useCart } from "@/components/site/cart-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMoney } from "@/lib/orders";

type Quote = {
  subtotalRappen: number;
  discountRappen: number;
  deliveryFeeRappen: number;
  totalRappen: number;
  estimatedMinutes: number;
  promoCode: string | null;
  promoMinimumSubtotalRappen: number | null;
};
type Slot = {
  id: string;
  startsAt: string;
  capacity: number;
  bookedCount: number;
};
type ApiError = {
  error: string;
  details?: Array<{ path: PropertyKey[] }>;
};
type FieldErrors = Partial<Record<string, string>>;

const messages: Record<string, { de: string; en: string }> = {
  POSTCODE_NOT_DELIVERABLE: {
    de: "An diese Postleitzahl liefern wir derzeit nicht.",
    en: "We do not currently deliver to this postcode.",
  },
  DELIVERY_MINIMUM_NOT_MET: {
    de: "Der Mindestbestellwert ist noch nicht erreicht.",
    en: "The delivery minimum has not been reached.",
  },
  PRODUCT_UNAVAILABLE: {
    de: "Ein Artikel ist nicht mehr verfügbar.",
    en: "An item is no longer available.",
  },
  PRODUCT_UNAVAILABLE_AT_TIME: {
    de: "Ein Artikel ist zur gewählten Zeit nicht verfügbar.",
    en: "An item is unavailable at the selected time.",
  },
  PROMO_INVALID: {
    de: "Dieser Gutscheincode ist ungültig.",
    en: "This promo code is invalid.",
  },
  PROMO_LIMIT_REACHED: {
    de: "Dieser Gutschein kann nicht mehr verwendet werden.",
    en: "This promo code can no longer be used.",
  },
  SLOT_FULL: {
    de: "Dieser Termin ist inzwischen ausgebucht.",
    en: "That slot has just filled up.",
  },
  INVALID_INPUT: {
    de: "Bitte prüfen Sie Ihre Eingaben.",
    en: "Please check your details.",
  },
  PAYMENT_NOT_CONFIGURED: {
    de: "Kartenzahlung ist noch nicht konfiguriert.",
    en: "Card payment is not configured yet.",
  },
  FULFILLMENT_DISABLED: {
    de: "Diese Bestellart ist derzeit nicht verfügbar.",
    en: "This fulfillment option is currently unavailable.",
  },
  ORDER_TIMING_DISABLED: {
    de: "Der gewählte Bestellzeitpunkt ist derzeit nicht verfügbar.",
    en: "The selected order timing is currently unavailable.",
  },
  DUPLICATE_OPTION: {
    de: "Eine Produktauswahl wurde mehrfach gewählt.",
    en: "A product option was selected more than once.",
  },
  OPTION_SELECTION_INVALID: {
    de: "Bitte prüfen Sie die gewählten Produktoptionen.",
    en: "Please check the selected product options.",
  },
  SLOT_UNAVAILABLE: {
    de: "Dieser Termin ist nicht mehr verfügbar. Bitte wählen Sie einen anderen.",
    en: "That slot is no longer available. Please choose another.",
  },
  PAYMENT_OR_ADDRESS_INVALID: {
    de: "Zahlungsart oder Lieferadresse passt nicht zur gewählten Bestellart.",
    en: "The payment method or delivery address does not match the fulfillment option.",
  },
  FORBIDDEN: {
    de: "Bitte melden Sie sich erneut an, um die Bestellung abzuschliessen.",
    en: "Please sign in again to complete your order.",
  },
  NETWORK_ERROR: {
    de: "Die Verbindung ist fehlgeschlagen. Bitte versuchen Sie es erneut.",
    en: "The connection failed. Please try again.",
  },
};

const fieldByPath: Record<string, string> = {
  postcode: "postalCode",
  customerName: "customerName",
  customerEmail: "customerEmail",
  customerPhone: "customerPhone",
  promoCode: "promoCode",
  scheduledFor: "slot",
  "address.recipientName": "customerName",
  "address.phone": "customerPhone",
  "address.street": "street",
  "address.streetExtra": "streetExtra",
  "address.postalCode": "postalCode",
  "address.city": "city",
};

export function CheckoutForm({
  locale,
  user,
}: {
  locale: "de" | "en";
  user?: { name?: string | null; email?: string | null };
}) {
  const { items, clear } = useCart();
  const de = locale === "de";
  const [fulfillmentType, setFulfillmentType] = useState<"DELIVERY" | "PICKUP">(
    "PICKUP",
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "STRIPE" | "CASH_ON_DELIVERY" | "PAY_AT_PICKUP"
  >("PAY_AT_PICKUP");
  const [timing, setTiming] = useState<"ASAP" | "SCHEDULED">("ASAP");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [scheduledFor, setScheduledFor] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsFailed, setSlotsFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (timing !== "SCHEDULED" || !date) return;
    let current = true;
    fetch(
      `/api/v1/public/slots?fulfillmentType=${fulfillmentType}&date=${date}`,
    )
      .then(async (response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((data) => current && setSlots(data.slots ?? []))
      .catch(() => current && setSlotsFailed(true))
      .finally(() => current && setSlotsLoading(false));
    return () => {
      current = false;
    };
  }, [date, fulfillmentType, timing]);

  const cartPayload = items.map(({ variantId, choiceIds, quantity }) => ({
    variantId,
    choiceIds,
    quantity,
  }));
  const showError = (code: string) =>
    setError(
      messages[code]?.[locale] ??
        (de ? "Etwas ist schiefgelaufen." : "Something went wrong."),
    );
  const fieldMessage = (field: string) => {
    const labels: Record<string, { de: string; en: string }> = {
      postalCode: {
        de: "Bitte geben Sie eine gültige Postleitzahl ein.",
        en: "Enter a valid postal code.",
      },
      customerName: {
        de: "Bitte geben Sie Ihren Namen ein.",
        en: "Enter your name.",
      },
      customerEmail: {
        de: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
        en: "Enter a valid email address.",
      },
      customerPhone: {
        de: "Bitte geben Sie eine gültige Telefonnummer ein.",
        en: "Enter a valid phone number.",
      },
      street: {
        de: "Bitte geben Sie Strasse und Hausnummer ein.",
        en: "Enter the street and house number.",
      },
      streetExtra: {
        de: "Bitte prüfen Sie den Adresszusatz.",
        en: "Check the address extra.",
      },
      city: { de: "Bitte geben Sie den Ort ein.", en: "Enter the city." },
      promoCode: {
        de: "Bitte prüfen Sie den Gutscheincode.",
        en: "Check the promo code.",
      },
      slot: {
        de: "Bitte wählen Sie einen verfügbaren Termin.",
        en: "Choose an available time slot.",
      },
    };
    return labels[field]?.[locale] ?? messages.INVALID_INPUT[locale];
  };
  const focusField = (field: string) =>
    requestAnimationFrame(() => document.getElementById(field)?.focus());
  const showApiError = (caught: unknown) => {
    const apiError =
      typeof caught === "object" &&
      caught !== null &&
      "error" in caught &&
      typeof caught.error === "string"
        ? (caught as ApiError)
        : null;
    const nextErrors: FieldErrors = {};
    const codeField =
      apiError?.error === "POSTCODE_NOT_DELIVERABLE"
        ? "postalCode"
        : apiError?.error === "PROMO_INVALID" ||
            apiError?.error === "PROMO_LIMIT_REACHED"
          ? "promoCode"
          : null;
    if (codeField && apiError)
      nextErrors[codeField] = messages[apiError.error][locale];
    for (const issue of apiError?.details ?? []) {
      const field = fieldByPath[issue.path.join(".")];
      if (field) nextErrors[field] = fieldMessage(field);
    }
    setFieldErrors(nextErrors);
    const firstField = Object.keys(nextErrors)[0];
    if (firstField) {
      setError("");
      focusField(firstField);
    } else {
      showError(apiError?.error ?? "NETWORK_ERROR");
    }
  };

  async function requestQuote(form: HTMLFormElement) {
    const data = new FormData(form);
    const response = await fetch("/api/v1/customer/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cartPayload,
        fulfillmentType,
        scheduledFor:
          timing === "SCHEDULED" && scheduledFor ? scheduledFor : null,
        postcode:
          fulfillmentType === "DELIVERY" ? data.get("postalCode") : undefined,
        promoCode: data.get("promoCode") || undefined,
        customerEmail: data.get("customerEmail") || undefined,
      }),
    });
    const result = await response.json();
    if (!response.ok) throw result as ApiError;
    setQuote(result);
    return result as Quote;
  }

  async function applyPromo(form: HTMLFormElement) {
    setError("");
    setFieldErrors({});
    setBusy(true);
    try {
      await requestQuote(form);
    } catch (caught) {
      showApiError(caught);
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (items.length === 0) return showError("INVALID_INPUT");
    if (timing === "SCHEDULED" && !scheduledFor) {
      setFieldErrors({ slot: fieldMessage("slot") });
      focusField("slot");
      return;
    }
    setBusy(true);
    setError("");
    setFieldErrors({});
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      await requestQuote(form);
      const address =
        fulfillmentType === "DELIVERY"
          ? {
              recipientName: data.get("customerName"),
              phone: data.get("customerPhone"),
              street: data.get("street"),
              streetExtra: data.get("streetExtra") || undefined,
              postalCode: data.get("postalCode"),
              city: data.get("city"),
            }
          : undefined;
      const response = await fetch("/api/v1/customer/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkoutKey: crypto.randomUUID(),
          locale,
          items: cartPayload,
          fulfillmentType,
          scheduledFor:
            timing === "SCHEDULED" && scheduledFor ? scheduledFor : null,
          postcode:
            fulfillmentType === "DELIVERY" ? data.get("postalCode") : undefined,
          promoCode: data.get("promoCode") || undefined,
          customerName: data.get("customerName"),
          customerEmail: data.get("customerEmail"),
          customerPhone: data.get("customerPhone"),
          paymentMethod,
          note: data.get("note") || undefined,
          address,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw result as ApiError;
      clear();
      window.location.assign(
        result.checkoutUrl ??
          `/${locale}/order/${result.orderNumber}?token=${result.trackingToken}`,
      );
    } catch (caught) {
      showApiError(caught);
      setBusy(false);
    }
  }

  if (items.length === 0)
    return (
      <Card className="p-8 text-center">
        <p>{de ? "Ihr Warenkorb ist leer." : "Your cart is empty."}</p>
      </Card>
    );

  return (
    <form
      onSubmit={submit}
      onInput={(event) => {
        const field = (event.target as HTMLElement).id;
        if (fieldErrors[field])
          setFieldErrors((current) => ({ ...current, [field]: undefined }));
      }}
      className="grid gap-8 lg:grid-cols-[1fr_22rem]"
    >
      <div className="space-y-6">
        {/* Step 1: Fulfillment Type */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-border/60 pb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              1
            </span>
            <h2 className="font-display text-xl font-bold text-primary">
              {de ? "Abholung oder Lieferung" : "Pickup or Delivery"}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label
              className={`flex min-h-16 cursor-pointer items-center justify-center gap-3 rounded-xl border p-4 text-center font-bold transition-all ${
                fulfillmentType === "PICKUP"
                  ? "border-secondary bg-secondary/10 text-primary shadow-sm"
                  : "border-border hover:bg-background text-muted"
              }`}
            >
              <input
                type="radio"
                name="fulfillment"
                className="sr-only"
                checked={fulfillmentType === "PICKUP"}
                onChange={() => {
                  setFulfillmentType("PICKUP");
                  setPaymentMethod("PAY_AT_PICKUP");
                  setScheduledFor("");
                  setSlots([]);
                  setSlotsFailed(false);
                  setSlotsLoading(timing === "SCHEDULED" && Boolean(date));
                  setQuote(null);
                }}
              />
              <svg
                className="h-6 w-6 text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span>{de ? "Abholung" : "Pickup"}</span>
            </label>

            <label
              className={`flex min-h-16 cursor-pointer items-center justify-center gap-3 rounded-xl border p-4 text-center font-bold transition-all ${
                fulfillmentType === "DELIVERY"
                  ? "border-secondary bg-secondary/10 text-primary shadow-sm"
                  : "border-border hover:bg-background text-muted"
              }`}
            >
              <input
                type="radio"
                name="fulfillment"
                className="sr-only"
                checked={fulfillmentType === "DELIVERY"}
                onChange={() => {
                  setFulfillmentType("DELIVERY");
                  setPaymentMethod("CASH_ON_DELIVERY");
                  setScheduledFor("");
                  setSlots([]);
                  setSlotsFailed(false);
                  setSlotsLoading(timing === "SCHEDULED" && Boolean(date));
                  setQuote(null);
                }}
              />
              <svg
                className="h-6 w-6 text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 102 0 1 1 0 00-2 0zm-7 0a1 1 0 102 0 1 1 0 00-2 0z"
                />
              </svg>
              <span>{de ? "Lieferung" : "Delivery"}</span>
            </label>
          </div>
        </Card>

        {/* Step 2: Time Selection */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-border/60 pb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              2
            </span>
            <h2 className="font-display text-xl font-bold text-primary">
              {de ? "Bestellzeitpunkt" : "Time"}
            </h2>
          </div>

          <div className="flex gap-4">
            <label className="flex min-h-11 items-center gap-2 cursor-pointer font-semibold text-sm">
              <input
                type="radio"
                checked={timing === "ASAP"}
                onChange={() => {
                  setTiming("ASAP");
                  setScheduledFor("");
                  setSlots([]);
                  setSlotsFailed(false);
                  setSlotsLoading(false);
                }}
                className="h-4 w-4 accent-secondary"
              />
              <span>
                {de
                  ? "So schnell wie möglich (ASAP)"
                  : "As soon as possible (ASAP)"}
              </span>
            </label>
            <label className="flex min-h-11 items-center gap-2 cursor-pointer font-semibold text-sm">
              <input
                type="radio"
                checked={timing === "SCHEDULED"}
                onChange={() => {
                  setTiming("SCHEDULED");
                  setSlotsFailed(false);
                  setSlotsLoading(Boolean(date));
                }}
                className="h-4 w-4 accent-secondary"
              />
              <span>
                {de ? "Vorbestellen (Geplant)" : "Pre-order (Scheduled)"}
              </span>
            </label>
          </div>

          {timing === "SCHEDULED" && (
            <div className="grid gap-4 sm:grid-cols-2 pt-2 animate-fade-in">
              <div>
                <Label htmlFor="slot-date">{de ? "Datum" : "Date"}</Label>
                <Input
                  id="slot-date"
                  type="date"
                  value={date}
                  onChange={(event) => {
                    setDate(event.target.value);
                    setScheduledFor("");
                    setSlots([]);
                    setSlotsFailed(false);
                    setSlotsLoading(Boolean(event.target.value));
                  }}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="slot">{de ? "Zeitfenster" : "Time slot"}</Label>
                <select
                  id="slot"
                  className="mt-1 min-h-11 w-full rounded-xl border border-border bg-surface px-4 text-base focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none"
                  value={scheduledFor}
                  onChange={(event) => {
                    setScheduledFor(event.target.value);
                    setFieldErrors((current) => ({
                      ...current,
                      slot: undefined,
                    }));
                  }}
                  required
                  aria-invalid={Boolean(fieldErrors.slot)}
                  aria-describedby={
                    fieldErrors.slot
                      ? "slot-error"
                      : slotsFailed
                        ? "slot-load-error"
                        : undefined
                  }
                >
                  <option value="">
                    {de ? "Bitte wählen" : "Choose slot"}
                  </option>
                  {slots.map((slot) => (
                    <option key={slot.id} value={slot.startsAt}>
                      {new Intl.DateTimeFormat(de ? "de-CH" : "en-CH", {
                        timeZone: "Europe/Zurich",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(slot.startsAt))}
                    </option>
                  ))}
                </select>
                {fieldErrors.slot && (
                  <p
                    id="slot-error"
                    className="mt-1 text-xs font-semibold text-destructive"
                    role="alert"
                  >
                    {fieldErrors.slot}
                  </p>
                )}
                {slotsLoading && (
                  <p className="mt-1 text-xs text-muted" role="status">
                    {de ? "Termine werden geladen..." : "Loading slots..."}
                  </p>
                )}
                {slotsFailed && (
                  <p
                    id="slot-load-error"
                    className="mt-1 text-xs font-semibold text-destructive"
                    role="alert"
                  >
                    {de
                      ? "Termine konnten nicht geladen werden. Bitte versuchen Sie es erneut."
                      : "Slots could not be loaded. Please try again."}
                  </p>
                )}
                {date &&
                  !slotsLoading &&
                  !slotsFailed &&
                  slots.length === 0 && (
                    <p className="mt-1 text-xs text-muted" role="status">
                      {de
                        ? "Für dieses Datum sind keine Termine verfügbar."
                        : "No slots are available for this date."}
                    </p>
                  )}
              </div>
            </div>
          )}
        </Card>

        {/* Step 3: Contact & Address */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-border/60 pb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              3
            </span>
            <h2 className="font-display text-xl font-bold text-primary">
              {de ? "Kontaktdaten & Adresse" : "Contact & Address"}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="customerName"
              label={de ? "Name" : "Name"}
              defaultValue={user?.name ?? ""}
              autoComplete="name"
              error={fieldErrors.customerName}
            />
            <Field
              id="customerEmail"
              label="Email"
              type="email"
              defaultValue={user?.email ?? ""}
              autoComplete="email"
              error={fieldErrors.customerEmail}
            />
            <Field
              id="customerPhone"
              label={de ? "Telefonnummer" : "Phone number"}
              type="tel"
              autoComplete="tel"
              error={fieldErrors.customerPhone}
            />
          </div>

          {fulfillmentType === "DELIVERY" && (
            <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-border/60 animate-fade-in">
              <Field
                id="street"
                label={
                  de ? "Strasse und Hausnummer" : "Street and house number"
                }
                autoComplete="street-address"
                error={fieldErrors.street}
              />
              <Field
                id="streetExtra"
                label={
                  de ? "Adresszusatz (optional)" : "Address extra (optional)"
                }
                required={false}
                error={fieldErrors.streetExtra}
              />
              <Field
                id="postalCode"
                label={de ? "Postleitzahl" : "Postal code"}
                maxLength={16}
                autoComplete="postal-code"
                error={fieldErrors.postalCode}
              />
              <Field
                id="city"
                label={de ? "Ort" : "City"}
                autoComplete="address-level2"
                error={fieldErrors.city}
              />
            </div>
          )}

          <div className="pt-2">
            <Label htmlFor="note">
              {de
                ? "Anmerkung zur Bestellung (optional)"
                : "Order Note (optional)"}
            </Label>
            <textarea
              id="note"
              name="note"
              maxLength={1000}
              placeholder={
                de
                  ? "z.B. Bitte nicht scharf würzen..."
                  : "e.g. Please extra mild..."
              }
              className="mt-1 min-h-24 w-full rounded-xl border border-border bg-surface p-3 text-sm focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none"
            />
          </div>
        </Card>

        {/* Step 4: Payment Method */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-border/60 pb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              4
            </span>
            <h2 className="font-display text-xl font-bold text-primary">
              {de ? "Zahlungsmethode" : "Payment Method"}
            </h2>
          </div>

          <div className="space-y-3">
            <label
              className={`flex min-h-14 cursor-pointer items-center justify-between rounded-xl border p-4 font-semibold transition-all ${
                paymentMethod === "STRIPE"
                  ? "border-secondary bg-secondary/10 text-primary"
                  : "border-border hover:bg-background"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  checked={paymentMethod === "STRIPE"}
                  onChange={() => setPaymentMethod("STRIPE")}
                  className="h-4 w-4 accent-secondary"
                />
                <span>
                  {de
                    ? "Kreditkarte / Online-Zahlung (Stripe)"
                    : "Credit Card / Online Payment (Stripe)"}
                </span>
              </div>
              <span className="text-xs text-muted font-normal">
                Visa, Mastercard
              </span>
            </label>

            <label
              className={`flex min-h-14 cursor-pointer items-center justify-between rounded-xl border p-4 font-semibold transition-all ${
                paymentMethod !== "STRIPE"
                  ? "border-secondary bg-secondary/10 text-primary"
                  : "border-border hover:bg-background"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  checked={paymentMethod !== "STRIPE"}
                  onChange={() =>
                    setPaymentMethod(
                      fulfillmentType === "PICKUP"
                        ? "PAY_AT_PICKUP"
                        : "CASH_ON_DELIVERY",
                    )
                  }
                  className="h-4 w-4 accent-secondary"
                />
                <span>
                  {fulfillmentType === "PICKUP"
                    ? de
                      ? "Bar bei Abholung"
                      : "Cash at pickup"
                    : de
                      ? "Barzahlung bei Lieferung"
                      : "Cash on delivery"}
                </span>
              </div>
              <span className="text-xs text-muted font-normal">
                 {de ? "Vor Ort" : "In person"}
              </span>
            </label>
          </div>
        </Card>
      </div>

      {/* Order Summary & Submit Side Column */}
      <aside>
        <Card className="sticky top-24 p-6 space-y-6 border-secondary/30 bg-surface shadow-xl">
          <h2 className="font-display text-xl font-bold text-primary border-b border-border/60 pb-3">
            {de ? "Bestellübersicht" : "Order Summary"}
          </h2>

          <ul className="space-y-3 text-sm divide-y divide-border/40">
            {items.map((item) => (
              <li key={item.key} className="flex gap-3 pt-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-background">
                  <Image
                    src={
                      item.imageUrl ?? "/images/editorial/restaurant-table.jpg"
                    }
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <span className="font-semibold text-foreground">
                    {item.quantity}× {item.productName}
                  </span>
                  <span className="block text-xs text-muted">
                    {item.variantName}
                  </span>
                  {item.choiceNames && item.choiceNames.length > 0 && (
                    <span className="block text-xs text-muted">
                      {item.choiceNames.join(", ")}
                    </span>
                  )}
                </div>
                <strong className="shrink-0 font-bold text-primary">
                  {formatMoney(item.unitPriceRappen * item.quantity, locale)}
                </strong>
              </li>
            ))}
          </ul>

          <div className="pt-2 border-t border-border/60">
            <Label
              htmlFor="promoCode"
              className="text-xs uppercase tracking-wider text-muted"
            >
              {de ? "Gutscheincode" : "Promo Code"}
            </Label>
            <div className="mt-1 flex gap-2">
              <Input
                id="promoCode"
                name="promoCode"
                maxLength={64}
                placeholder="WELCOME10"
                className="uppercase font-mono text-sm"
                aria-invalid={Boolean(fieldErrors.promoCode)}
                aria-describedby={
                  fieldErrors.promoCode ? "promoCode-error" : undefined
                }
              />
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={(event) =>
                  event.currentTarget.form &&
                  applyPromo(event.currentTarget.form)
                }
              >
                {de ? "Anwenden" : "Apply Coupon"}
              </Button>
            </div>
            {fieldErrors.promoCode && (
              <p
                id="promoCode-error"
                className="mt-1 text-xs font-semibold text-destructive"
                role="alert"
              >
                {fieldErrors.promoCode}
              </p>
            )}
          </div>

          {quote && (
            <dl className="space-y-2 border-t border-border/80 pt-4 text-sm">
              <div className="flex justify-between text-muted">
                <dt>{de ? "Zwischensumme" : "Subtotal"}</dt>
                <dd className="font-semibold text-foreground">
                  {formatMoney(quote.subtotalRappen, locale)}
                </dd>
              </div>
              {quote.discountRappen > 0 && (
                <div className="flex justify-between text-success font-semibold">
                  <dt>{de ? "Rabatt" : "Discount"}</dt>
                  <dd>- {formatMoney(quote.discountRappen, locale)}</dd>
                </div>
              )}
              {fulfillmentType === "DELIVERY" && (
                <div className="flex justify-between text-muted">
                  <dt>{de ? "Liefergebühr" : "Delivery fee"}</dt>
                  <dd className="font-semibold text-foreground">
                    {quote.deliveryFeeRappen
                      ? formatMoney(quote.deliveryFeeRappen, locale)
                      : de
                        ? "Kostenlos"
                        : "Free"}
                  </dd>
                </div>
              )}
              <div className="flex justify-between text-muted">
                <dt>
                  {timing === "SCHEDULED"
                    ? de
                      ? "Geplant für"
                      : "Scheduled for"
                    : fulfillmentType === "DELIVERY"
                    ? de
                      ? "Erwartete Lieferung"
                      : "Expected delivery"
                    : de
                      ? "Abholbereit in"
                      : "Ready for pickup"}
                </dt>
                <dd className="font-semibold text-foreground">
                  {timing === "SCHEDULED" && scheduledFor
                    ? new Intl.DateTimeFormat(de ? "de-CH" : "en-CH", {
                        timeZone: "Europe/Zurich",
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(scheduledFor))
                    : `~${quote.estimatedMinutes} min`}
                </dd>
              </div>
              {quote.promoCode && (
                <div className="flex justify-between text-success">
                  <dt>{de ? "Gutschein" : "Coupon"}</dt>
                  <dd className="font-mono font-semibold">{quote.promoCode}</dd>
                </div>
              )}
              {quote.promoCode &&
                quote.discountRappen === 0 &&
                quote.promoMinimumSubtotalRappen &&
                quote.subtotalRappen < quote.promoMinimumSubtotalRappen && (
                  <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-900">
                    {de
                      ? `Noch ${formatMoney(quote.promoMinimumSubtotalRappen - quote.subtotalRappen, locale)} bis zum Mindestbetrag.`
                      : `Add ${formatMoney(quote.promoMinimumSubtotalRappen - quote.subtotalRappen, locale)} to reach the coupon minimum.`}
                  </p>
                )}
              <div className="flex justify-between border-t border-border/80 pt-3 text-xl font-bold text-primary">
                <dt>Total</dt>
                <dd className="font-display">
                  {formatMoney(quote.totalRappen, locale)}
                </dd>
              </div>
            </dl>
          )}

          {error && (
            <div
              className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs font-semibold text-destructive animate-fade-in"
              role="alert"
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="default"
            className="w-full text-base py-3"
            disabled={busy}
          >
            {busy
              ? de
                ? "Wird verarbeitet..."
                : "Processing..."
              : de
                ? "Bestellung aufgeben"
                : "Place Order"}
          </Button>

          <p className="text-center text-[11px] leading-relaxed text-muted">
            {de
              ? "Preise, Verfügbarkeit & Zonen werden sicher auf dem Server geprüft."
              : "Prices, availability & zones are securely checked on the server."}
          </p>
        </Card>
      </aside>
    </form>
  );
}

function Field({
  id,
  label,
  required = true,
  error,
  ...props
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
} & React.ComponentProps<typeof Input>) {
  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="text-destructive font-bold" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </Label>
      <Input
        id={id}
        name={id}
        required={required}
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-1"
        {...props}
      />
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1 text-xs font-semibold text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
