"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";

/**
 * Her server action yetkiyi kendi başına doğrular. Middleware'e güvenmek
 * yeterli değildir: action'lar POST ile doğrudan çağrılabilir.
 */
async function assertAdmin() {
  const session = await requireAdmin();
  if (!session) throw new Error("Bu işlem için yönetici yetkisi gerekiyor.");
  return session;
}

const validStatuses: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export async function updateOrderStatus(orderId: string, status: string) {
  await assertAdmin();

  if (!validStatuses.includes(status as OrderStatus)) {
    throw new Error("Geçersiz sipariş durumu.");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as OrderStatus },
  });

  revalidatePath("/admin/siparisler");
  revalidatePath("/admin");
}

export async function toggleProductActive(productId: string, active: boolean) {
  await assertAdmin();

  await prisma.product.update({ where: { id: productId }, data: { active } });

  revalidatePath("/admin/urunler");
  revalidatePath("/");
}

export async function updateProductFlags(
  productId: string,
  flags: { featured?: boolean; bestSeller?: boolean; newArrival?: boolean }
) {
  await assertAdmin();

  await prisma.product.update({ where: { id: productId }, data: flags });

  revalidatePath("/admin/urunler");
  revalidatePath("/");
}

export async function updateProductPrice(productId: string, price: number) {
  await assertAdmin();

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Fiyat sıfırdan büyük olmalıdır.");
  }

  await prisma.product.update({ where: { id: productId }, data: { price } });

  revalidatePath("/admin/urunler");
  revalidatePath("/");
}

export async function updateVariantStock(variantId: string, stock: number) {
  await assertAdmin();

  if (!Number.isInteger(stock) || stock < 0) {
    throw new Error("Stok negatif olamaz.");
  }

  const variant = await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock },
    select: { productId: true },
  });

  // Ürünün toplam stoğu varyantların toplamıdır; tutarlı kalması için yeniden hesapla.
  const total = await prisma.productVariant.aggregate({
    where: { productId: variant.productId },
    _sum: { stock: true },
  });
  await prisma.product.update({
    where: { id: variant.productId },
    data: { stock: total._sum.stock ?? 0 },
  });

  revalidatePath("/admin/urunler");
  revalidatePath("/admin");
}

export async function updateCategoryVisibility(
  categoryId: string,
  data: { showInNav?: boolean; showOnHome?: boolean }
) {
  await assertAdmin();

  await prisma.category.update({ where: { id: categoryId }, data });

  revalidatePath("/admin/kategoriler");
  revalidatePath("/", "layout");
}

export async function updateCategoryPositions(
  categoryId: string,
  data: { navPosition?: number; homePosition?: number }
) {
  await assertAdmin();

  if (
    (data.navPosition != null && !Number.isInteger(data.navPosition)) ||
    (data.homePosition != null && !Number.isInteger(data.homePosition))
  ) {
    throw new Error("Sıra numarası tam sayı olmalıdır.");
  }

  await prisma.category.update({ where: { id: categoryId }, data });

  revalidatePath("/admin/kategoriler");
  revalidatePath("/", "layout");
}
