import { requireStaffApiUser } from "@/server/auth/staff-api";
import { apiError } from "@/server/http";
import { getStaffOrder } from "@/server/services/staff-mobile";

export async function GET(request: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  try {
    await requireStaffApiUser(request, "OWNER", "STAFF");
    const order = await getStaffOrder((await params).orderNumber);
    return order ? Response.json(order) : Response.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
  } catch (error) {
    return apiError(error);
  }
}
