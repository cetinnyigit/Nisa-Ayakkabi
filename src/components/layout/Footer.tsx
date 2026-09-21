import Link from "next/link";
import { company } from "@/lib/company";

/**
 * Footer, PayTR canlı mod şartı gereği satıcı adresini ve telefon numarasını
 * her sayfada görünür tutar; yasal metin bağlantıları da buradan verilir.
 */
const legalLinks = [
  { label: "Mesafeli Satış Sözleşmesi", href: "/mesafeli-satis-sozlesmesi" },
  { label: "Ön Bilgilendirme Formu", href: "/on-bilgilendirme-formu" },
  { label: "İptal ve İade Politikası", href: "/iptal-ve-iade" },
  { label: "Teslimat ve Kargo", href: "/teslimat-ve-kargo" },
  { label: "Gizlilik ve KVKK", href: "/gizlilik" },
];

const shopLinks = [
  { label: "Koleksiyonlar", href: "/koleksiyonlar" },
  { label: "Yeni Gelenler", href: "/koleksiyon/yeni-gelenler" },
  { label: "Hesabım", href: "/hesabim" },
  { label: "Bize Ulaşın", href: "/iletisim" },
];

export function Footer() {
  const year = new Date().getFullYear();
  const { address } = company;

  return (
    <footer className="mt-stack-lg border-t border-outline-variant/30 bg-surface-container-low py-stack-md">
      <div className="container-nisa grid grid-cols-1 gap-stack-md md:grid-cols-4">
        {/* Satıcı kimliği — unvan, adres, telefon, e-posta */}
        <div className="flex flex-col gap-4 md:col-span-2">
          <span className="font-headline-sm text-headline-sm text-tertiary">NISA</span>
          <address className="space-y-1 font-body-sm text-body-sm not-italic text-on-surface-variant">
            <p className="text-on-surface">{company.legalName}</p>
            <p>{address.line}</p>
            <p>
              {address.district} / {address.city}
              {address.postalCode ? ` ${address.postalCode}` : ""}, {address.country}
            </p>
            <p>
              <a href={`tel:${company.phoneE164}`} className="transition-colors hover:text-primary">
                {company.phone}
              </a>
            </p>
            <p>
              <a
                href={`mailto:${company.email}`}
                className="transition-colors hover:text-primary"
              >
                {company.email}
              </a>
            </p>
            <p className="pt-1 text-on-surface-variant/70">{company.workingHours}</p>
          </address>
        </div>

        <nav className="flex flex-col gap-2">
          <h3 className="mb-1 font-label-caps text-label-caps uppercase text-on-surface">
            Alışveriş
          </h3>
          {shopLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-body-sm text-body-sm text-on-surface-variant transition-colors duration-300 hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <nav className="flex flex-col gap-2">
          <h3 className="mb-1 font-label-caps text-label-caps uppercase text-on-surface">
            Yasal
          </h3>
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-body-sm text-body-sm text-on-surface-variant transition-colors duration-300 hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="container-nisa mt-stack-md border-t border-outline-variant/30 pt-6">
        <p className="font-body-sm text-body-sm uppercase text-tertiary">
          © {year} {company.brandName}. El işçiliği lüks parçalar.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
