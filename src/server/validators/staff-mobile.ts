import { z } from "zod";

export const staffStatusSchema = z.object({
  version: z.number().int().min(0),
});

export const staffEtaSchema = z.object({
  version: z.number().int().min(0),
  estimatedReadyAt: z.string().datetime(),
});
