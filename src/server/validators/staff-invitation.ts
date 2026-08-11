import { z } from "zod";

export const inviteStaffSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
});

export const acceptStaffInvitationSchema = z.object({
  token: z.string().min(32).max(256),
  name: z.string().trim().min(2).max(160),
  password: z.string().min(12).max(200),
});
