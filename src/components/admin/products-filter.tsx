"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState, type ReactNode } from "react";
import { Search } from "lucide-react";

type Product = { id: string; nameEn: string; nameDe: string; active: boolean; available: boolean; imageUrl: string | null; category: { id: string; nameEn: string }; variants: { id: string }[]; optionGroups: { id: string }[] };
type Category = { id: string; nameEn: string };

export function ProductsFilter({ products, categories, children }: { products: Product[]; categories: Category[]; children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("ALL");
  const filtered = useMemo(() => products.filter((product) => (categoryId === "ALL" || product.category.id === categoryId) && `${product.nameEn} ${product.nameDe} ${product.category.nameEn}`.toLowerCase().includes(query.trim().toLowerCase())), [categoryId, products, query]);
  return <div className="space-y-5"><div className="flex justify-end">{children}</div><div className="grid gap-3 sm:grid-cols-[1fr_15rem]"><label className="relative"><span className="sr-only">Search products</span><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products…" className="min-h-10 w-full rounded-lg border bg-white pl-9 pr-3 text-sm" /></label><select aria-label="Filter by category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="min-h-10 rounded-lg border bg-white px-3 text-sm"><option value="ALL">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.nameEn}</option>)}</select></div><p className="text-xs text-muted" aria-live="polite">{filtered.length} of {products.length} products</p>
    {filtered.length === 0 ? <p className="rounded-xl border bg-white p-8 text-center text-sm text-muted">No products match this filter.</p> : <div className="overflow-hidden rounded-xl border bg-white">{filtered.map((product) => <div key={product.id} className="flex flex-wrap items-center justify-between gap-4 border-b p-4 last:border-0 hover:bg-[#F9F9F9]"><div className="flex min-w-0 flex-1 items-center gap-3">{product.imageUrl ? <Image src={product.imageUrl} alt="" width={56} height={56} className="size-14 shrink-0 rounded-lg border object-cover" /> : <div className="grid size-14 shrink-0 place-items-center rounded-lg border bg-background text-xs text-muted">No image</div>}<div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-secondary">{product.category.nameEn}</p><h2 className="truncate font-display font-bold">{product.nameEn}</h2><p className="text-xs text-muted">{product.nameDe} · {product.variants.length} variants · {product.optionGroups.length} option groups</p></div></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${product.active && product.available ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>{!product.active ? "Draft" : product.available ? "Available" : "Sold out"}</span><Link href={`/admin/menu/products/${product.id}`} className="inline-flex min-h-11 items-center rounded-lg border bg-white px-3 text-xs font-bold">Edit</Link></div>)}</div>}
  </div>;
}
