"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { allowedHostsMessage, isAllowedImageHost } from "@/lib/images";
import { prisma } from "@/lib/prisma";
import { CURATED_SLUGS } from "@/lib/queries";

async function assertAdmin() {
  const session = await requireAdmin();
  if (!session) throw new Error("Bu işlem için yönetici yetkisi gerekiyor.");
}

function clean(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function assertImage(url: string | null, label: string) {
  if (url && !isAllowedImageHost(url)) {
    throw new Error(`${label}: bu adres desteklenmiyor. İzin verilen kaynaklar: ${allowedHostsMessage()}.`);
  }
}

export type HeroInput = {
  subtitle: string;
  title: string;
  description: string;
  image: string;
  buttonText: string;
  link: string;
};

/** Ana sayfa hero'su: sıradaki ilk aktif banner güncellenir, hiç yoksa oluşturulur. */
export async function saveHeroBanner(input: HeroInput) {
  await assertAdmin();

  const title = clean(input.title);
  const image = clean(input.image);
  if (!title) throw new Error("Başlık zorunludur.");
  if (!image) throw new Error("Hero görseli zorunludur.");
  assertImage(image, "Hero görseli");

  const link = clean(input.link) ?? "/koleksiyonlar";
  if (!link.startsWith("/") && !/^https?:\/\//i.test(link)) {
    throw new Error("Buton bağlantısı / ile ya da http(s) ile başlamalıdır.");
  }

  const data = {
    title,
    subtitle: clean(input.subtitle),
    description: clean(input.description),
    image,
    buttonText: clean(input.buttonText) ?? "Koleksiyonu Keşfet",
    link,
  };

  const current = await prisma.banner.findFirst({
    where: { active: true },
    orderBy: { position: "asc" },
    select: { id: true },
  });

  if (current) {
    await prisma.banner.update({ where: { id: current.id }, data });
  } else {
    await prisma.banner.create({ data: { ...data, active: true, position: 0 } });
  }

  revalidatePath("/");
  revalidatePath("/admin/gorunum");
}

export type CollectionBannerInput = {
  eyebrow: string;
  tagline: string;
  image: string;
};

/** Seçki bannerı; boş bırakılan alanlar varsayılana (ve otomatik ürün görseline) döner. */
export async function saveCollectionBanner(slug: string, input: CollectionBannerInput) {
  await assertAdmin();
  if (!CURATED_SLUGS.includes(slug)) throw new Error("Bilinmeyen koleksiyon.");

  const data = {
    eyebrow: clean(input.eyebrow),
    tagline: clean(input.tagline),
    image: clean(input.image),
  };
  assertImage(data.image, "Banner görseli");

  await prisma.collectionBanner.upsert({
    where: { slug },
    update: data,
    create: { slug, ...data },
  });

  revalidatePath("/koleksiyonlar");
  revalidatePath("/admin/gorunum");
}
