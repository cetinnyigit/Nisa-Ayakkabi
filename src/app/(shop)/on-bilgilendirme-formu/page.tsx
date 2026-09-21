import type { Metadata } from "next";
import { LegalPage, LegalSection, LegalLink, LegalTable } from "@/components/legal/LegalPage";
import { company, formatAddress } from "@/lib/company";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/shipping";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Ön Bilgilendirme Formu",
  description:
    "Mesafeli Sözleşmeler Yönetmeliği uyarınca sipariş öncesi bilgilendirme: satıcı bilgileri, fiyat, teslimat, cayma hakkı ve şikâyet başvuru yolları.",
};

export default function PreInfoPage() {
  return (
    <LegalPage
      title="Ön Bilgilendirme Formu"
      intro="Mesafeli Sözleşmeler Yönetmeliği uyarınca, siparişinizi onaylamadan önce bilmeniz gereken hususlar."
      updatedAt="21.09.2026"
    >
      <LegalSection heading="1. Satıcıya İlişkin Bilgiler">
        <LegalTable
          rows={[
            ["Ticari Unvan", company.legalName],
            ["Adres", formatAddress()],
            ["Telefon", company.phone],
            ["E-posta", company.email],
            ["Vergi Dairesi / No", `${company.taxOffice} — ${company.taxNumber}`],
            ...(company.mersisNumber
              ? ([["MERSİS No", company.mersisNumber]] as Array<[string, React.ReactNode]>)
              : []),
          ]}
        />
      </LegalSection>

      <LegalSection heading="2. Ürünün Temel Nitelikleri ve Fiyatı">
        <p>
          Satın almak istediğiniz ürünün markası, modeli, rengi, bedeni ve KDV dâhil satış
          fiyatı, ilgili ürün sayfasında ve siparişi onaylamadan önce ödeme sayfasındaki sipariş
          özetinde gösterilir.
        </p>
        <p>
          Sitede yer alan fiyatlar ilan edildikleri süre boyunca geçerlidir ve KDV dâhildir.
          Sipariş özetinde gördüğünüz toplam tutar dışında tarafınızdan başka bir bedel tahsil
          edilmez.
        </p>
      </LegalSection>

      <LegalSection heading="3. Kargo ve Teslimat Masrafı">
        <p>
          Sepet tutarı {formatPrice(FREE_SHIPPING_THRESHOLD)} ve üzerindeyse kargo ücretsizdir;
          bu tutarın altındaki siparişlerde {formatPrice(SHIPPING_COST)} kargo ücreti
          uygulanır. Kargo ücreti sipariş özetinde ayrı bir kalem olarak gösterilir.
        </p>
      </LegalSection>

      <LegalSection heading="4. Ödeme Şekli">
        <p>
          Ödeme, PayTR sanal POS altyapısı üzerinden kredi kartı veya banka kartı ile tek
          çekim ya da taksitli olarak yapılır. Kart bilgileriniz ödeme kuruluşunun güvenli
          ekranına girilir; Satıcı bu bilgilere erişmez.
        </p>
      </LegalSection>

      <LegalSection heading="5. Teslimat">
        <p>
          Ürün, siparişte belirttiğiniz adrese anlaşmalı kargo firmasıyla teslim edilir.
          Teslimat süresi olağan koşullarda 1–3 iş günü olup, yasal azami süre olan 30 günü
          aşamaz. Ayrıntılar:{" "}
          <LegalLink href="/teslimat-ve-kargo">Teslimat ve Kargo</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection heading="6. Cayma Hakkı">
        <p>
          Ürünü teslim aldığınız tarihten itibaren{" "}
          <strong className="text-on-surface">14 gün</strong> içinde gerekçe göstermeksizin
          cayma hakkına sahipsiniz. Cayma bildirimini {company.supportEmail} adresine veya{" "}
          {company.phone} numarasına yapabilirsiniz.
        </p>
        <p>
          Cayma hakkı kapsamındaki iadelerde, size bildireceğimiz anlaşmalı kargo firmasını
          kullandığınız takdirde iade kargo ücreti tarafınıza yansıtılmaz. Ödeme iadesi,
          bildiriminizin ulaşmasından itibaren 14 gün içinde aynı ödeme yöntemiyle yapılır.
        </p>
        <p>
          Koşullar ve istisnalar için{" "}
          <LegalLink href="/iptal-ve-iade">İptal ve İade Politikası</LegalLink> sayfasına
          bakınız.
        </p>
      </LegalSection>

      <LegalSection heading="7. Cayma Hakkının Kullanılamayacağı Ürünler">
        <p>
          Kişiye özel hazırlanan ürünler ile ambalajı açıldığında iadesi sağlık ve hijyen
          açısından uygun olmayan ürünlerde cayma hakkı kullanılamaz (Yönetmelik m.15).
        </p>
      </LegalSection>

      <LegalSection heading="8. Şikâyet ve İtiraz Başvuruları">
        <p>
          Talebinizi öncelikle {company.supportEmail} adresine iletmenizi rica ederiz.
          Çözülemeyen uyuşmazlıklarda, Ticaret Bakanlığı&apos;nca her yıl belirlenen parasal
          sınırlar çerçevesinde ikametgâhınızın bulunduğu yerdeki Tüketici Hakem Heyeti veya
          Tüketici Mahkemesi&apos;ne başvurabilirsiniz.
        </p>
      </LegalSection>

      <LegalSection heading="9. Onay">
        <p>
          Siparişinizi onayladığınızda, işbu Ön Bilgilendirme Formu&apos;nu ve{" "}
          <LegalLink href="/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</LegalLink>
          &apos;ni okuyup kabul etmiş sayılırsınız. Her iki metnin bir örneği sipariş onay
          e-postanızla birlikte tarafınıza gönderilir.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
