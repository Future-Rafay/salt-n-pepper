import { randomBytes } from "node:crypto";

import { compare } from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/server/db";
import { sessionMaxAgeSeconds } from "@/server/auth/session-cookie";

export const credentialsSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(200),
});

export async function createCredentialsSession(input: z.input<typeof credentialsSchema>) {
  const credentials = credentialsSchema.parse(input);
  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      passwordHash: true,
    },
  });

  if (!user?.active || !user.passwordHash || !(await compare(credentials.password, user.passwordHash))) {
    return null;
  }

  const sessionToken = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + sessionMaxAgeSeconds * 1000);

  await prisma.$transaction([
    prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires,
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    }),
  ]);

  return {
    sessionToken,
    expires,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}
