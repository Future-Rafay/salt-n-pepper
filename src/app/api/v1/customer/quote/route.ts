import { getCurrentUser } from "@/server/auth/current-user";
import { apiError, assertSameOrigin } from "@/server/http";
import { calculateQuote } from "@/server/services/ordering";
import { quoteSchema } from "@/server/validators/order";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getCurrentUser();
    const quote = await calculateQuote(quoteSchema.parse(await request.json()), undefined, user?.id);
    return Response.json({
      items: quote.items,
      subtotalRappen: quote.subtotalRappen,
      discountRappen: quote.discountRappen,
      deliveryFeeRappen: quote.deliveryFeeRappen,
      totalRappen: quote.totalRappen,
      delivery: quote.delivery,
      promoCode: quote.promo?.code ?? null,
      promoMinimumSubtotalRappen: quote.promo?.minimumSubtotalRappen ?? null,
      estimatedMinutes: quote.estimatedMinutes,
    });
  } catch (error) {
    return apiError(error);
  }
}
