import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/koleksiyonlar`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/koleksiyon/yeni-gelenler`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/koleksiyon/cok-satanlar`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/koleksiyon/indirim`, changeFrequency: "daily", priority: 0.7 },
  ];

  return [
    ...staticPages,
    ...categories.map((c) => ({
      url: `${base}/koleksiyon/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: `${base}/urun/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
