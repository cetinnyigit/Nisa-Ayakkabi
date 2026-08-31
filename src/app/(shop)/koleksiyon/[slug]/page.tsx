import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FilterSidebar from "@/components/collection/FilterSidebar";
import MobileFilters from "@/components/collection/MobileFilters";
import SortSelect from "@/components/collection/SortSelect";
import ProductCard from "@/components/product/ProductCard";
import {
  getCollection,
  getCollectionProducts,
  getFilterOptions,
  type SortKey,
} from "@/lib/queries";

const PAGE_SIZE = 12;
/** "Daha Fazla Göster" ile çıkılabilecek üst sınır — sınırsız sorguyu engeller. */
const MAX_LIMIT = 120;
const validSorts: SortKey[] = ["en-yeni", "fiyat-artan", "fiyat-azalan"];

/** Kullanıcıdan gelen sayısal parametreyi güvenli aralığa çeker. */
function clampNumber(raw: unknown, fallback: number, min: number, max: number): number {
  const value = Number(raw);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(Math.max(Math.trunc(value), min), max);
}

type SearchParams = Record<string, string | string[] | undefined>;

function toArray(value: string | string[] | undefined): string[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const collection = await getCollection(params.slug);
  if (!collection) return { title: "Koleksiyon bulunamadı" };
  return {
    title: collection.title,
    description: collection.description ?? undefined,
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: SearchParams;
}) {
  const collection = await getCollection(params.slug);
  if (!collection) notFound();

  const sortParam = searchParams.sirala;
  const sort = validSorts.includes(sortParam as SortKey) ? (sortParam as SortKey) : "en-yeni";
  const limit = clampNumber(searchParams.adet, PAGE_SIZE, PAGE_SIZE, MAX_LIMIT);
  const maxPrice = searchParams.max
    ? clampNumber(searchParams.max, 0, 0, 10_000_000) || undefined
    : undefined;

  const [options, { products, total }] = await Promise.all([
    getFilterOptions(),
    getCollectionProducts(collection.where, {
      // Filtre değerleri de sınırlanır: yüzlerce değerle şişirilmiş sorgu gelmesin
      sizes: toArray(searchParams.numara).slice(0, 30),
      colors: toArray(searchParams.renk).slice(0, 30),
      maxPrice,
      sort,
      limit,
    }),
  ]);

  const hasMore = products.length < total;
  const moreParams = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "adet") continue;
    toArray(value).forEach((v) => moreParams.append(key, v));
  }
  moreParams.set("adet", String(Math.min(limit + PAGE_SIZE, MAX_LIMIT)));

  return (
    <div className="pb-stack-lg pt-stack-md">
      <header className="container-nisa mb-stack-md text-center">
        <h1 className="mb-4 font-display-lg text-display-lg-mobile text-on-surface md:text-display-lg">
          {collection.title}
        </h1>
        {collection.description && (
          <p className="mx-auto max-w-xl font-body-lg text-body-lg text-on-surface-variant">
            {collection.description}
          </p>
        )}
      </header>

      <div className="container-nisa flex flex-col gap-gutter lg:flex-row">
        {/* Mobil: filtre butonu + sıralama */}
        <div className="mb-6 flex items-center justify-between border-b border-outline-variant pb-4 lg:hidden">
          <MobileFilters options={options} />
          <SortSelect />
        </div>

        <aside className="hidden h-fit w-64 flex-shrink-0 lg:sticky lg:top-32 lg:block">
          <FilterSidebar options={options} />
        </aside>

        <div className="flex-grow">
          <div className="mb-8 hidden items-center justify-between border-b border-outline-variant pb-4 lg:flex">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {total} ürün{products.length < total && ` içinden ${products.length} tanesi`}{" "}
              gösteriliyor
            </span>
            <SortSelect />
          </div>

          {products.length === 0 ? (
            <div className="py-stack-lg text-center">
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Seçtiğiniz filtrelere uyan ürün bulunamadı.
              </p>
              <Link
                href={`/koleksiyon/${params.slug}`}
                className="mt-4 inline-block font-label-caps text-label-caps uppercase text-primary hover:underline"
              >
                Filtreleri temizle
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p, i) => (
                <ProductCard key={p.slug} product={p} priority={i < 3} />
              ))}
            </div>
          )}

          {hasMore && (
            <div className="mt-stack-md flex justify-center">
              <Link
                href={`/koleksiyon/${params.slug}?${moreParams.toString()}`}
                scroll={false}
                className="inline-flex items-center justify-center rounded-lg border border-primary-container px-8 py-4 font-label-caps text-label-caps uppercase text-primary transition-colors duration-300 hover:bg-primary-fixed/40"
              >
                Daha Fazla Göster
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
