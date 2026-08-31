import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import SearchBox from "@/components/search/SearchBox";
import SectionHeading from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { getAllCategories, getPopularProducts, searchProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export function generateMetadata({
  searchParams,
}: {
  searchParams: { q?: string };
}): Metadata {
  const q = searchParams.q?.trim();
  return {
    title: q ? `"${q}" için arama sonuçları` : "Arama",
    robots: { index: false },
  };
}

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q?.trim() ?? "";
  const tooShort = query.length > 0 && query.length < 2;

  const [{ products, total }, categories, popular] = await Promise.all([
    query.length >= 2 ? searchProducts(query) : Promise.resolve({ products: [], total: 0 }),
    getAllCategories(),
    getPopularProducts(4),
  ]);

  return (
    <div className="container-nisa py-stack-lg">
      <header className="mb-stack-md text-center">
        <h1 className="mb-stack-sm font-display-lg text-display-lg-mobile text-on-surface md:text-display-lg">
          Arama
        </h1>
        <SearchBox initial={query} />
      </header>

      {/* Henüz arama yapılmadı */}
      {query.length === 0 && (
        <section>
          <SectionHeading title="Kategoriler" subtitle="Ya da koleksiyonlara göz atın." />
          <div className="mb-stack-lg flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/koleksiyon/${c.slug}`}
                className="rounded-lg border border-outline-variant px-5 py-3 font-label-caps text-label-caps uppercase text-on-surface-variant transition-colors duration-300 hover:border-primary hover:text-primary"
              >
                {c.name}
              </Link>
            ))}
          </div>

          {popular.length > 0 && (
            <>
              <SectionHeading title="Çok Satanlar" href="/koleksiyon/cok-satanlar" />
              <div className="grid grid-cols-2 gap-gutter md:grid-cols-4">
                {popular.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {tooShort && (
        <p className="py-stack-md text-center font-body-lg text-body-lg text-on-surface-variant">
          Arama yapmak için en az 2 karakter girin.
        </p>
      )}

      {/* Sonuç yok */}
      {query.length >= 2 && products.length === 0 && (
        <section className="text-center">
          <Icon name="search_off" className="mb-4 text-[48px] text-outline-variant" />
          <p className="mb-2 font-headline-sm text-headline-sm text-on-surface">
            &quot;{query}&quot; için sonuç bulunamadı.
          </p>
          <p className="mb-stack-md font-body-md text-body-md text-on-surface-variant">
            Farklı bir kelime deneyin ya da aşağıdaki koleksiyonlara göz atın.
          </p>

          <div className="mb-stack-lg flex flex-wrap justify-center gap-2">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/koleksiyon/${c.slug}`}
                className="rounded-lg border border-outline-variant px-5 py-3 font-label-caps text-label-caps uppercase text-on-surface-variant transition-colors duration-300 hover:border-primary hover:text-primary"
              >
                {c.name}
              </Link>
            ))}
          </div>

          {popular.length > 0 && (
            <div className="text-left">
              <SectionHeading title="Çok Satanlar" href="/koleksiyon/cok-satanlar" />
              <div className="grid grid-cols-2 gap-gutter md:grid-cols-4">
                {popular.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Sonuçlar */}
      {products.length > 0 && (
        <section>
          <p className="mb-stack-sm border-b border-outline-variant pb-4 font-body-md text-body-md text-on-surface-variant">
            <strong className="text-on-surface">{total}</strong> sonuç bulundu
            {total > products.length && ` · ilk ${products.length} tanesi gösteriliyor`}
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
            {products.map((p, i) => (
              <ProductCard key={p.slug} product={p} priority={i < 4} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
