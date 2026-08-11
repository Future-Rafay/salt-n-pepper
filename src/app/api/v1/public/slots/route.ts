import { apiError } from "@/server/http";
import { getAvailableSlots } from "@/server/services/ordering";
import { slotsQuerySchema } from "@/server/validators/order";

export async function GET(request: Request) {
  try {
    const query = Object.fromEntries(new URL(request.url).searchParams);
    const input = slotsQuerySchema.parse(query);
    return Response.json({ slots: await getAvailableSlots(input.fulfillmentType, input.date) });
  } catch (error) {
    return apiError(error);
  }
}
