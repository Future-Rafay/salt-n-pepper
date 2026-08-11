import { z } from "zod";

import { requireStaffApiUser } from "@/server/auth/staff-api";
import { apiError } from "@/server/http";
import { setProductAvailability } from "@/server/services/ordering";

export async function PATCH(request: Request, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const user = await requireStaffApiUser(request, "OWNER", "STAFF");
    const { available } = z.object({ available: z.boolean() }).parse(await request.json());
    return Response.json(await setProductAvailability((await params).productId, available, user.id));
  } catch (error) {
    return apiError(error);
  }
}
