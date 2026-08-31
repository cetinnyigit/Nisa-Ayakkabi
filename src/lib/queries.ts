import { unstable_cache } from "next/cache";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { ProductCardData } from "@/components/product/ProductCard";
import type { NavItem } from "@/components/layout/Header";
import { toNumber } from "@/lib/utils";

/**
 * Prisma kayıtlarını kart bileşeninin beklediği düz nesneye çevirir.
 * Decimal alanları client'a geçmeden number'a düşürülür.
 */
type ProductWithImages = {
  slug: string;
  name: string;
  price: unknown;
  comparePrice: unknown;
  newArrival: boolean;
  bestSeller: boolean;
  images: { url: string; alt: string | null }[];
};

function toCardData(p: ProductWithImages): ProductCardData {
  return {
    slug: p.slug,
    name: p.name,
    price: toNumber(p.price as never),
    comparePrice: p.comparePrice == null ? null : toNumber(p.comparePrice as never),
    image: p.images[0]?.url ?? null,
    imageAlt: p.images[0]?.alt ?? null,
    badge: p.newArrival ? "Yeni" : p.bestSeller ? "Çok Satan" : null,
  };
}

const cardSelect = {
  slug: true,
  name: true,
  price: true,
  comparePrice: true,
  newArrival: true,
  bestSeller: true,
  images: {
    select: { url: true, alt: true },
    orderBy: { position: "asc" },
    take: 1,
  },
} as const;

