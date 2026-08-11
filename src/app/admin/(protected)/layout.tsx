import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getCurrentUser } from "@/server/auth/current-user";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user || !["OWNER", "STAFF"].includes(user.role)) redirect("/admin/login");
  return <div className="min-h-dvh bg-background">{children}</div>;
}
