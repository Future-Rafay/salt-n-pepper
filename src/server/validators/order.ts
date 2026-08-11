import { z } from "zod";

const cartItemSchema = z.object({
  variantId: z.string().min(1).max(191),
  choiceIds: z.array(z.string().min(1).max(191)).max(20).default([]),
  quantity: z.number().int().min(1).max(20),
});

const fulfillmentSchema = z.object({
  fulfillmentType: z.enum(["DELIVERY", "PICKUP"]),
  scheduledFor: z.iso.datetime().nullable().optional(),
  postcode: z.string().trim().regex(/^\d{4}$/).optional(),
});

export const deliveryQuoteSchema = z.object({
  postcode: z.string().trim().regex(/^\d{4}$/),
  subtotalRappen: z.number().int().min(0).max(1_000_000),
});

export const slotsQuerySchema = z.object({
  fulfillmentType: z.enum(["DELIVERY", "PICKUP"]),
  date: z.iso.date(),
});

export const quoteSchema = fulfillmentSchema.extend({
  items: z.array(cartItemSchema).min(1).max(100),
  promoCode: z.string().trim().max(64).optional(),
  customerEmail: z.string().trim().email().transform((value) => value.toLowerCase()).optional(),
});

const addressSchema = z.object({
  recipientName: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(6).max(40),
  street: z.string().trim().min(3).max(200),
  streetExtra: z.string().trim().max(200).optional(),
  postalCode: z.string().trim().regex(/^\d{4}$/),
  city: z.string().trim().min(2).max(120),
});

export const createOrderSchema = quoteSchema.extend({
  checkoutKey: z.uuid(),
  locale: z.enum(["de", "en"]),
  customerName: z.string().trim().min(2).max(160),
  customerEmail: z.string().trim().email().transform((value) => value.toLowerCase()),
  customerPhone: z.string().trim().min(6).max(40),
  paymentMethod: z.enum(["STRIPE", "CASH_ON_DELIVERY", "PAY_AT_PICKUP"]),
  note: z.string().trim().max(1000).optional(),
  address: addressSchema.optional(),
});

export type QuoteInput = z.infer<typeof quoteSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
