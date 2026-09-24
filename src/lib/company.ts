/**
 * Satıcı (firma) bilgileri — mesafeli satış sözleşmesi, ön bilgilendirme formu,
 * iletişim sayfası ve footer aynı kaynağı kullanır.
 *
 * PayTR canlı mod başvurusunda bu alanların sitede görünür olması zorunlu.
 */
export const company = {
  /** Şahıs şirketi — ticari unvan ad-soyaddır */
  legalName: "Sedat Enginer",
  /** Müşteriye görünen marka adı */
  brandName: "Nisa Ayakkabı",

  address: {
    line: "Batı Mah. Kübra Sk. Zümrüt Apt. No: 10/A",
    district: "Pendik",
    city: "İstanbul",
    /** Boş bırakılırsa adres satırında gösterilmez */
    postalCode: "",
    country: "Türkiye",
  },

  /** E.164 — tel: bağlantısı için */
  phoneE164: "+905352663759",
  /** Ekranda gösterilen biçim */
  phone: "+90 535 266 37 59",
  email: "sedateginer@gmail.com",
  /** İade/iptal taleplerinin gittiği adres */
  supportEmail: "sedateginer@gmail.com",
  /** Yeni sipariş bildirimlerinin gittiği adres (satıcı) */
  orderNotificationEmail: "sedateginer@gmail.com",

  taxOffice: "Pendik Vergi Dairesi",
  taxNumber: "29075468652",
  /** Şahıs şirketi — MERSİS numarası yok, satır gizlenir */
  mersisNumber: "",

  workingHours: "Hafta içi 09:00 – 18:00",
} as const;

/** "Batı Mah. ..., Pendik/İstanbul, Türkiye" biçiminde tek satır adres */
export function formatAddress(): string {
  const { line, district, city, postalCode, country } = company.address;
  const locality = postalCode ? `${district}/${city} ${postalCode}` : `${district}/${city}`;
  return `${line}, ${locality}, ${country}`;
}