export async function getBestSellers(limit = 4): Promise<ProductCardData[]> {
  const products = await prisma.product.findMany({
    where: { active: true, bestSeller: true },
    select: cardSelect,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return products.map(toCardData);
}

export async function getNewArrivals(limit = 4): Promise<ProductCardData[]> {
  const products = await prisma.product.findMany({
    where: { active: true, newArrival: true },
    select: cardSelect,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return products.map(toCardData);
}

export async function getHomeCategories() {
  return prisma.category.findMany({
    where: { showOnHome: true },
    select: { slug: true, name: true, image: true },
    orderBy: { homePosition: "asc" },
  });
}

/** Kategori yönetiminde bu etiket geçersizleştirilir. */
export const NAV_CACHE_TAG = "nav-items";

// Menü her vitrin sayfasının layout'unda çiziliyor; önbelleğe alınmazsa her
// gezinmede fazladan bir veritabanı gidiş-dönüşü oluyor. Kategoriler ise nadiren
// değişir, değiştiğinde de etiket üzerinden anında tazeleniyor.
const loadNavCategories = unstable_cache(
  async () =>
    prisma.category.findMany({
      where: { showInNav: true },
      select: { slug: true, name: true },
      orderBy: { navPosition: "asc" },
    }),
  ["nav-categories"],
  { tags: [NAV_CACHE_TAG] }
);

export async function getNavItems(): Promise<NavItem[]> {
  const categories = await loadNavCategories();

  return [
    { label: "Yeni Gelenler", href: "/koleksiyon/yeni-gelenler" },
    ...categories.map((c) => ({ label: c.name, href: `/koleksiyon/${c.slug}` })),
    { label: "Koleksiyonlar", href: "/koleksiyonlar" },
  ];
}

/* ---------------------------------------------------------------- */
/* Koleksiyon listeleme                                              */
/* ---------------------------------------------------------------- */

export type SortKey = "en-yeni" | "fiyat-artan" | "fiyat-azalan";

export type CollectionFilters = {
  sizes?: string[];
  colors?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: SortKey;
  limit?: number;
};

/** Kategori slug'ı olmayan sanal koleksiyonlar. */
const virtualCollections: Record<string, { title: string; where: object }> = {
  "yeni-gelenler": { title: "Yeni Gelenler", where: { newArrival: true } },
  "cok-satanlar": { title: "Çok Satanlar", where: { bestSeller: true } },
  indirim: { title: "İndirim", where: { comparePrice: { not: null } } },
};

export async function getCollection(slug: string) {
  const virtual = virtualCollections[slug];
  if (virtual) {
    return { title: virtual.title, description: null as string | null, where: virtual.where };
  }

  const category = await prisma.category.findUnique({
    where: { slug },
    select: { id: true, name: true, description: true },
  });
  if (!category) return null;

  return {
    title: category.name,
    description: category.description,
    where: { categoryId: category.id },
  };
}

const sortOrder: Record<SortKey, object> = {
  "en-yeni": { createdAt: "desc" },
  "fiyat-artan": { price: "asc" },
  "fiyat-azalan": { price: "desc" },
};

export async function getCollectionProducts(
  baseWhere: object,
  filters: CollectionFilters
): Promise<{ products: ProductCardData[]; total: number }> {
  const { sizes, colors, minPrice, maxPrice, sort = "en-yeni", limit = 12 } = filters;

  const where = {
    active: true,
    ...baseWhere,
    ...(sizes?.length ? { variants: { some: { size: { in: sizes } } } } : {}),
    ...(colors?.length ? { variants: { some: { color: { in: colors } } } } : {}),
    ...(minPrice != null || maxPrice != null
      ? {
          price: {
            ...(minPrice != null ? { gte: minPrice } : {}),
            ...(maxPrice != null ? { lte: maxPrice } : {}),
          },
        }
      : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: cardSelect,
      orderBy: sortOrder[sort],
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return { products: products.map(toCardData), total };
}

/** Filtre panelinin seçeneklerini gerçek varyantlardan üretir. */
export async function getFilterOptions() {
  const [variants, priceRange] = await Promise.all([
    prisma.productVariant.findMany({
      where: { product: { active: true } },
      select: { size: true, color: true, colorHex: true },
      distinct: ["size", "color"],
    }),
    prisma.product.aggregate({
      where: { active: true },
      _min: { price: true },
      _max: { price: true },
    }),
  ]);

  const sizes = Array.from(new Set(variants.map((v) => v.size))).sort(
    (a, b) => Number(a) - Number(b)
  );

  const colorMap = new Map<string, string | null>();
  for (const v of variants) {
    if (!colorMap.has(v.color)) colorMap.set(v.color, v.colorHex);
  }

  return {
    sizes,
    colors: Array.from(colorMap, ([name, hex]) => ({ name, hex })),
    minPrice: priceRange._min.price ? Math.floor(toNumber(priceRange._min.price)) : 0,
    maxPrice: priceRange._max.price ? Math.ceil(toNumber(priceRange._max.price)) : 10000,
  };
}

/** Türkçe aksanları ASCII karşılığına indirger: "Süet" → "suet". */
function foldTurkish(value: string): string {
  const map: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i", I: "i",
    ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
    â: "a", Â: "a", î: "i", Î: "i", û: "u", Û: "u",
  };
  return value.replace(/[çÇğĞıİIöÖşŞüÜâÂîÎûÛ]/g, (ch) => map[ch] ?? ch).toLowerCase();
}

// Postgres translate() için aynı eşleme. İki dizinin uzunluğu birebir aynı olmalı.
const PG_FROM = "çÇğĞıİIöÖşŞüÜâÂîÎûÛ";
const PG_TO = "ccggiiioossuuaaiiuu";

/**
 * Ürün araması. Aksan duyarsızdır: "suet" yazan da "Süet Bot"u bulur.
 * Prisma'nın `contains` filtresi aksan katlaması yapmadığı için eşleşen
 * kimlikler ham SQL ile bulunur, ardından normal sorguyla çekilir.
 */
export async function searchProducts(
  query: string,
  limit = 24
): Promise<{ products: ProductCardData[]; total: number }> {
  const q = query.trim();
  if (q.length < 2) return { products: [], total: 0 };
  // Aşırı uzun sorgular gereksiz tam tarama yaratır
  if (q.length > 100) return { products: [], total: 0 };

  // LIKE joker karakterleri kaçışlanmazsa "%%%" gibi bir sorgu TÜM ürünleri
  // döndürür ve büyük katalogda tam tarama yaptırır. ESCAPE ile etkisizleştirilir.
  const escaped = foldTurkish(q).replace(/([\\%_])/g, "\\$1");
  const pattern = `%${escaped}%`;

  const matches = await prisma.$queryRaw<{ id: string }[]>`
    SELECT p.id
    FROM products p
    LEFT JOIN categories c ON c.id = p."categoryId"
    LEFT JOIN brands b ON b.id = p."brandId"
    WHERE p.active = true AND (
         lower(translate(p.name,          ${PG_FROM}, ${PG_TO})) LIKE ${pattern} ESCAPE '\'
      OR lower(translate(p."nameEn",      ${PG_FROM}, ${PG_TO})) LIKE ${pattern} ESCAPE '\'
      OR lower(translate(p.description,   ${PG_FROM}, ${PG_TO})) LIKE ${pattern} ESCAPE '\'
      OR lower(translate(coalesce(p.sku, ''),      ${PG_FROM}, ${PG_TO})) LIKE ${pattern} ESCAPE '\'
      OR lower(translate(coalesce(p.material, ''), ${PG_FROM}, ${PG_TO})) LIKE ${pattern} ESCAPE '\'
      OR lower(translate(coalesce(c.name, ''),     ${PG_FROM}, ${PG_TO})) LIKE ${pattern} ESCAPE '\'
      OR lower(translate(coalesce(b.name, ''),     ${PG_FROM}, ${PG_TO})) LIKE ${pattern} ESCAPE '\'
    )
    LIMIT 500
  `;

  const ids = matches.map((m) => m.id);
  if (ids.length === 0) return { products: [], total: 0 };

  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: cardSelect,
    orderBy: [{ bestSeller: "desc" }, { createdAt: "desc" }],
    take: limit,
  });

  return { products: products.map(toCardData), total: ids.length };
}

/** Sonuç bulunamadığında öneri olarak gösterilir. */
export async function getPopularProducts(limit = 4): Promise<ProductCardData[]> {
  const products = await prisma.product.findMany({
    where: { active: true, bestSeller: true },
    select: cardSelect,
    take: limit,
  });
  return products.map(toCardData);
}

export async function getAllCategories() {
  return prisma.category.findMany({
    select: { slug: true, name: true, image: true, _count: { select: { products: true } } },
    orderBy: { navPosition: "asc" },
  });
}

/* ---------------------------------------------------------------- */
/* Ürün detayı                                                       */
/* ---------------------------------------------------------------- */

/**
 * React cache'i ile sarılı: ürün sayfası bu veriyi hem generateMetadata'da hem
 * de render'da istiyor. Sarılmazsa aynı istek içinde iki kez sorgulanır.
 */
export const getProductBySlug = cache(async (slug: string) => {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: { select: { slug: true, name: true } },
      brand: { select: { name: true } },
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: [{ color: "asc" }, { size: "asc" }] },
    },
  });
  if (!product || !product.active) return null;

  // Decimal alanları client bileşenlerine geçmeden düzleştir
  return {
    ...product,
    price: toNumber(product.price),
    comparePrice: product.comparePrice == null ? null : toNumber(product.comparePrice),
    heelHeight: product.heelHeight == null ? null : toNumber(product.heelHeight),
    variants: product.variants.map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      colorHex: v.colorHex,
      stock: v.stock,
      price: v.price == null ? null : toNumber(v.price),
    })),
  };
});

export async function getRelatedProducts(
  categoryId: string,
  excludeSlug: string,
  limit = 4
): Promise<ProductCardData[]> {
  const products = await prisma.product.findMany({
    where: { active: true, categoryId, slug: { not: excludeSlug } },
    select: cardSelect,
    orderBy: { bestSeller: "desc" },
    take: limit,
  });
  return products.map(toCardData);
}

export async function getAllProductSlugs() {
  return prisma.product.findMany({ where: { active: true }, select: { slug: true } });
}

export async function getActiveBanner() {
  return prisma.banner.findFirst({
    where: { active: true },
    orderBy: { position: "asc" },
  });
}
