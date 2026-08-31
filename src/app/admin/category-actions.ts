"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { allowedHostsMessage, isAllowedImageHost } from "@/lib/images";
import { prisma } from "@/lib/prisma";
import { NAV_CACHE_TAG } from "@/lib/queries";
import { slugify } from "@/lib/utils";

async function assertAdmin() {
  const session = await requireAdmin();
  if (!session) throw new Error("Bu işlem için yönetici yetkisi gerekiyor.");
}

export type CategoryInput = {
  name: string;
  nameEn: string;
  slug?: string;
  description?: string | null;
  descriptionEn?: string | null;
  image?: string | null;
  showInNav: boolean;
  navPosition: number;
  showOnHome: boolean;
  homePosition: number;
};

function validate(input: CategoryInput) {
  if (!input.name?.trim()) throw new Error("Kategori adı zorunludur.");
  if (!input.nameEn?.trim()) throw new Error("İngilizce kategori adı zorunludur.");
  if (input.image) {
    if (!/^https?:\/\//i.test(input.image)) {
      throw new Error("Görsel adresi http(s) ile başlamalıdır.");
    }
    if (!isAllowedImageHost(input.image)) {
      throw new Error(
        `Bu adres desteklenmiyor. İzin verilen kaynaklar: ${allowedHostsMessage()}.`
      );
    }
  }
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base);
  if (!root) throw new Error("Geçerli bir kategori adı girin.");

  let candidate = root;
  let suffix = 1;
  for (;;) {
    const existing = await prisma.category.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    suffix += 1;
    candidate = `${root}-${suffix}`;
  }
}

function revalidateAll() {
  revalidatePath("/admin/kategoriler");
  revalidatePath("/koleksiyonlar");
  revalidatePath("/", "layout");
  // Menü kategorileri ayrıca önbellekleniyor; yol tazelemesi onu kapsamaz.
  revalidateTag(NAV_CACHE_TAG);
}

export async function createCategory(input: CategoryInput) {
  await assertAdmin();
  validate(input);

  const slug = await uniqueSlug(input.slug?.trim() || input.name);

  const category = await prisma.category.create({
    data: {
      name: input.name.trim(),
      nameEn: input.nameEn.trim(),
      slug,
      description: input.description?.trim() || null,
      descriptionEn: input.descriptionEn?.trim() || null,
      image: input.image?.trim() || null,
      showInNav: input.showInNav,
      navPosition: input.navPosition,
      showOnHome: input.showOnHome,
      homePosition: input.homePosition,
    },
    select: { id: true },
  });

  revalidateAll();
  return category.id;
}

export async function updateCategory(categoryId: string, input: CategoryInput) {
  await assertAdmin();
  validate(input);

  const slug = await uniqueSlug(input.slug?.trim() || input.name, categoryId);

  await prisma.category.update({
    where: { id: categoryId },
    data: {
      name: input.name.trim(),
      nameEn: input.nameEn.trim(),
      slug,
      description: input.description?.trim() || null,
      descriptionEn: input.descriptionEn?.trim() || null,
      image: input.image?.trim() || null,
      showInNav: input.showInNav,
      navPosition: input.navPosition,
      showOnHome: input.showOnHome,
      homePosition: input.homePosition,
    },
  });

  revalidateAll();
  revalidatePath(`/koleksiyon/${slug}`);
}

export async function deleteCategory(categoryId: string) {
  await assertAdmin();

  const [productCount, childCount] = await Promise.all([
    prisma.product.count({ where: { categoryId } }),
    prisma.category.count({ where: { parentId: categoryId } }),
  ]);

  // Ürünü olan kategori silinemez: ürünler kategorisiz kalamaz (categoryId zorunlu).
  if (productCount > 0) {
    throw new Error(
      `Bu kategoride ${productCount} ürün var. Önce ürünleri başka bir kategoriye taşıyın.`
    );
  }
  if (childCount > 0) {
    throw new Error(`Bu kategorinin ${childCount} alt kategorisi var. Önce onları silin.`);
  }

  await prisma.category.delete({ where: { id: categoryId } });
  revalidateAll();
}
