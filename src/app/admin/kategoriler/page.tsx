import CategoryEditor from "@/components/admin/CategoryEditor";
import CategoryRow from "@/components/admin/CategoryRow";
import { getAdminCategories } from "@/lib/admin-queries";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const [categories, full] = await Promise.all([
    getAdminCategories(),
    prisma.category.findMany({
      orderBy: { navPosition: "asc" },
      include: { _count: { select: { products: true } } },
    }),
  ]);

  const editable = full.map((c) => ({
    id: c.id,
    name: c.name,
    nameEn: c.nameEn,
    slug: c.slug,
    description: c.description,
    descriptionEn: c.descriptionEn,
    image: c.image,
    showInNav: c.showInNav,
    navPosition: c.navPosition,
    showOnHome: c.showOnHome,
    homePosition: c.homePosition,
    productCount: c._count.products,
  }));

  return (
    <div className="mx-auto max-w-container-max">
      <header className="mb-stack-sm">
        <h1 className="mb-2 font-display-lg text-headline-md text-on-surface">Kategoriler</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {categories.length} kategori. Menü ve ana sayfa görünürlüğü buradan yönetilir.
        </p>
      </header>

      <CategoryEditor categories={editable} />

      <div className="overflow-x-auto rounded-lg bg-surface-container-lowest p-6 shadow-ambient">
        <table className="w-full min-w-[800px] text-left">
          <thead>
            <tr className="border-b border-outline-variant/30">
              {["Kategori", "Ürün", "Menüde (sıra)", "Ana sayfada (sıra)"].map((h) => (
                <th
                  key={h}
                  className="pb-4 pr-4 font-label-caps text-label-caps uppercase text-on-surface-variant"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <CategoryRow key={category.id} category={category} />
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 font-body-sm text-body-sm text-on-surface-variant">
        Değişiklikler anında yayına girer — menü ve ana sayfa yeniden oluşturulur. Ürünü olan
        kategori silinemez.
      </p>
    </div>
  );
}
