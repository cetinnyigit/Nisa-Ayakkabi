import SafeImage from "@/components/ui/SafeImage";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export type CategoryCardData = {
  slug: string;
  name: string;
  image?: string | null;
};

export function CategoryCard({
  category,
  className,
}: {
  category: CategoryCardData;
  className?: string;
}) {
  return (
    <Link href={`/koleksiyon/${category.slug}`} className={cn("group block", className)}>
      <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-lg bg-surface-container-low">
        {category.image && (
          <SafeImage
            src={category.image}
            alt={category.name}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-black/5 transition-colors duration-300 group-hover:bg-black/0" />
      </div>
      <div className="flex items-center justify-between">
        <span className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface">
          {category.name}
        </span>
        <Icon
          name="arrow_forward"
          className="text-[18px] text-tertiary transition-transform duration-300 group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}

export default CategoryCard;
