import { requireStaffApiUser } from "@/server/auth/staff-api";
import { apiError } from "@/server/http";
import { cancelOrder } from "@/server/services/admin";
import { cancelOrderSchema } from "@/server/validators/admin";

export async function POST(request: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  try {
    const actor = await requireStaffApiUser(request, "OWNER", "STAFF");
    const orderNumber = (await params).orderNumber;
    const { reason } = cancelOrderSchema.parse({ ...(await request.json()), orderNumber });
    await cancelOrder(actor.id, orderNumber, reason);
    return Response.json({ status: "CANCELLED" });
  } catch (error) {
    return apiError(error);
  }
}
