import { requireStaffApiUser } from "@/server/auth/staff-api";
import { apiError } from "@/server/http";
import { updateOrderEta } from "@/server/services/staff-order-mutations";
import { staffEtaSchema } from "@/server/validators/staff-mobile";

export async function PATCH(request: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  try {
    const user = await requireStaffApiUser(request, "OWNER", "STAFF");
    const { version, estimatedReadyAt } = staffEtaSchema.parse(await request.json());
    return Response.json(await updateOrderEta((await params).orderNumber, version, estimatedReadyAt, user.id));
  } catch (error) {
    return apiError(error);
  }
}
