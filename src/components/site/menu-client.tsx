"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Leaf, Search, ShoppingBag, Wheat, X } from "lucide-react";

import { useCart } from "@/components/site/cart-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatMoney } from "@/lib/orders";

type MenuCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  products: Array<{
    id: string;
    name: string;
    description: string | null;
    imageKey: string | null;
    available: boolean;
    isHalal: boolean;
    isVegetarian: boolean;
    isVegan: boolean;
    spiceLevel: string | null;
    allergens: Array<{ code: string; name: string }>;
    variants: Array<{ id: string; name: string; priceRappen: number }>;
    suggestedItems: Array<{
      productId: string;
      productName: string;
      variantId: string;
      variantName: string;
      priceRappen: number;
      imageKey: string | null;
    }>;
    optionGroups: Array<{
      id: string;
      name: string;
      required: boolean;
      minimumSelections: number;
      maximumSelections: number;
      choices: Array<{ id: string; name: string; priceDeltaRappen: number }>;
    }>;
  }>;
};

type DietFilter = "halal" | "vegetarian" | "vegan";

const FILTER_CONFIG: { key: DietFilter; labelDe: string; labelEn: string; icon: React.ReactNode; color: string; activeColor: string }[] = [
  { key: "halal",       labelDe: "Halal",        labelEn: "Halal",       icon: <ShoppingBag className="h-3.5 w-3.5" />, color: "border-emerald-600/40 text-emerald-700 hover:bg-emerald-50", activeColor: "bg-emerald-700 text-white border-emerald-700 shadow-md" },
  { key: "vegetarian",  labelDe: "Vegetarisch",  labelEn: "Vegetarian",  icon: <Leaf className="h-3.5 w-3.5" />,        color: "border-green-600/40 text-green-700 hover:bg-green-50",     activeColor: "bg-green-700 text-white border-green-700 shadow-md" },
  { key: "vegan",       labelDe: "Vegan",        labelEn: "Vegan",       icon: <Wheat className="h-3.5 w-3.5" />,       color: "border-teal-600/40 text-teal-700 hover:bg-teal-50",        activeColor: "bg-teal-700 text-white border-teal-700 shadow-md" },
];

