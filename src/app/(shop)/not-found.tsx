import Link from "next/link";
import Button from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/**
 * Mağaza içi 404 (bulunamayan ürün, koleksiyon, sipariş).
 * (shop) layout'u içinde render edildiği için başlık ve altbilgi korunur.
 */
export default function ShopNotFound() {
  return (
    <div className="container-nisa py-stack-lg">
      <div className="mx-auto max-w-xl text-center">
        <Icon name="search_off" className="mb-6 text-[56px] text-outline-variant" />

        <p className="mb-2 font-label-caps text-label-caps uppercase tracking-[0.2em] text-on-surface-variant">
          Hata 404
        </p>
        <h1 className="mb-4 font-display-lg text-display-lg-mobile text-on-surface md:text-display-lg">
          Aradığınızı bulamadık.
        </h1>
        <p className="mb-stack-md font-body-lg text-body-lg text-on-surface-variant">
          Bu ürün kaldırılmış ya da adres yanlış olabilir. Koleksiyonlarımıza göz atabilir veya
          arama yapabilirsiniz.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Button href="/koleksiyonlar" size="lg">
            Koleksiyonları Keşfet
          </Button>
          <Link
            href="/arama"
            className="inline-flex items-center gap-2 rounded-lg border border-primary-container px-8 py-4 font-label-caps text-label-caps uppercase text-primary transition-colors duration-300 hover:bg-primary-fixed/40"
          >
            <Icon name="search" className="text-[18px]" />
            Arama Yap
          </Link>
        </div>
      </div>
    </div>
  );
}
