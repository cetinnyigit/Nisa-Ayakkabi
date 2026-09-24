import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { Icon } from "@/components/ui/Icon";
import { prisma } from "@/lib/prisma";
import { isBlobConfigured } from "@/lib/blob";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { navPosition: "asc" } }),
    prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-container-max">
      <Link
        href="/admin/urunler"
        className="mb-4 inline-flex items-center gap-2 font-label-caps text-label-caps uppercase text-on-surface-variant transition-colors hover:text-primary"
      >
        <Icon name="arrow_back" className="text-[16px]" />
        Ürünler
      </Link>

      <h1 className="mb-2 font-display-lg text-headline-md text-on-surface">Yeni Ürün</h1>
      <p className="mb-stack-sm font-body-md text-body-md text-on-surface-variant">
        Görseller, numaralar ve ürün bilgileri aynı formda doldurulur; hepsi tek seferde
        kaydedilir.
      </p>

      <ProductForm
        categories={categories}
        brands={brands}
        uploadEnabled={isBlobConfigured()}
        initial={{
          name: "",
          description: "",
          price: 0,
          comparePrice: null,
          sku: "",
          categoryId: "",
          brand: "",
          material: "",
          soleMaterial: "",
          heelHeight: null,
          gender: "kadin",
          season: "4mevsim",
          active: true,
          featured: false,
          bestSeller: false,
          newArrival: true,
        }}
      />
    </div>
  );
}
