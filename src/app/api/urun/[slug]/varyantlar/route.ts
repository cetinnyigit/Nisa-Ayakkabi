import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/utils";

/**
 * Hızlı Ekle paneli için varyantlar. Liste sorgularını şişirmemek adına
 * varyantlar kart üzerinde değil, panel açıldığında çekilir.
 */
export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      name: true,
      price: true,
      active: true,
      images: { select: { url: true }, orderBy: { position: "asc" }, take: 1 },
      variants: {
        select: { id: true, size: true, color: true, colorHex: true, stock: true, price: true },
        orderBy: [{ color: "asc" }, { size: "asc" }],
      },
    },
  });

  if (!product || !product.active) {
    return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
  }

  return NextResponse.json({
    productId: product.id,
    name: product.name,
    price: toNumber(product.price),
    image: product.images[0]?.url ?? null,
    variants: product.variants.map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      colorHex: v.colorHex,
      stock: v.stock,
      price: v.price == null ? null : toNumber(v.price),
    })),
  });
}
