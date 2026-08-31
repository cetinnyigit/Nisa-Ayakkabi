import type { Metadata } from "next";
import CategoryCard from "@/components/product/CategoryCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { getAllCategories } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Koleksiyonlar",
  description: "Nisa Ayakkabı'nın el işçiliği koleksiyonlarını keşfedin.",
};

const curated = [
  { slug: "yeni-gelenler", name: "Yeni Gelenler", image: null },
  { slug: "cok-satanlar", name: "Çok Satanlar", image: null },
  { slug: "indirim", name: "İndirim", image: null },
];

export default async function CollectionsPage() {
  const categories = await getAllCategories();

  return (
    <div className="pb-stack-lg pt-stack-md">
      <header className="container-nisa mb-stack-lg text-center">
        <h1 className="mb-4 font-display-lg text-display-lg-mobile text-on-surface md:text-display-lg">
          Koleksiyonlar
        </h1>
        <p className="mx-auto max-w-xl font-body-lg text-body-lg text-on-surface-variant">
          El işçiliğiyle üretilen, sınırlı sayıda parçadan oluşan seçkilerimiz.
        </p>
      </header>

      <section className="container-nisa pb-stack-lg">
        <SectionHeading title="Seçkiler" subtitle="Öne çıkan koleksiyonlar." />
        <div className="grid grid-cols-2 gap-gutter md:grid-cols-3">
          {curated.map((c) => (
            <CategoryCard key={c.slug} category={c} />
          ))}
        </div>
      </section>

      <section className="container-nisa">
        <SectionHeading title="Kategoriler" subtitle="Ürün tipine göre keşfedin." />
        <div className="grid grid-cols-2 gap-gutter md:grid-cols-4">
          {categories.map((c) => (
            <div key={c.slug}>
              <CategoryCard category={c} />
              <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                {c._count.products} ürün
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
