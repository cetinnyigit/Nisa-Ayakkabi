import { Icon } from "@/components/ui/Icon";

const items = [
  {
    icon: "local_shipping",
    title: "Ücretsiz Kargo",
    text: "1000 TL ve üzeri alışverişlerde geçerli",
  },
  {
    icon: "schedule",
    title: "Aynı Gün Kargo",
    text: "Saat 16:00'ya kadar verilen siparişler aynı gün kargoda",
  },
  {
    icon: "published_with_changes",
    title: "14 Gün İçinde Değişim",
    text: "Ücretsiz değişim ile sorunsuz alışveriş",
  },
  {
    icon: "verified_user",
    title: "Güvenli Ödeme",
    text: "SSL tabanlı 256-bit şifreleme ile güvenli alışveriş",
  },
];

export function TrustBar() {
  return (
    <section className="container-nisa border-t border-outline-variant/30 py-stack-md">
      <div className="grid grid-cols-1 gap-gutter md:grid-cols-4">
        {items.map((item) => (
          <div key={item.icon} className="flex items-center gap-4">
            <Icon name={item.icon} className="text-[32px] text-tertiary" />
            <div>
              <h4 className="mb-1 font-label-caps text-label-caps uppercase text-on-surface">
                {item.title}
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TrustBar;
