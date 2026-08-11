import { requireStaffApiUser } from "@/server/auth/staff-api";
import { apiError } from "@/server/http";
import { getStaffContext } from "@/server/services/staff-mobile";

export async function GET(request: Request) {
  try {
    const user = await requireStaffApiUser(request, "OWNER", "STAFF");
    return Response.json({ user, ...(await getStaffContext()) });
  } catch (error) {
    return apiError(error);
  }
}
