"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { allowedHostsMessage, isAllowedImageHost } from "@/lib/images";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

async function assertAdmin() {
  const session = await requireAdmin();
  if (!session) throw new Error("Bu işlem için yönetici yetkisi gerekiyor.");
}

/** Ürün henüz kaydedilmeden formda toplanan görsel/numara satırları. */
export type DraftImage = { url: string; alt?: string | null };
export type DraftVariant = {
  size: string;
  color: string;
  colorHex?: string | null;
  stock: number;
};

export type ProductInput = {
  name: string;
  slug?: string;
  description: string;
  price: number;
  comparePrice?: number | null;
  sku?: string | null;
  categoryId: string;
  /** Marka adı elle yazılır; kayıtlı değilse oluşturulur. */
  brand?: string | null;
  material?: string | null;
  soleMaterial?: string | null;
  heelHeight?: number | null;
  gender?: string | null;
  season?: string | null;
  active: boolean;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  /** Yalnızca createProduct kullanır; düzenlemede görsel/numara ayrı aksiyonlarla yönetilir. */
  images?: DraftImage[];
  variants?: DraftVariant[];
};

/**
 * Panel yalnızca Türkçe içerik alıyor; şemadaki *En sütunları NOT NULL olduğu
 * için Türkçe değerlerle birebir doldurulur (arama bu sütunlara da bakıyor).
 */
function localized(input: ProductInput) {
  return {
    name: input.name.trim(),
    nameEn: input.name.trim(),
    description: input.description.trim(),
    descriptionEn: input.description.trim(),
    material: input.material?.trim() || null,
    materialEn: input.material?.trim() || null,
  };
}

function validate(input: ProductInput) {
  if (!input.name?.trim()) throw new Error("Ürün adı zorunludur.");
  if (!input.description?.trim()) throw new Error("Açıklama zorunludur.");
  if (!input.categoryId) throw new Error("Kategori seçilmelidir.");
  if (!Number.isFinite(input.price) || input.price <= 0) {
    throw new Error("Fiyat sıfırdan büyük olmalıdır.");
  }
  if (input.comparePrice != null && input.comparePrice <= input.price) {
    throw new Error("Karşılaştırma fiyatı, satış fiyatından büyük olmalıdır.");
  }
}

/** Formda toplanan görselleri sıralı, doğrulanmış kayıtlara çevirir. */
function normalizeImages(images: DraftImage[] = []) {
  return images
    .map((img) => ({ url: img.url.trim(), alt: img.alt?.trim() || null }))
    .filter((img) => img.url)
    .map((img, index) => {
      if (!isAllowedImageHost(img.url)) {
        throw new Error(
          `"${img.url}" desteklenmeyen bir görsel kaynağı. İzin verilenler: ${allowedHostsMessage()}.`
        );
      }
      return { ...img, position: index };
    });
}

/** Formda toplanan numaraları doğrular ve renk+numara tekrarlarını eler. */
function normalizeVariants(variants: DraftVariant[] = []) {
  const seen = new Set<string>();
  const rows: Array<{ size: string; color: string; colorHex: string | null; stock: number }> = [];

  for (const variant of variants) {
    const size = variant.size.trim();
    const color = variant.color.trim();
    if (!size || !color) continue;
    if (!Number.isInteger(variant.stock) || variant.stock < 0) {
      throw new Error(`${color} / ${size} için stok negatif olamaz.`);
    }

    const key = `${color}|${size}`;
    if (seen.has(key)) continue;
    seen.add(key);

    rows.push({ size, color, colorHex: variant.colorHex?.trim() || null, stock: variant.stock });
  }

  return rows;
}

/**
 * Elle yazılan marka adını bir Brand kaydına bağlar. Aynı marka büyük/küçük harf
 * farkıyla tekrar yazıldığında yeni kayıt açılmaz, mevcut olan kullanılır.
 */
