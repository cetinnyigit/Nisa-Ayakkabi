import type { Metadata } from "next";
import { LegalPage, LegalSection, LegalLink, LegalTable } from "@/components/legal/LegalPage";
import { company, formatAddress } from "@/lib/company";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/shipping";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi",
  description:
    "Nisa Ayakkabı mesafeli satış sözleşmesi: taraflar, sözleşme konusu, cayma hakkı, teslimat ve uyuşmazlık hükümleri.",
};

export default function DistanceSalesPage() {
  return (
    <LegalPage
      title="Mesafeli Satış Sözleşmesi"
      intro="Bu sözleşme, siteden verdiğiniz siparişlerde tarafların hak ve yükümlülüklerini düzenler. Sipariş vermeden önce okumanızı öneririz."
      updatedAt="21.09.2026"
    >
      <LegalSection heading="Madde 1 — Taraflar">
        <p className="font-label-caps text-label-caps uppercase text-on-surface">
          1.1. Satıcı
        </p>
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
        <p className="font-label-caps text-label-caps uppercase text-on-surface">
          1.2. Alıcı
        </p>
        <p>
          Sipariş sırasında girilen ad-soyad, teslimat adresi, telefon ve e-posta bilgileri
          Alıcı&apos;ya aittir ve sipariş özetinde ayrıca gösterilir. Bu bilgilerin doğruluğundan
          Alıcı sorumludur.
        </p>
      </LegalSection>

      <LegalSection heading="Madde 2 — Sözleşmenin Konusu">
        <p>
          İşbu sözleşmenin konusu, Alıcı&apos;nın {company.brandName} internet sitesi üzerinden
          elektronik ortamda siparişini verdiği, nitelikleri ve satış fiyatı sipariş özetinde
          belirtilen ürünlerin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin
          Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince
          tarafların hak ve yükümlülüklerinin belirlenmesidir.
        </p>
      </LegalSection>

      <LegalSection heading="Madde 3 — Sözleşme Konusu Ürün ve Ödeme Bilgileri">
        <p>
          Sözleşmeye konu ürünlerin türü, adedi, rengi, bedeni, KDV dâhil satış fiyatı ve kargo
          ücreti; sipariş verilmeden önce ödeme sayfasındaki sipariş özetinde, sipariş
          tamamlandıktan sonra ise Alıcı&apos;ya gönderilen sipariş onay e-postasında yer alır.
          Bu bilgiler işbu sözleşmenin ayrılmaz bir parçasıdır.
        </p>
        <p>
          Listelenen ve sitede ilan edilen fiyatlar satış fiyatı olup, güncellenene ve
          değiştirilene kadar geçerlidir. Belirli bir süre için ilan edilen fiyatlar, süre
          sonuna kadar geçerliliğini korur.
        </p>
        <p>
          Kargo ücreti: sepet tutarı {formatPrice(FREE_SHIPPING_THRESHOLD)} ve üzerindeyse
          ücretsiz, altındaysa {formatPrice(SHIPPING_COST)}&apos;dir.
        </p>
      </LegalSection>

      <LegalSection heading="Madde 4 — Ödeme Şekli">
        <p>
          Ödemeler, PCI-DSS sertifikalı ödeme kuruluşu <strong className="text-on-surface">PayTR</strong>{" "}
          altyapısı üzerinden kredi kartı veya banka kartı ile yapılır. Kart bilgileri
          doğrudan ödeme kuruluşunun güvenli ekranına girilir; Satıcı bu bilgilere hiçbir
          aşamada erişemez ve bunları saklamaz.
        </p>
        <p>
          Kart sahibi ile Alıcı&apos;nın aynı kişi olmaması veya ödemenin bankaca onaylanmaması
          hâlinde Satıcı, siparişi teslim etmeme hakkını saklı tutar.
        </p>
      </LegalSection>

      <LegalSection heading="Madde 5 — Teslimat">
        <p>
          Ürün, Alıcı&apos;nın sipariş sırasında bildirdiği adrese anlaşmalı kargo firması
          aracılığıyla teslim edilir. Teslimat süresi, siparişin onaylanmasından itibaren yasal
          azami süre olan <strong className="text-on-surface">30 günü</strong> aşamaz; olağan
          koşullarda teslimat 1–3 iş günü içinde gerçekleşir.
        </p>
        <p>
          Kargo ücreti Madde 3&apos;te belirtildiği şekilde uygulanır. Ürünün teslim edileceği
          adreste Alıcı&apos;nın bulunmaması hâlinde kargo firmasının bıraktığı bildirime göre
          hareket edilmesi Alıcı&apos;nın sorumluluğundadır.
        </p>
        <p>
          Ayrıntılar için <LegalLink href="/teslimat-ve-kargo">Teslimat ve Kargo</LegalLink>{" "}
          sayfasına bakınız.
        </p>
      </LegalSection>

      <LegalSection heading="Madde 6 — Alıcı'nın Beyan ve Taahhütleri">
        <p>
          Alıcı; sözleşme konusu ürünün temel nitelikleri, satış fiyatı, ödeme şekli ve teslimat
          koşullarına ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda
          gerekli teyidi verdiğini kabul ve beyan eder.
        </p>
        <p>
          Alıcı, ürünü teslim aldığı anda kontrol etmekle ve hasarlı ürünü kargo firmasından
          teslim almamakla yükümlüdür. Teslim alınan ürünün hasarsız ve sağlam olduğu kabul
          edilir.
        </p>
      </LegalSection>

      <LegalSection heading="Madde 7 — Satıcı'nın Beyan ve Taahhütleri">
        <p>
          Satıcı, sözleşme konusu ürünü eksiksiz, siparişte belirtilen niteliklere uygun ve
          varsa garanti belgeleri ile birlikte teslim etmeyi taahhüt eder.
        </p>
        <p>
          Sözleşme konusu ürünün tedarik edilmesinin imkânsızlaşması hâlinde Satıcı, bu durumu
          öğrendiği tarihten itibaren 3 gün içinde Alıcı&apos;ya yazılı olarak bildirir ve toplam
          bedeli en geç 14 gün içinde Alıcı&apos;ya iade eder.
        </p>
      </LegalSection>

      <LegalSection heading="Madde 8 — Cayma Hakkı">
        <p>
          Alıcı, ürünü teslim aldığı tarihten itibaren{" "}
          <strong className="text-on-surface">14 gün</strong> içinde hiçbir hukuki ve cezai
          sorumluluk üstlenmeksizin ve gerekçe göstermeksizin cayma hakkını kullanabilir.
        </p>
        <p>
          Cayma bildirimi {company.supportEmail} adresine veya {company.phone} numarasına
          yapılır. Satıcı, bildirimin ulaşmasından itibaren 14 gün içinde toplam bedeli ve
          Alıcı&apos;yı borç altına sokan belgeleri iade eder; ürünü 20 gün içinde geri alır.
        </p>
        <p>
          Cayma hakkının kullanılabilmesi için ürünün kullanılmamış, kutusunun ve etiketlerinin
          zarar görmemiş olması gerekir. Koşulların tamamı{" "}
          <LegalLink href="/iptal-ve-iade">İptal ve İade Politikası</LegalLink> sayfasındadır.
        </p>
      </LegalSection>

      <LegalSection heading="Madde 9 — Cayma Hakkının Kullanılamayacağı Hâller">
        <p>
          Mesafeli Sözleşmeler Yönetmeliği m.15 uyarınca; Alıcı&apos;nın istekleri doğrultusunda
          kişiye özel hazırlanan ürünler ile tesliminden sonra ambalajı açılmış olup iadesi
          sağlık ve hijyen açısından uygun olmayan ürünlerde cayma hakkı kullanılamaz.
        </p>
      </LegalSection>

      <LegalSection heading="Madde 10 — Kişisel Verilerin Korunması">
        <p>
          Alıcı&apos;nın paylaştığı kişisel veriler, 6698 sayılı Kanun kapsamında yalnızca
          siparişin işlenmesi, teslimi ve yasal yükümlülüklerin yerine getirilmesi amacıyla
          işlenir. Ayrıntılar için{" "}
          <LegalLink href="/gizlilik">Gizlilik Politikası</LegalLink> sayfasına bakınız.
        </p>
      </LegalSection>

      <LegalSection heading="Madde 11 — Uyuşmazlıkların Çözümü">
        <p>
          İşbu sözleşmeden doğabilecek uyuşmazlıklarda, Ticaret Bakanlığı&apos;nca her yıl
          belirlenen parasal sınırlar dâhilinde Alıcı&apos;nın yerleşim yerindeki veya işlemin
          yapıldığı yerdeki Tüketici Hakem Heyetleri ile Tüketici Mahkemeleri yetkilidir.
        </p>
      </LegalSection>

      <LegalSection heading="Madde 12 — Yürürlük">
        <p>
          Alıcı, siparişi elektronik ortamda onayladığında işbu sözleşmenin tüm koşullarını
          kabul etmiş sayılır. Sözleşme, sipariş onayı ile yürürlüğe girer ve bir nüshası
          sipariş onay e-postası ile Alıcı&apos;ya iletilir.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
