import { requireStaffApiUser } from "@/server/auth/staff-api";
import { apiError } from "@/server/http";
import { confirmCashPayment } from "@/server/services/ordering";

export async function PATCH(request: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  try {
    const user = await requireStaffApiUser(request, "OWNER", "STAFF");
    return Response.json(await confirmCashPayment((await params).orderNumber, user.id));
  } catch (error) {
    return apiError(error);
  }
}
