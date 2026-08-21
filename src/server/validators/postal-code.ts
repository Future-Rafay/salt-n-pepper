import { z } from "zod";

export const normalizePostalCode = (value: string) => value.trim().replace(/\s+/g, " ").toUpperCase();

export const postalCodeValueSchema = z.string()
  .transform(normalizePostalCode)
  .pipe(z.string().min(1).max(16).regex(/^[A-Z0-9]+(?:[ -][A-Z0-9]+)*$/, "Enter a valid postal code."));
