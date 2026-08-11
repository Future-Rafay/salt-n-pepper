import { updateCurrentDevicePushToken } from "@/server/auth/staff-mobile";
import { apiError } from "@/server/http";

export async function PUT(request: Request) {
  try {
    return Response.json(await updateCurrentDevicePushToken(request, await request.json()));
  } catch (error) {
    return apiError(error);
  }
}
