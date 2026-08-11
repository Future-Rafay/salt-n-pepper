import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getCurrentUser } from "@/server/auth/current-user";

export async function OwnerOnly({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (user?.role !== "OWNER") redirect("/admin");
  return children;
}
