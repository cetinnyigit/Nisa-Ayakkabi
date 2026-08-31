import SafeImage from "@/components/ui/SafeImage";
import CategoryCard from "@/components/product/CategoryCard";
import ProductCard from "@/components/product/ProductCard";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import {
  getActiveBanner,
  getBestSellers,
  getHomeCategories,
  getNewArrivals,
} from "@/lib/queries";

export default async function Home() {
  const [banner, bestSellers, newArrivals, categories] = await Promise.all([
    getActiveBanner(),
    getBestSellers(4),
    getNewArrivals(4),
    getHomeCategories(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative flex h-[600px] items-center justify-center overflow-hidden bg-surface-container-low md:h-[870px]">
        {banner?.image && (
          <SafeImage
            src={banner.image}
            alt=""
            fill
            priority
            // Hero tam genişlik kaplar; kalite varsayılan 75 yerine 90.
            quality={90}
            sizes="100vw"
            className="object-cover object-center"
          />
        )}
        {/* Metnin okunabilmesi için alttan yukarı incelen perde. Görseli
            yıkamasın diye üst kısım tamamen şeffaf bırakıldı. */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/5" />
        <div className="container-nisa relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
          {banner?.subtitle && (
            <span className="mb-4 font-label-caps text-label-caps uppercase tracking-[0.2em] text-tertiary">
              {banner.subtitle}
            </span>
          )}
          <h1 className="mb-6 font-display-lg text-display-lg-mobile text-on-surface md:text-display-lg">
            {banner?.title ?? "El İşçiliği Modern Zarafetle Buluşuyor."}
          </h1>
          {banner?.description && (
            <p className="mx-auto mb-10 max-w-xl font-body-lg text-body-lg text-on-surface-variant">
              {banner.description}
            </p>
          )}
          <Button href={banner?.link ?? "/koleksiyonlar"} size="lg">
            {banner?.buttonText ?? "Koleksiyonu Keşfet"}
          </Button>
        </div>
      </section>

      {/* Çok Satanlar */}
      {bestSellers.length > 0 && (
        <section className="container-nisa py-stack-lg">
          <SectionHeading
            title="Çok Satanlar"
            subtitle="En çok tercih edilen tasarımlarımız."
            href="/koleksiyon/cok-satanlar"
          />
          <div className="grid grid-cols-2 gap-gutter md:grid-cols-4">
            {bestSellers.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Yeni Gelenler */}
      {newArrivals.length > 0 && (
        <section className="container-nisa py-stack-lg">
          <SectionHeading
            title="Yeni Gelenler"
            subtitle="Sezonun en taze parçaları."
            href="/koleksiyon/yeni-gelenler"
          />
          <div className="grid grid-cols-2 gap-gutter md:grid-cols-4">
            {newArrivals.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Kategoriler */}
      {categories.length > 0 && (
        <section className="container-nisa py-stack-lg">
          <SectionHeading title="Kategoriler" subtitle="Stilinizi tamamlayan özel koleksiyonlar." />
          <div className="grid grid-cols-2 gap-gutter md:grid-cols-4">
            {categories.map((c) => (
              <CategoryCard key={c.slug} category={c} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
