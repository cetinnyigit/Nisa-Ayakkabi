import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MAX_CART_LINES } from "@/lib/orders";
import { toNumber } from "@/lib/utils";

/**
 * Sepet localStorage'da tutulduğu için fiyat ve stok bilgisi bayatlayabilir.
 * Bu uç nokta, sepetteki varyantların GÜNCEL durumunu döndürür; istemci
 * kendini buna göre günceller ve kullanıcıyı değişiklikten haberdar eder.
 *
 * Yalnızca zaten herkese açık olan ürün bilgilerini döndürür.
 */
export async function POST(request: Request) {
  let variantIds: unknown;
  try {
    ({ variantIds } = (await request.json()) as { variantIds?: unknown });
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  if (!Array.isArray(variantIds) || variantIds.some((id) => typeof id !== "string")) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
  if (variantIds.length === 0) return NextResponse.json({ items: [] });
  if (variantIds.length > MAX_CART_LINES) {
    return NextResponse.json({ error: "Sepetinizde çok fazla ürün var." }, { status: 422 });
  }

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds as string[] } },
    select: {
      id: true,
      size: true,
      color: true,
      stock: true,
      price: true,
      product: {
        select: {
          name: true,
          slug: true,
          price: true,
          active: true,
          images: { select: { url: true }, orderBy: { position: "asc" }, take: 1 },
        },
      },
    },
  });

  const items = (variantIds as string[]).map((id) => {
    const v = variants.find((x) => x.id === id);
    if (!v || !v.product.active) {
      return { variantId: id, available: false as const };
    }
    return {
      variantId: id,
      available: true as const,
      name: v.product.name,
      slug: v.product.slug,
      size: v.size,
      color: v.color,
      price: v.price != null ? toNumber(v.price) : toNumber(v.product.price),
      stock: v.stock,
      image: v.product.images[0]?.url ?? null,
    };
  });

  return NextResponse.json({ items });
}
