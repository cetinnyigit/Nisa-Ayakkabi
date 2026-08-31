import Image, { type ImageProps } from "next/image";
import { isAllowedImageHost } from "@/lib/images";

type SafeImageProps = Omit<ImageProps, "src"> & { src: string | null | undefined };

/**
 * next/image, tanımlı olmayan bir host görürse hata fırlatır ve sayfayı komple
 * çökertir. Görsel adresleri yönetici panelinden elle girilebildiği için
 * veritabanında her zaman geçerli bir adres olduğunu varsayamayız.
 *
 * - Adres yoksa            → hiçbir şey çizilmez (çağıran taraf boş durumu gösterir)
 * - Adres tanımsız host'ta → optimize edilmeden düz <img> ile çizilir
 * - Adres uygunsa          → normal next/image
 */
export function SafeImage({ src, alt, className, fill, sizes, ...rest }: SafeImageProps) {
  if (!src) return null;

  if (!isAllowedImageHost(src)) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={typeof alt === "string" ? alt : ""}
        className={className}
        style={fill ? { position: "absolute", inset: 0, width: "100%", height: "100%" } : undefined}
        loading="lazy"
      />
    );
  }

  return <Image src={src} alt={alt} className={className} fill={fill} sizes={sizes} {...rest} />;
}

export default SafeImage;
