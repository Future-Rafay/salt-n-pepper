import { refreshStaffMobile } from "@/server/auth/staff-mobile";
import { apiError } from "@/server/http";

export async function POST(request: Request) {
  try {
    return Response.json(await refreshStaffMobile(await request.json()));
  } catch (error) {
    return apiError(error);
  }
}
