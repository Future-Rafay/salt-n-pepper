import { getServerSession } from "next-auth";

import type { UserRole } from "@/generated/prisma/enums";
import { authOptions } from "@/server/auth/options";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

export async function requireRole(...roles: UserRole[]) {
  const user = await getCurrentUser();

  if (!user || !roles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }

  return user;
}
