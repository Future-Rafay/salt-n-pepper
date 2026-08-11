import { hash } from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/server/db";

export const registerCustomerSchema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(10).max(200),
});

export async function registerCustomer(input: z.input<typeof registerCustomerSchema>) {
  const customer = registerCustomerSchema.parse(input);
  const existing = await prisma.user.findUnique({ where: { email: customer.email }, select: { id: true } });
  if (existing) throw new Error("EMAIL_IN_USE");
  return prisma.user.create({
    data: { name: customer.name, email: customer.email, passwordHash: await hash(customer.password, 12), role: "CUSTOMER" },
    select: { id: true, name: true, email: true },
  });
}
