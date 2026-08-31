import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CheckoutError, createPendingOrder, type CheckoutInput } from "@/lib/orders";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // Aynı IP'den 10 dakikada en fazla 10 sipariş denemesi
  const limit = rateLimit(`siparis:${clientIp(request)}`, 10, 600);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  let body: CheckoutInput;
  try {
    body = (await request.json()) as CheckoutInput;
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  // Üyelik zorunlu değil: oturum varsa sipariş hesaba bağlanır, yoksa misafir siparişi olur.
  // userId asla istemciden alınmaz.
  const session = await auth();

  try {
    const { order } = await createPendingOrder({
      ...body,
      userId: session?.user?.id ?? null,
    });

    return NextResponse.json({ orderNumber: order.orderNumber });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message, field: error.field }, { status: 422 });
    }
    console.error("Sipariş oluşturulamadı:", error);
    return NextResponse.json(
      { error: "Sipariş oluşturulamadı. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
