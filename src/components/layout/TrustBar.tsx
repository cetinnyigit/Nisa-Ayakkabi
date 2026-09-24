import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { FREE_SHIPPING_FOR_ALL, FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";
import { formatPrice } from "@/lib/utils";

const items = [
  {
    icon: "local_shipping",
    title: "Ücretsiz Kargo",
    text: FREE_SHIPPING_FOR_ALL
      ? "Tüm siparişlerde geçerli"
      : `${formatPrice(FREE_SHIPPING_THRESHOLD)} ve üzeri alışverişlerde geçerli`,
    href: "/teslimat-ve-kargo",
  },
  {
    icon: "schedule",
    title: "Aynı Gün Kargo",
    text: "Saat 16:00'ya kadar verilen siparişler aynı gün kargoda",
    href: "/teslimat-ve-kargo",
  },
  {
    icon: "published_with_changes",
    title: "14 Gün İçinde İade",
    text: "Koşulsuz cayma hakkı ile sorunsuz alışveriş",
    href: "/iptal-ve-iade",
  },
  {
    icon: "verified_user",
    title: "Güvenli Ödeme",
    text: "PayTR altyapısı ve 256-bit SSL şifreleme",
    href: "/mesafeli-satis-sozlesmesi",
  },
];

export function TrustBar() {
  return (
    <section className="container-nisa border-t border-outline-variant/30 py-stack-md">
      <div className="grid grid-cols-1 gap-gutter md:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.icon}
            href={item.href}
            className="group flex items-center gap-4 transition-opacity duration-300 hover:opacity-80"
          >
            <Icon name={item.icon} className="text-[32px] text-tertiary" />
            <div>
              <h4 className="mb-1 font-label-caps text-label-caps uppercase text-on-surface group-hover:text-primary">
                {item.title}
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{item.text}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default TrustBar;
