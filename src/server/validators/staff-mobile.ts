import { z } from "zod";

export const staffOrderFilterSchema = z
  .enum(["PAYMENT_PENDING", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"])
  .optional();

export const staffStatusSchema = z.object({
  version: z.number().int().min(0),
});

export const staffEtaSchema = z.object({
  version: z.number().int().min(0),
  estimatedReadyAt: z.string().datetime(),
});
