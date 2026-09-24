import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export type CollectionBannerData = {
  slug: string;
  name: string;
  eyebrow: string;
  tagline: string;
  image: string | null;
  count: number;
};

/** Görsel yoksa kullanılan, seçkiye özgü renk geçişleri. */
const fallbackBg: Record<string, string> = {
  "yeni-gelenler": "from-primary-container to-primary",
  "cok-satanlar": "from-tertiary-container to-tertiary",
  indirim: "from-primary to-on-primary-fixed",
};

export function CollectionBanner({
  collection,
  priority,
  className,
}: {
  collection: CollectionBannerData;
  priority?: boolean;
  className?: string;
}) {
  const { slug, name, eyebrow, tagline, image, count } = collection;

  return (
    <Link
      href={`/koleksiyon/${slug}`}
      className={cn(
        "group relative block aspect-[4/5] overflow-hidden rounded-lg shadow-ambient",
        className
      )}
    >
      {image ? (
        <SafeImage
          src={image}
          alt={name}
          fill
          priority={priority}
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br",
            fallbackBg[slug] ?? "from-primary-container to-primary"
          )}
        />
      )}

      {/* Metnin her görselde okunması için alttan koyulaşan örtü */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent transition-colors duration-500 group-hover:from-black/80" />

      {slug === "indirim" && (
        <span className="absolute right-4 top-4 rounded-full bg-surface/90 px-3 py-1 font-label-caps text-label-caps uppercase text-primary backdrop-blur-md">
          İndirim
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
        <span className="mb-3 inline-block border-b border-primary-fixed-dim pb-1 font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary-fixed-dim">
          {eyebrow}
        </span>
        <h3 className="mb-2 font-headline-md text-headline-md">{name}</h3>
        <p className="mb-5 font-body-md text-body-md text-white/85">
          {tagline}
          {count > 0 && <span className="text-white/60"> · {count} ürün</span>}
        </p>
        <span className="inline-flex items-center gap-2 font-label-caps text-label-caps uppercase tracking-widest">
          Keşfet
          <Icon
            name="arrow_forward"
            className="text-[18px] transition-transform duration-300 group-hover:translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}

export default CollectionBanner;
