import type { UserRole } from "@/generated/prisma/enums";
import { requireRole } from "@/server/auth/current-user";
import { requireStaffBearer } from "@/server/auth/staff-mobile";
import { StaffMobileAuthError } from "@/server/auth/staff-mobile-token";
import { assertSameOrigin } from "@/server/http";

export async function requireStaffApiUser(request: Request, ...roles: Extract<UserRole, "OWNER" | "STAFF">[]) {
  if (request.headers.get("authorization")) {
    const auth = await requireStaffBearer(request);
    if (!roles.includes(auth.user.role as Extract<UserRole, "OWNER" | "STAFF">)) {
      throw new StaffMobileAuthError("FORBIDDEN");
    }
    return auth.user;
  }

  assertSameOrigin(request);
  return requireRole(...roles);
}
