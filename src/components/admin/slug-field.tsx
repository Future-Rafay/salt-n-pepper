"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function SlugField({ defaultValue = "" }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);
  return <div className="space-y-1"><Label htmlFor="slug">Slug</Label><div className="flex gap-2"><Input id="slug" name="slug" value={value} onChange={(event) => setValue(event.target.value)} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /><Button type="button" variant="outline" onClick={(event) => { const form = event.currentTarget.form; const source = form?.elements.namedItem("nameEn"); if (source instanceof HTMLInputElement) setValue(slugify(source.value)); }}>Generate</Button></div></div>;
}
