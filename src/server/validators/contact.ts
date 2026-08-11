import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(320),
  phone: z.string().trim().max(40).optional().default(""),
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(5000),
  locale: z.enum(["de", "en"]),
  website: z.literal("").default(""),
});
