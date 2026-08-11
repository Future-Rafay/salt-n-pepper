import { requireStaffApiUser } from "@/server/auth/staff-api";
import { apiError } from "@/server/http";
import { refundAndCancelOrder } from "@/server/services/admin";
import { refundAndCancelSchema } from "@/server/validators/admin";

export async function POST(request: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  try {
    const actor = await requireStaffApiUser(request, "OWNER", "STAFF");
    const orderNumber = (await params).orderNumber;
    const input = refundAndCancelSchema.parse({ ...(await request.json()), orderNumber });
    const refund = await refundAndCancelOrder(actor.id, orderNumber, input.reason, input.refundKey);
    return Response.json({ refundStatus: refund.status });
  } catch (error) {
    return apiError(error);
  }
}
