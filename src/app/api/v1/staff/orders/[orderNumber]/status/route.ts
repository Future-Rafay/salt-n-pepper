import { requireStaffApiUser } from "@/server/auth/staff-api";
import { apiError } from "@/server/http";
import { advanceOrder } from "@/server/services/ordering";
import { staffStatusSchema } from "@/server/validators/staff-mobile";

export async function PATCH(request: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  try {
    const user = await requireStaffApiUser(request, "OWNER", "STAFF");
    const { version } = staffStatusSchema.parse(await request.json());
    return Response.json(await advanceOrder((await params).orderNumber, version, user.id));
  } catch (error) {
    return apiError(error);
  }
}
