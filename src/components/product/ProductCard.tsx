import SafeImage from "@/components/ui/SafeImage";
import Link from "next/link";
import QuickAdd from "./QuickAdd";
import { cn, formatPrice } from "@/lib/utils";

export type ProductCardData = {
  slug: string;
  name: string;
  price: number | string;
  comparePrice?: number | string | null;
  image?: string | null;
  imageAlt?: string | null;
  /** Sol üst rozet: "Yeni", "Çok Satan" vb. */
  badge?: string | null;
};

type ProductCardProps = {
  product: ProductCardData;
  className?: string;
  priority?: boolean;
};

/**
 * Minimal ürün kartı: çerçevesiz, tipografi görselin altında.
 * Hover'da görsel 700ms'de hafifçe büyür (Soft Luxury tempo).
 */
export function ProductCard({ product, className, priority = false }: ProductCardProps) {
  const { slug, name, price, comparePrice, image, imageAlt, badge } = product;
  const hasDiscount = comparePrice != null && Number(comparePrice) > Number(price);

  return (
    <Link href={`/urun/${slug}`} className={cn("group block", className)}>
      <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-lg bg-surface-container-low">
        {image ? (
          <SafeImage
            src={image}
            alt={imageAlt ?? name}
            fill
            priority={priority}
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-label-caps text-label-caps uppercase text-on-surface-variant/40">
            Görsel yok
          </div>
        )}

        {badge && (
          <span className="absolute left-3 top-3 rounded bg-surface/80 px-3 py-1.5 font-label-caps text-label-caps uppercase text-primary backdrop-blur-md">
            {badge}
          </span>
        )}

        <QuickAdd slug={slug} />
      </div>

      <h3 className="mb-1 font-body-md text-body-md text-on-surface">{name}</h3>
      <p className="flex items-baseline gap-2 font-body-sm text-body-sm text-on-surface-variant">
        <span className={cn(hasDiscount && "text-error")}>{formatPrice(price)}</span>
        {hasDiscount && (
          <span className="text-on-surface-variant/60 line-through">
            {formatPrice(comparePrice!)}
          </span>
        )}
      </p>
    </Link>
  );
}

export default ProductCard;
