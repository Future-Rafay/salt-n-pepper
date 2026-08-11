import { getCurrentUser } from "@/server/auth/current-user";
import { apiError, assertSameOrigin } from "@/server/http";
import { createOrder, getCustomerOrders } from "@/server/services/ordering";
import { createOrderSchema } from "@/server/validators/order";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getCurrentUser();
    const order = await createOrder(createOrderSchema.parse(await request.json()), user?.id);
    return Response.json(order, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") return Response.json({ error: "FORBIDDEN" }, { status: 403 });
  return Response.json({ orders: await getCustomerOrders(user.id) });
}
