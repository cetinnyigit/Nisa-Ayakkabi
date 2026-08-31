import Link from "next/link";
import ProductRow from "@/components/admin/ProductRow";
import { Icon } from "@/components/ui/Icon";
import { getAdminProducts } from "@/lib/admin-queries";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();
  const activeCount = products.filter((p) => p.active).length;

  return (
    <div className="mx-auto max-w-container-max">
      <header className="mb-stack-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-2 font-display-lg text-headline-md text-on-surface">Ürünler</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {products.length} ürün · {activeCount} tanesi satışta
          </p>
        </div>
        <Link
          href="/admin/urunler/yeni"
          className="inline-flex items-center gap-2 rounded bg-tertiary px-6 py-3 font-label-caps text-label-caps uppercase text-on-tertiary transition-colors duration-300 hover:bg-on-tertiary-fixed-variant"
        >
          <Icon name="add" className="text-[18px]" />
          Yeni Ürün
        </Link>
      </header>

      <div className="overflow-x-auto rounded-lg bg-surface-container-lowest p-6 shadow-ambient">
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className="border-b border-outline-variant/30">
              {[
                "Ürün",
                "Fiyat",
                "Stok",
                "Vitrin (öne çıkan / çok satan / yeni)",
                "Satışta",
                "",
              ].map(
                (h) => (
                  <th
                    key={h}
                    className="pb-4 pr-4 font-label-caps text-label-caps uppercase text-on-surface-variant"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 font-body-sm text-body-sm text-on-surface-variant">
        Fiyata tıklayarak hızlıca düzenleyebilirsiniz. Görsel, varyant ve diğer alanlar için
        &quot;Düzenle&quot; bağlantısını kullanın.
      </p>
    </div>
  );
}
