import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import ProductForm from "@/components/admin/ProductForm";
import ProductImages from "@/components/admin/ProductImages";
import ProductVariants from "@/components/admin/ProductVariants";
import { Icon } from "@/components/ui/Icon";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: {
        brand: { select: { name: true } },
        images: { orderBy: { position: "asc" } },
        variants: { orderBy: [{ color: "asc" }, { size: "asc" }] },
      },
    }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { navPosition: "asc" } }),
    prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-container-max">
      <Link
        href="/admin/urunler"
        className="mb-4 inline-flex items-center gap-2 font-label-caps text-label-caps uppercase text-on-surface-variant transition-colors hover:text-primary"
      >
        <Icon name="arrow_back" className="text-[16px]" />
        Ürünler
      </Link>

      <div className="mb-stack-sm flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display-lg text-headline-md text-on-surface">{product.name}</h1>
        <Link
          href={`/urun/${product.slug}`}
          className="inline-flex items-center gap-2 font-label-caps text-label-caps uppercase text-primary hover:underline"
        >
          Mağazada gör
          <Icon name="open_in_new" className="text-[16px]" />
        </Link>
      </div>

      <div className="space-y-stack-sm">
        <ProductImages
          productId={product.id}
          images={product.images}
          uploadEnabled={Boolean(process.env.BLOB_READ_WRITE_TOKEN)}
        />

        <ProductVariants productId={product.id} variants={product.variants} />

        <ProductForm
          categories={categories}
          brands={brands}
          initial={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: toNumber(product.price),
            comparePrice: product.comparePrice == null ? null : toNumber(product.comparePrice),
            sku: product.sku,
            categoryId: product.categoryId,
            brand: product.brand?.name ?? "",
            material: product.material,
            soleMaterial: product.soleMaterial,
            heelHeight: product.heelHeight == null ? null : toNumber(product.heelHeight),
            gender: product.gender,
            season: product.season,
            active: product.active,
            featured: product.featured,
            bestSeller: product.bestSeller,
            newArrival: product.newArrival,
          }}
        />

        <div className="pt-stack-sm">
          <DeleteProductButton productId={product.id} productName={product.name} />
        </div>
      </div>
    </div>
  );
}
