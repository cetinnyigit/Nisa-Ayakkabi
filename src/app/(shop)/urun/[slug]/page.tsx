import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/product/ProductGallery";
import ProductPurchasePanel from "@/components/product/ProductPurchasePanel";
import ProductCard from "@/components/product/ProductCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { shippingSummary } from "@/lib/shipping";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Ürün bulunamadı" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.images[0]?.url ? [product.images[0].url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categoryId, product.slug);

  const details = [
    product.material && `Saya: ${product.material}`,
    product.soleMaterial && `Taban: ${product.soleMaterial}`,
    product.heelHeight != null && `Topuk yüksekliği: ${product.heelHeight} cm`,
    product.brand?.name && `Marka: ${product.brand.name}`,
    product.sku && `Ürün kodu: ${product.sku}`,
  ].filter(Boolean) as string[];

  return (
    <div className="container-nisa py-stack-lg">
      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12 lg:gap-margin-desktop">
        {/* Galeri */}
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} name={product.name} />
        </div>

        {/* Detaylar */}
        <div className="flex h-fit flex-col pt-stack-sm lg:sticky lg:top-32 lg:col-span-5 lg:pt-0">
          <nav className="mb-4 flex items-center gap-2 font-label-caps text-label-caps uppercase text-on-surface-variant">
            <Link href="/koleksiyonlar" className="transition-colors hover:text-primary">
              Koleksiyonlar
            </Link>
            <span>/</span>
            <Link
              href={`/koleksiyon/${product.category.slug}`}
              className="transition-colors hover:text-primary"
            >
              {product.category.name}
            </Link>
          </nav>

          <h1 className="mb-2 font-display-lg text-display-lg-mobile text-on-surface md:text-display-lg">
            {product.name}
          </h1>

          <ProductPurchasePanel
            productId={product.id}
            slug={product.slug}
            name={product.name}
            basePrice={product.price}
            image={product.images[0]?.url ?? null}
            variants={product.variants}
          />

          <p className="mb-stack-md font-body-md text-body-md leading-relaxed text-on-surface-variant">
            {product.description}
          </p>

          {/* Akordeonlar */}
          <div className="divide-y divide-outline-variant/30 border-t border-outline-variant/30">
            <details className="group py-4" open>
              <summary className="flex cursor-pointer list-none items-center justify-between font-label-caps text-label-caps uppercase text-on-surface">
                Detaylar ve Bakım
                <Icon
                  name="expand_more"
                  className="text-tertiary transition-transform duration-300 group-open:rotate-180"
                />
              </summary>
              <div className="pt-4 font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                <ul className="list-disc space-y-2 pl-4">
                  {details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                  <li>Yumuşak, kuru bir bezle temizleyin. Kendi toz torbasında saklayın.</li>
                </ul>
              </div>
            </details>

            <details className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-label-caps text-label-caps uppercase text-on-surface">
                Teslimat ve İade
                <Icon
                  name="expand_more"
                  className="text-tertiary transition-transform duration-300 group-open:rotate-180"
                />
              </summary>
              <div className="pt-4 font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                {shippingSummary()} Saat 16:00&apos;ya kadar verilen
                siparişler aynı gün kargoda. İadeler, kullanılmamış ve orijinal ambalajında olmak
                kaydıyla teslimattan sonraki 14 gün içinde kabul edilir.
              </div>
            </details>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="pt-stack-lg">
          <SectionHeading
            title="Bunlar da İlginizi Çekebilir"
            href={`/koleksiyon/${product.category.slug}`}
          />
          <div className="grid grid-cols-2 gap-gutter md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
