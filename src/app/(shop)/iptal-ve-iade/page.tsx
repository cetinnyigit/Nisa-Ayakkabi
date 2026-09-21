import type { Metadata } from "next";
import { LegalPage, LegalSection, LegalLink } from "@/components/legal/LegalPage";
import { company, formatAddress } from "@/lib/company";

export const metadata: Metadata = {
  title: "İptal ve İade Politikası",
  description:
    "14 günlük cayma hakkı, iade koşulları, iade adımları ve para iadesi süreleri hakkında detaylı bilgi.",
};

export default function ReturnsPage() {
  return (
    <LegalPage
      title="İptal ve İade Politikası"
      intro="Satın aldığınız üründen memnun kalmadıysanız 14 gün içinde hiçbir gerekçe göstermeden iade edebilirsiniz."
      updatedAt="21.09.2026"
    >
      <LegalSection heading="1. Cayma Hakkı">
        <p>
          6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler
          Yönetmeliği uyarınca, ürünü teslim aldığınız tarihten itibaren{" "}
          <strong className="text-on-surface">14 gün</strong> içinde hiçbir gerekçe göstermeksizin
          ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahipsiniz.
        </p>
        <p>
          Cayma hakkınızı kullanmak için bu süre içinde{" "}
          <a
            href={`mailto:${company.supportEmail}`}
            className="text-primary underline underline-offset-4"
          >
            {company.supportEmail}
          </a>{" "}
          adresine veya {company.phone} numarasına açık bir bildirimde bulunmanız yeterlidir.
          Bildiriminizde sipariş numaranızı ve iade etmek istediğiniz ürünleri belirtin.
        </p>
      </LegalSection>

      <LegalSection heading="2. Sipariş İptali (Kargoya Verilmeden Önce)">
        <p>
          Siparişiniz henüz kargoya verilmediyse iptal talebinizi aynı gün karşılıyoruz. İptal
          onaylandığında ödemenizin tamamı, kargo ücreti dâhil, kartınıza iade edilir.
        </p>
        <p>
          Sipariş kargoya verildikten sonra iptal edilemez; bu durumda aşağıdaki iade adımlarını
          izlemeniz gerekir.
        </p>
      </LegalSection>

      <LegalSection heading="3. İade Koşulları">
        <p>Ürünün iade edilebilmesi için:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Kullanılmamış, denenmiş olsa bile giyilmemiş ve yıpranmamış olması,</li>
          <li>
            Orijinal kutusunun, koruma torbasının ve etiketlerinin zarar görmemiş şekilde
            birlikte gönderilmesi,
          </li>
          <li>Fatura veya sipariş fişinin pakete eklenmesi gerekir.</li>
        </ul>
        <p>
          Ayakkabıları lütfen halı veya yumuşak bir zeminde deneyin. Tabanında aşınma izi
          bulunan ürünler, kullanılmış sayıldığı için iade kapsamı dışındadır.
        </p>
      </LegalSection>

      <LegalSection heading="4. Cayma Hakkının İstisnaları">
        <p>
          Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesi uyarınca, tüketicinin isteği
          doğrultusunda kişiye özel hazırlanan ürünler ile iade edilmesi sağlık ve hijyen
          açısından uygun olmayan, ambalajı açılmış ürünlerde cayma hakkı kullanılamaz.
        </p>
      </LegalSection>

      <LegalSection heading="5. İade Nasıl Yapılır?">
        <ol className="list-decimal space-y-3 pl-6">
          <li>
            İade talebinizi {company.supportEmail} adresine, sipariş numaranızla birlikte
            iletin.
          </li>
          <li>
            Size iade kodunu ve anlaşmalı kargo firmasının bilgilerini gönderelim.
          </li>
          <li>
            Ürünü kutusu ve faturasıyla birlikte paketleyip 14 gün içinde kargoya verin.
          </li>
          <li>
            Paket bize ulaştıktan sonra en geç 3 iş günü içinde kontrol edilir ve sonucu size
            e-postayla bildirilir.
          </li>
        </ol>
        <p className="rounded-lg border border-outline-variant/30 bg-surface-container-low px-5 py-4 text-on-surface">
          <strong>İade Adresi</strong>
          <br />
          {company.legalName}
          <br />
          {formatAddress()}
          <br />
          {company.phone}
        </p>
      </LegalSection>

      <LegalSection heading="6. İade Kargo Ücreti">
        <p>
          Cayma hakkı kapsamındaki iadelerde ürünü, size bildireceğimiz anlaşmalı kargo firması
          ile <strong className="text-on-surface">ücretsiz</strong> gönderebilirsiniz. Farklı bir
          kargo firması tercih ederseniz gönderim ücreti tarafınıza ait olur.
        </p>
        <p>
          Ayıplı, hatalı veya siparişinizden farklı bir ürün gönderilmişse iade kargo ücreti her
          durumda bize aittir.
        </p>
      </LegalSection>

      <LegalSection heading="7. Para İadesi">
        <p>
          Cayma bildiriminizin bize ulaşmasından itibaren{" "}
          <strong className="text-on-surface">14 gün</strong> içinde, ödemeyi yaptığınız yöntemle
          ve masrafsız olarak iadenizi gerçekleştiririz. Ödeme kredi kartıyla yapıldıysa iade de
          aynı karta yapılır.
        </p>
        <p>
          Tutarın kart ekstrenize yansıması, bankanızın işlem süresine bağlı olarak ek{" "}
          <strong className="text-on-surface">2–10 iş günü</strong> sürebilir. Bu süre bankanın
          inisiyatifindedir.
        </p>
        <p>
          Taksitli alışverişlerde bankalar iade tutarını, kalan taksit sayısı kadar parçalar
          hâlinde kartınıza yansıtabilir.
        </p>
      </LegalSection>

      <LegalSection heading="8. Değişim">
        <p>
          Beden veya renk değişimi taleplerinizi, teslim tarihinden itibaren 14 gün içinde
          ücretsiz karşılıyoruz. Değişim istediğiniz ürünün stokta bulunmaması hâlinde ürün
          bedeli iade edilir.
        </p>
      </LegalSection>

      <LegalSection heading="9. Uyuşmazlık Hâlinde Başvuru">
        <p>
          Talebinizin çözülmediğini düşünüyorsanız, Ticaret Bakanlığı&apos;nca her yıl belirlenen
          parasal sınırlar çerçevesinde, ikametgâhınızın veya işlemin yapıldığı yerin{" "}
          <strong className="text-on-surface">Tüketici Hakem Heyeti</strong> ya da{" "}
          <strong className="text-on-surface">Tüketici Mahkemesi</strong>&apos;ne başvurabilirsiniz.
        </p>
      </LegalSection>

      <LegalSection heading="İlgili Sayfalar">
        <p>
          <LegalLink href="/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</LegalLink> ·{" "}
          <LegalLink href="/teslimat-ve-kargo">Teslimat ve Kargo</LegalLink> ·{" "}
          <LegalLink href="/iletisim">Bize Ulaşın</LegalLink>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