export function MenuClient({ categories, locale }: { categories: MenuCategory[]; locale: "de" | "en" }) {
  const de = locale === "de";
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Set<DietFilter>>(new Set());

  const toggleFilter = (key: DietFilter) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return categories
      .map((category) => ({
        ...category,
        products: category.products.filter((product) => {
          // Dietary filters — all active filters must match
          if (activeFilters.has("halal") && !product.isHalal) return false;
          if (activeFilters.has("vegetarian") && !product.isVegetarian) return false;
          if (activeFilters.has("vegan") && !product.isVegan) return false;
          // Search query
          if (query) {
            const haystack = [product.name, product.description ?? ""].join(" ").toLowerCase();
            if (!haystack.includes(query)) return false;
          }
          return true;
        }),
      }))
      .filter((category) => category.products.length > 0);
  }, [categories, searchQuery, activeFilters]);

  const totalResults = filteredCategories.reduce((sum, c) => sum + c.products.length, 0);
  const isFiltered = searchQuery.trim() !== "" || activeFilters.size > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl bg-surface-warm/80 border border-border/80 p-8 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-secondary">
            SALTNPPEPPER
          </span>
          <h1 className="font-display text-4xl font-extrabold text-primary sm:text-5xl">
            {de ? "Unsere Speisekarte" : "Our Menu"}
          </h1>
          <p className="text-muted leading-relaxed text-base">
            {de
              ? "Entdecken Sie unsere aktuelle Auswahl. Wählen Sie Artikel, Varianten und Optionen."
              : "Explore our current selection. Choose your items, variants, and options."}
          </p>
        </div>
      </div>

      {/* Search + Dietary Filter Bar */}
      <div className={categories.length === 0 ? "hidden" : "space-y-3"}>
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
          <input
            id="menu-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={de ? "Gerichte suchen…" : "Search dishes…"}
            className="w-full min-h-12 rounded-xl border border-border/80 bg-surface pl-11 pr-10 text-sm font-medium text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all shadow-sm"
            aria-label={de ? "Speisekarte durchsuchen" : "Search the menu"}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted hover:text-foreground hover:bg-background transition-colors"
              aria-label={de ? "Suche löschen" : "Clear search"}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Dietary Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted mr-1 shrink-0">
            {de ? "Filter:" : "Filter:"}
          </span>
          {FILTER_CONFIG.map((filter) => {
            const isActive = activeFilters.has(filter.key);
            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => toggleFilter(filter.key)}
                className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-xs font-bold transition-all duration-200 ${
                  isActive ? filter.activeColor : `bg-surface ${filter.color}`
                }`}
                aria-pressed={isActive}
              >
                {filter.icon}
                {de ? filter.labelDe : filter.labelEn}
              </button>
            );
          })}

          {isFiltered && (
            <button
              type="button"
              onClick={() => { setSearchQuery(""); setActiveFilters(new Set()); }}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border/60 bg-surface px-3 text-xs font-bold text-muted hover:text-destructive hover:border-destructive/40 transition-all ml-auto"
            >
              <X className="h-3.5 w-3.5" />
              {de ? "Zurücksetzen" : "Clear all"}
            </button>
          )}
        </div>

        {/* Results count when filtering */}
        {isFiltered && (
          <p className="text-xs text-muted animate-fade-in" role="status" aria-live="polite">
            {totalResults === 0
              ? (de ? "Keine Gerichte gefunden." : "No dishes found.")
              : de
                ? `${totalResults} Gericht${totalResults !== 1 ? "e" : ""} gefunden.`
                : `${totalResults} dish${totalResults !== 1 ? "es" : ""} found.`}
          </p>
        )}
      </div>

      {/* Sticky Category Scroll Nav */}
      <nav
        aria-label={de ? "Menükategorien" : "Menu categories"}
        className={`${categories.length === 0 ? "hidden" : "flex"} sticky top-[4.5rem] z-30 -mx-4 gap-2 overflow-x-auto border-y border-border/60 bg-surface/95 px-4 py-3 shadow-sm backdrop-blur-md sm:top-[7.3rem]`}
      >
        {filteredCategories.length > 0
          ? filteredCategories.map((category) => (
              <a
                key={category.id}
                href={`#${category.slug}`}
                className="min-h-10 shrink-0 content-center rounded-full border border-border/80 bg-surface px-5 text-sm font-bold text-foreground/80 hover:border-secondary hover:text-primary transition-all duration-200 shadow-sm"
              >
                {category.name}
              </a>
            ))
          : categories.map((category) => (
              <a
                key={category.id}
                href={`#${category.slug}`}
                className="min-h-10 shrink-0 content-center rounded-full border border-border/80 bg-surface/50 px-5 text-sm font-bold text-muted/50 shadow-sm cursor-default"
              >
                {category.name}
              </a>
            ))}
      </nav>

      {/* Menu Categories & Products */}
      {filteredCategories.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-surface-warm text-muted">
            <Search className="h-10 w-10" strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-2xl font-bold text-primary">
            {categories.length === 0 ? (de ? "Speisekarte folgt bald" : "Menu coming soon") : (de ? "Keine Gerichte gefunden" : "No dishes found")}
          </h2>
          <p className="text-muted text-sm max-w-sm mx-auto">
            {categories.length === 0
              ? (de ? "Wir veröffentlichen unsere bestätigte Speisekarte hier so bald wie möglich." : "We will publish our confirmed menu here as soon as possible.")
              : (de ? "Versuchen Sie es mit anderen Suchbegriffen oder entfernen Sie einige Filter." : "Try different search terms or remove some filters.")}
          </p>
          {categories.length > 0 && <button
            type="button"
            onClick={() => { setSearchQuery(""); setActiveFilters(new Set()); }}
            className="inline-flex min-h-10 items-center rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground hover:bg-primary-light transition-colors"
          >
            {de ? "Alle Gerichte anzeigen" : "Show all dishes"}
          </button>}
        </div>
      ) : (
        <div className="space-y-16">
          {filteredCategories.map((category, categoryIndex) => (
            <section
              key={category.id}
              id={category.slug}
              className="scroll-mt-36 space-y-6"
              aria-labelledby={`${category.id}-title`}
            >
              <div className="border-b border-border/60 pb-3">
                <h2 id={`${category.id}-title`} className="font-display text-3xl font-bold text-primary flex items-center gap-3">
                  <span>{category.name}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                  <span className="text-base font-normal text-muted">
                    ({category.products.length})
                  </span>
                </h2>
                {category.description && (
                  <p className="mt-1 text-sm text-muted">{category.description}</p>
                )}
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {category.products.map((product, productIndex) => (
                  <ProductCard key={product.id} product={product} locale={locale} searchQuery={searchQuery} eager={categoryIndex === 0 && productIndex < 2} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase().trim());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-secondary/25 text-primary rounded px-0.5 not-italic">{text.slice(idx, idx + query.trim().length)}</mark>
      {text.slice(idx + query.trim().length)}
    </>
  );
}

function ProductCard({
  product,
  locale,
  searchQuery,
  eager,
}: {
  product: MenuCategory["products"][number];
  locale: "de" | "en";
  searchQuery: string;
  eager: boolean;
}) {
  const { addMany } = useCart();
  const [open, setOpen] = useState(false);
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const [choiceIds, setChoiceIds] = useState<string[]>([]);
  const [suggestedVariantIds, setSuggestedVariantIds] = useState<string[]>([]);
  const variant = product.variants.find((item) => item.id === variantId) ?? product.variants[0];
  const selectedChoices = product.optionGroups.flatMap((group) => group.choices).filter((choice) => choiceIds.includes(choice.id));
  const unitPrice = (variant?.priceRappen ?? 0) + selectedChoices.reduce((sum, choice) => sum + choice.priceDeltaRappen, 0);
  const totalPrice = unitPrice + product.suggestedItems
    .filter((item) => suggestedVariantIds.includes(item.variantId))
    .reduce((sum, item) => sum + item.priceRappen, 0);
  const valid = product.optionGroups.every((group) => {
    const count = group.choices.filter((choice) => choiceIds.includes(choice.id)).length;
    return count >= group.minimumSelections && count <= group.maximumSelections;
  });

  const toggleChoice = (group: MenuCategory["products"][number]["optionGroups"][number], choiceId: string) => {
    setChoiceIds((current) => {
      if (current.includes(choiceId)) return current.filter((id) => id !== choiceId);
      const groupIds = group.choices.map((choice) => choice.id);
      if (group.maximumSelections === 1) return [...current.filter((id) => !groupIds.includes(id)), choiceId];
      if (current.filter((id) => groupIds.includes(id)).length >= group.maximumSelections) return current;
      return [...current, choiceId];
    });
  };

  const resetSelections = () => {
    setVariantId(product.variants[0]?.id ?? "");
    setChoiceIds([]);
    setSuggestedVariantIds([]);
  };

  const minPrice = Math.min(...product.variants.map((item) => item.priceRappen));
  const hasMultipleVariants = product.variants.length > 1;

  return (
    <Card hover className="flex flex-col overflow-hidden p-0 h-full justify-between group">
      {/* Product Image */}
      <div className="relative h-48 w-full bg-surface-warm overflow-hidden">
        <Image
          src={product.imageKey || "/images/editorial/restaurant-table.jpg"}
          alt={product.name}
          fill
          loading={eager ? "eager" : "lazy"}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
        <span className="absolute bottom-3 left-3 rounded-full bg-primary/85 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
          {locale === "de" ? "Beispielfoto" : "Representative image"}
        </span>

        {/* Dietary Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {product.isHalal && (
            <span className="rounded-full bg-emerald-700/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              Halal
            </span>
          )}
          {product.isVegetarian && (
            <span className="rounded-full bg-green-700/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              Veggie
            </span>
          )}
          {product.isVegan && (
            <span className="rounded-full bg-teal-700/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              Vegan
            </span>
          )}
        </div>

        {/* Price Tag */}
        <div className="absolute bottom-3 right-3 rounded-xl bg-surface/95 backdrop-blur-md px-3 py-1 font-extrabold text-sm text-primary shadow">
          {hasMultipleVariants && <span className="text-xs font-normal text-muted mr-1">{locale === "de" ? "ab" : "from"}</span>}
          {formatMoney(minPrice, locale)}
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col p-5 justify-between space-y-4">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
            {highlightText(product.name, searchQuery)}
          </h3>
          {product.description && (
            <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted">
              {highlightText(product.description, searchQuery)}
            </p>
          )}

          {product.allergens.length > 0 && (
            <p className="mt-3 text-[11px] text-muted/80">
              <span className="font-semibold">{locale === "de" ? "Allergene:" : "Allergens:"}</span>{" "}
              {product.allergens.map((item) => item.name).join(", ")}
            </p>
          )}
        </div>

        {/* Action Area */}
        <div className="pt-2 flex items-center justify-between border-t border-border/50">
          <span className="text-xs font-semibold text-muted">
            {product.variants.length > 1
              ? `${product.variants.length} ${locale === "de" ? "Varianten" : "variants"}`
              : product.variants[0]?.name}
          </span>

          {!product.available ? (
            <span className="rounded-xl bg-muted/20 px-3 py-1.5 text-xs font-bold text-muted">
              {locale === "de" ? "Ausverkauft" : "Sold out"}
            </span>
          ) : (
            <Dialog open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (!nextOpen) resetSelections(); }}>
              <DialogTrigger asChild>
                <Button size="compact" variant="secondary">
                  {locale === "de" ? "+ Hinzufügen" : "+ Add"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogTitle>{product.name}</DialogTitle>
                {product.description && (
                  <DialogDescription>{product.description}</DialogDescription>
                )}

                <div className="mt-5 space-y-6">
                  {/* Variant Selection */}
                  <fieldset className="space-y-2">
                    <legend className="font-display text-sm font-bold text-primary">
                      {locale === "de" ? "Grösse / Variante wählen" : "Select size / variant"}
                    </legend>
                    <div className="space-y-2">
                      {product.variants.map((item) => (
                        <label
                          key={item.id}
                          className={`flex min-h-12 cursor-pointer items-center justify-between rounded-xl border p-3 text-sm font-medium transition-all ${
                            variantId === item.id
                              ? "border-secondary bg-secondary/10 font-bold text-primary"
                              : "border-border hover:bg-background"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`variant-${product.id}`}
                              checked={variantId === item.id}
                              onChange={() => setVariantId(item.id)}
                              className="h-4 w-4 accent-secondary"
                            />
                            <span>{item.name}</span>
                          </div>
                          <span className="font-bold">{formatMoney(item.priceRappen, locale)}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  {/* Option Groups Selection */}
                  {product.optionGroups.map((group) => (
                    <fieldset key={group.id} className="space-y-2">
                      <legend className="font-display text-sm font-bold text-primary">
                        {group.name} {group.minimumSelections > 0 && <span className="text-destructive">*</span>}
                      </legend>
                      <p className="text-xs text-muted">
                        {locale === "de"
                          ? `Wählen Sie ${group.minimumSelections}–${group.maximumSelections}`
                          : `Choose ${group.minimumSelections}–${group.maximumSelections}`}
                      </p>
                      {group.maximumSelections === 1 ? (
                        <div className="flex flex-wrap gap-2">
                          {group.choices.map((choice) => (
                            <label
                              key={choice.id}
                              className={`flex min-h-10 max-w-full cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
                                choiceIds.includes(choice.id)
                                  ? "border-secondary bg-secondary/10 font-bold text-primary"
                                  : "border-border hover:bg-background"
                              }`}
                            >
                              <span className="flex items-center gap-2 min-w-0">
                                <input
                                  type="radio"
                                  name={`option-group-${group.id}`}
                                  checked={choiceIds.includes(choice.id)}
                                  onChange={() => toggleChoice(group, choice.id)}
                                  className="h-4 w-4 accent-secondary shrink-0"
                                />
                                <span className="truncate">{choice.name}</span>
                              </span>
                              {choice.priceDeltaRappen !== 0 && (
                                <span className="shrink-0 text-xs font-bold text-secondary">
                                  +{formatMoney(choice.priceDeltaRappen, locale)}
                                </span>
                              )}
                            </label>
                          ))}
                        </div>
                      ) : <div className="flex flex-wrap gap-2">
                        {group.choices.map((choice) => {
                          const selectedCount = group.choices.filter((item) => choiceIds.includes(item.id)).length;
                          const disabled = !choiceIds.includes(choice.id) && selectedCount >= group.maximumSelections;
                          return (
                          <label
                            key={choice.id}
                            className={`flex min-h-10 max-w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${
                              choiceIds.includes(choice.id)
                                ? "border-secondary bg-secondary/10 font-bold text-primary"
                                : "border-border hover:bg-background"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <input
                                type="checkbox"
                                checked={choiceIds.includes(choice.id)}
                                onChange={() => toggleChoice(group, choice.id)}
                                disabled={disabled}
                                className="h-4 w-4 accent-secondary shrink-0"
                              />
                              <span className="truncate">{choice.name}</span>
                            </div>
                            {choice.priceDeltaRappen !== 0 && (
                              <span className="shrink-0 text-xs font-bold text-secondary">
                                +{formatMoney(choice.priceDeltaRappen, locale)}
                              </span>
                            )}
                          </label>
                        )})}
                      </div>}
                    </fieldset>
                  ))}

                  {product.suggestedItems.length > 0 && (
                    <fieldset className="space-y-2">
                      <legend className="font-display text-sm font-bold text-primary">
                        {locale === "de" ? "Wird oft dazu bestellt" : "People also order"}
                      </legend>
                      <div className="space-y-2">
                        {product.suggestedItems.map((item) => (
                          <label key={item.variantId} className={`flex min-h-12 cursor-pointer items-center justify-between rounded-xl border p-3 text-sm font-medium transition-all ${suggestedVariantIds.includes(item.variantId) ? "border-secondary bg-secondary/10 font-bold text-primary" : "border-border hover:bg-background"}`}>
                            <span className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={suggestedVariantIds.includes(item.variantId)}
                                onChange={() => setSuggestedVariantIds((current) => current.includes(item.variantId) ? current.filter((id) => id !== item.variantId) : [...current, item.variantId])}
                                className="h-4 w-4 accent-secondary"
                              />
                              <span>{item.productName} <span className="text-xs text-muted">({item.variantName})</span></span>
                            </span>
                            <span className="font-bold">+{formatMoney(item.priceRappen, locale)}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  )}

                  {/* Total & Add Button */}
                  <div className="flex items-center justify-between border-t border-border/80 pt-4">
                    <div>
                      <span className="block text-xs text-muted">{locale === "de" ? "Gesamtpreis" : "Total price"}</span>
                      <strong className="font-display text-2xl font-bold text-primary" aria-live="polite">
                        {formatMoney(totalPrice, locale)}
                      </strong>
                    </div>
                    <DialogClose asChild>
                      <Button
                        disabled={!valid}
                        onClick={() =>
                          addMany([
                            {
                              variantId: variant.id,
                              choiceIds,
                              choiceNames: selectedChoices.map((choice) => choice.name),
                              quantity: 1,
                              productName: product.name,
                              variantName: variant.name,
                              unitPriceRappen: unitPrice,
                              imageUrl: product.imageKey,
                            },
                            ...product.suggestedItems
                              .filter((item) => suggestedVariantIds.includes(item.variantId))
                              .map((item) => ({
                                variantId: item.variantId,
                                choiceIds: [],
                                choiceNames: [],
                                quantity: 1,
                                productName: item.productName,
                                variantName: item.variantName,
                                unitPriceRappen: item.priceRappen,
                                imageUrl: item.imageKey,
                              })),
                          ])
                        }
                      >
                        {locale === "de" ? "In den Warenkorb" : "Add to cart"}
                      </Button>
                    </DialogClose>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </Card>
  );
}
