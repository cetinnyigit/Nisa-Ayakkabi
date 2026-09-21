import type { Metadata } from "next";
import { LegalPage, LegalSection, LegalLink, LegalTable } from "@/components/legal/LegalPage";
import { company } from "@/lib/company";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/shipping";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Teslimat ve Kargo",
  description:
    "Kargo ücreti, ücretsiz kargo limiti, teslimat süreleri ve sipariş takibi hakkında bilmeniz gerekenler.",
};

export default function ShippingPage() {
  return (
    <LegalPage
      title="Teslimat ve Kargo"
      intro="Siparişinizin size ulaşana kadar geçtiği adımlar, süreler ve kargo ücretleri."
      updatedAt="21.09.2026"
    >
      <LegalSection heading="Kargo Ücreti">
        <LegalTable
          rows={[
            [
              `${formatPrice(FREE_SHIPPING_THRESHOLD)} ve üzeri`,
              <span key="ucretsiz" className="text-primary">
                Ücretsiz kargo
              </span>,
            ],
            [`${formatPrice(FREE_SHIPPING_THRESHOLD)} altı`, formatPrice(SHIPPING_COST)],
          ]}
        />
        <p>
          Kargo ücreti sepet ve ödeme sayfalarında, siparişi onaylamadan önce ayrı bir kalem
          olarak gösterilir. Ödeme ekranında gördüğünüz tutardan başka hiçbir ücret tahsil
          edilmez.
        </p>
      </LegalSection>

      <LegalSection heading="Hazırlık ve Teslimat Süresi">
        <p>
          Saat 16:00&apos;ya kadar verilen ve ödemesi onaylanan siparişler aynı iş günü içinde
          kargoya teslim edilir. Bu saatten sonra verilen siparişler ile hafta sonu ve resmî
          tatil günlerindeki siparişler, takip eden ilk iş günü kargolanır.
        </p>
        <p>
          Kargoya verildikten sonra teslimat, anlaşmalı kargo firmasının çalışma temposuna bağlı
          olarak <strong className="text-on-surface">1–3 iş günü</strong> sürer. Yoğun kampanya
          dönemlerinde bu süre uzayabilir.
        </p>
        <p>
          Siparişleriniz yasal olarak en geç{" "}
          <strong className="text-on-surface">30 gün</strong> içinde teslim edilir. Bu sürenin
          aşılacağı anlaşılırsa size bilgi verilir ve dilerseniz siparişinizi iptal ederek
          ödemenizin tamamını geri alabilirsiniz.
        </p>
      </LegalSection>

      <LegalSection heading="Teslimat Bölgesi">
        <p>
          Türkiye&apos;nin tüm il ve ilçelerine gönderim yapıyoruz. Kargo firmasının şubesi
          bulunmayan yerleşim yerlerinde teslimat en yakın şubeye yapılır ve şubeden teslim
          alınması istenebilir.
        </p>
      </LegalSection>

      <LegalSection heading="Sipariş Takibi">
        <p>
          Siparişiniz kargoya verildiğinde takip numarası e-posta adresinize gönderilir. Ayrıca{" "}
          <LegalLink href="/hesabim">Hesabım</LegalLink> sayfasından siparişlerinizin güncel
          durumunu her zaman görebilirsiniz.
        </p>
      </LegalSection>

      <LegalSection heading="Teslim Alırken Dikkat Edilmesi Gerekenler">
        <p>
          Paketi teslim almadan önce ezik, yırtık veya ıslaklık gibi hasar olup olmadığını
          kontrol edin. Hasar varsa ürünü teslim almayın ve kargo görevlisine{" "}
          <strong className="text-on-surface">hasar tespit tutanağı</strong> tutturun. Tutanağın
          bir kopyasıyla birlikte {company.supportEmail} adresine yazdığınızda ürünü ücretsiz
          değiştiriyoruz.
        </p>
        <p>
          Tutanak tutulmadan teslim alınan paketler, kargo firması tarafından sorunsuz teslim
          edilmiş sayılır.
        </p>
      </LegalSection>

      <LegalSection heading="Teslim Edilemeyen Siparişler">
        <p>
          Adres bilgisinin eksik/hatalı olması veya alıcıya ulaşılamaması nedeniyle teslim
          edilemeyen siparişler bize geri döner. Bu durumda sizinle iletişime geçeriz; ürünü
          tekrar göndermek isterseniz yeni kargo ücreti tarafınıza aittir. Siparişi iptal
          etmeniz hâlinde ürün bedeli iade edilir.
        </p>
      </LegalSection>

      <LegalSection heading="İade Etmek İstiyorum">
        <p>
          Cayma hakkınız, koşullar ve iade adımları için{" "}
          <LegalLink href="/iptal-ve-iade">İptal ve İade Politikası</LegalLink> sayfamıza göz
          atın.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
