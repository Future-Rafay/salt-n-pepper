import { requireStaffApiUser } from "@/server/auth/staff-api";
import { apiError } from "@/server/http";
import { getStaffOrders } from "@/server/services/staff-mobile";

export async function GET(request: Request) {
  try {
    await requireStaffApiUser(request, "OWNER", "STAFF");
    const url = new URL(request.url);
    return Response.json(await getStaffOrders(url.searchParams.get("status") ?? undefined));
  } catch (error) {
    return apiError(error);
  }
}