async function resolveBrandId(name?: string | null): Promise<string | null> {
  const trimmed = name?.trim();
  if (!trimmed) return null;

  const existing = await prisma.brand.findFirst({
    where: { name: { equals: trimmed, mode: "insensitive" } },
    select: { id: true },
  });
  if (existing) return existing.id;

  const root = slugify(trimmed) || "marka";
  let slug = root;
  let suffix = 1;
  while (await prisma.brand.findUnique({ where: { slug }, select: { id: true } })) {
    suffix += 1;
    slug = `${root}-${suffix}`;
  }

  const created = await prisma.brand.create({
    data: { name: trimmed, slug },
    select: { id: true },
  });
  return created.id;
}

/** Slug'ı benzersiz hale getirir: "deri-bot", "deri-bot-2", ... */
async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base);
  if (!root) throw new Error("Geçerli bir ürün adı girin.");

  let candidate = root;
  let suffix = 1;
  for (;;) {
    const existing = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    suffix += 1;
    candidate = `${root}-${suffix}`;
  }
}

export async function createProduct(input: ProductInput) {
  await assertAdmin();
  validate(input);

  // Görsel ve numaralar ürünle birlikte tek işlemde yazılır; ürün kaydedilip
  // ardından yarım kalmış bir kayıt bırakma ihtimali olmasın diye önce doğrulanır.
  const images = normalizeImages(input.images);
  const variants = normalizeVariants(input.variants);

  const slug = await uniqueSlug(input.slug?.trim() || input.name);
  const brandId = await resolveBrandId(input.brand);

  const product = await prisma.product.create({
    data: {
      ...localized(input),
      slug,
      images: images.length > 0 ? { create: images } : undefined,
      variants: variants.length > 0 ? { create: variants } : undefined,
      price: input.price,
      comparePrice: input.comparePrice ?? null,
      sku: input.sku?.trim() || null,
      categoryId: input.categoryId,
      brandId,
      soleMaterial: input.soleMaterial?.trim() || null,
      heelHeight: input.heelHeight ?? null,
      gender: input.gender || null,
      season: input.season || null,
      active: input.active,
      featured: input.featured,
      bestSeller: input.bestSeller,
      newArrival: input.newArrival,
      stock: variants.reduce((total, v) => total + v.stock, 0),
    },
    select: { id: true },
  });

  revalidatePath("/admin/urunler");
  revalidatePath("/");
  return product.id;
}

export async function updateProduct(productId: string, input: ProductInput) {
  await assertAdmin();
  validate(input);

  const slug = await uniqueSlug(input.slug?.trim() || input.name, productId);
  const brandId = await resolveBrandId(input.brand);

  await prisma.product.update({
    where: { id: productId },
    data: {
      ...localized(input),
      slug,
      price: input.price,
      comparePrice: input.comparePrice ?? null,
      sku: input.sku?.trim() || null,
      categoryId: input.categoryId,
      brandId,
      soleMaterial: input.soleMaterial?.trim() || null,
      heelHeight: input.heelHeight ?? null,
      gender: input.gender || null,
      season: input.season || null,
      active: input.active,
      featured: input.featured,
      bestSeller: input.bestSeller,
      newArrival: input.newArrival,
    },
  });

  revalidatePath("/admin/urunler");
  revalidatePath(`/urun/${slug}`);
  revalidatePath("/");
}

export async function deleteProduct(productId: string) {
  await assertAdmin();

  // Siparişi olan ürün silinemez — sipariş geçmişi bozulur. Bunun yerine pasife alınır.
  const orderCount = await prisma.orderItem.count({ where: { productId } });
  if (orderCount > 0) {
    throw new Error(
      `Bu ürün ${orderCount} siparişte geçiyor, silinemez. Bunun yerine "Satışta" anahtarını kapatın.`
    );
  }

  await prisma.product.delete({ where: { id: productId } });

  revalidatePath("/admin/urunler");
  revalidatePath("/");
}

/* ---------------------------------------------------------------- */
/* Görseller                                                         */
/* ---------------------------------------------------------------- */

