import { logoutStaffMobile } from "@/server/auth/staff-mobile";
import { apiError } from "@/server/http";

export async function POST(request: Request) {
  try {
    return Response.json(await logoutStaffMobile(await request.json()));
  } catch (error) {
    return apiError(error);
  }
}