export async function addProductImage(productId: string, url: string, alt?: string) {
  await assertAdmin();

  if (!/^https?:\/\//i.test(url)) {
    throw new Error("Görsel adresi http(s) ile başlamalıdır.");
  }
  // Tanımlı olmayan bir host next/image'i patlatır ve ürün sayfasını çökertirdi.
  if (!isAllowedImageHost(url)) {
    throw new Error(
      `Bu adres desteklenmiyor. İzin verilen kaynaklar: ${allowedHostsMessage()}. ` +
        `Başka bir kaynak kullanmak için next.config.mjs ve src/lib/images.ts güncellenmelidir.`
    );
  }

  const last = await prisma.productImage.findFirst({
    where: { productId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  await prisma.productImage.create({
    data: {
      productId,
      url,
      alt: alt?.trim() || null,
      position: (last?.position ?? -1) + 1,
    },
  });

  revalidatePath(`/admin/urunler/${productId}`);
  revalidatePath("/admin/urunler");
  revalidatePath("/");
}

export async function removeProductImage(imageId: string) {
  await assertAdmin();

  const image = await prisma.productImage.delete({
    where: { id: imageId },
    select: { productId: true },
  });

  revalidatePath(`/admin/urunler/${image.productId}`);
  revalidatePath("/admin/urunler");
  revalidatePath("/");
}

/* ---------------------------------------------------------------- */
/* Varyantlar                                                        */
/* ---------------------------------------------------------------- */

async function syncProductStock(productId: string) {
  const total = await prisma.productVariant.aggregate({
    where: { productId },
    _sum: { stock: true },
  });
  await prisma.product.update({
    where: { id: productId },
    data: { stock: total._sum.stock ?? 0 },
  });
}

/**
 * Bir renk için birden çok numarayı tek seferde ekler — ayakkabıda tipik akış.
 * Zaten var olan numaralar sessizce atlanır, sonuçta kaç tanesinin eklendiği döner.
 */
export async function addVariants(
  productId: string,
  input: { sizes: string[]; color: string; colorHex?: string | null; stock: number }
) {
  await assertAdmin();

  const color = input.color.trim();
  if (!color) throw new Error("Renk zorunludur.");
  if (!Number.isInteger(input.stock) || input.stock < 0) {
    throw new Error("Stok negatif olamaz.");
  }

  const sizes = Array.from(new Set(input.sizes.map((s) => s.trim()).filter(Boolean)));
  if (sizes.length === 0) throw new Error("En az bir numara seçin.");

  const existing = await prisma.productVariant.findMany({
    where: { productId, color, size: { in: sizes } },
    select: { size: true },
  });
  const taken = new Set(existing.map((v) => v.size));
  const fresh = sizes.filter((s) => !taken.has(s));

  if (fresh.length === 0) {
    throw new Error(`Seçilen numaralar ${color} rengi için zaten ekli.`);
  }

  await prisma.productVariant.createMany({
    data: fresh.map((size) => ({
      productId,
      size,
      color,
      colorHex: input.colorHex?.trim() || null,
      stock: input.stock,
    })),
  });

  await syncProductStock(productId);
  revalidatePath(`/admin/urunler/${productId}`);
  revalidatePath("/admin/urunler");

  return { added: fresh.length, skipped: sizes.length - fresh.length };
}

export async function deleteVariant(variantId: string) {
  await assertAdmin();

  const orderCount = await prisma.orderItem.count({ where: { variantId } });
  if (orderCount > 0) {
    throw new Error("Bu varyant siparişlerde geçiyor, silinemez. Stoğunu 0 yapabilirsiniz.");
  }

  const variant = await prisma.productVariant.delete({
    where: { id: variantId },
    select: { productId: true },
  });

  await syncProductStock(variant.productId);
  revalidatePath(`/admin/urunler/${variant.productId}`);
  revalidatePath("/admin/urunler");
}

export async function setVariantStock(variantId: string, stock: number) {
  await assertAdmin();

  if (!Number.isInteger(stock) || stock < 0) throw new Error("Stok negatif olamaz.");

  const variant = await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock },
    select: { productId: true },
  });

  await syncProductStock(variant.productId);
  revalidatePath(`/admin/urunler/${variant.productId}`);
  revalidatePath("/admin/urunler");
  revalidatePath("/admin");
}
