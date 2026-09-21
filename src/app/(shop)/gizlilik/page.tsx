import type { Metadata } from "next";
import { LegalPage, LegalSection, LegalLink } from "@/components/legal/LegalPage";
import { company, formatAddress } from "@/lib/company";

export const metadata: Metadata = {
  title: "Gizlilik ve KVKK Politikası",
  description:
    "Kişisel verilerinizi hangi amaçla işlediğimiz, kimlerle paylaştığımız, ne kadar sakladığımız ve KVKK kapsamındaki haklarınız.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Gizlilik ve KVKK Politikası"
      intro="Kişisel verilerinizi hangi amaçla işlediğimizi, kimlerle paylaştığımızı ve haklarınızı açıklar."
      updatedAt="21.09.2026"
    >
      <LegalSection heading="1. Veri Sorumlusu">
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında veri sorumlusu{" "}
          <strong className="text-on-surface">{company.legalName}</strong>&apos;dir.
        </p>
        <p>
          Adres: {formatAddress()}
          <br />
          Telefon: {company.phone}
          <br />
          E-posta: {company.email}
        </p>
      </LegalSection>

      <LegalSection heading="2. İşlenen Kişisel Veriler">
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong className="text-on-surface">Kimlik ve iletişim:</strong> ad, soyad, e-posta,
            telefon numarası.
          </li>
          <li>
            <strong className="text-on-surface">Teslimat:</strong> adres, il, ilçe, posta kodu,
            sipariş notu.
          </li>
          <li>
            <strong className="text-on-surface">Sipariş ve işlem:</strong> sipariş numarası,
            ürün ve tutar bilgileri, sipariş durumu.
          </li>
          <li>
            <strong className="text-on-surface">Hesap:</strong> üyelik bilgileri ve şifrenizin
            geri döndürülemez şekilde şifrelenmiş (hash) hâli. Şifrenizin açık hâli hiçbir yerde
            tutulmaz.
          </li>
        </ul>
        <p>
          <strong className="text-on-surface">Kart bilgileriniz tarafımızca işlenmez.</strong>{" "}
          Ödeme, PayTR&apos;nin güvenli ödeme sayfasında gerçekleşir; kart numarası, son kullanma
          tarihi ve CVV bilgileri sitemize hiçbir zaman iletilmez ve saklanmaz.
        </p>
      </LegalSection>

      <LegalSection heading="3. İşleme Amaçları ve Hukuki Sebep">
        <p>
          Verileriniz; siparişinizin oluşturulması, ödemenin alınması, ürünün kargolanması,
          faturalandırma, iade ve destek taleplerinin karşılanması ile yasal saklama
          yükümlülüklerinin yerine getirilmesi amacıyla işlenir.
        </p>
        <p>
          Hukuki sebep, KVKK m.5/2-c uyarınca sözleşmenin kurulması ve ifası ile m.5/2-ç
          uyarınca hukuki yükümlülüğün yerine getirilmesidir. Pazarlama amaçlı e-posta
          gönderimi yalnızca açık rızanıza dayanır ve dilediğiniz an vazgeçebilirsiniz.
        </p>
      </LegalSection>

      <LegalSection heading="4. Verilerin Aktarıldığı Taraflar">
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong className="text-on-surface">Ödeme kuruluşu (PayTR):</strong> ödemenin
            alınması ve iadeler için gerekli sipariş ve iletişim bilgileri.
          </li>
          <li>
            <strong className="text-on-surface">Kargo firması:</strong> teslimat için ad-soyad,
            adres ve telefon.
          </li>
          <li>
            <strong className="text-on-surface">E-posta ve barındırma sağlayıcıları:</strong>{" "}
            sipariş bildirimlerinin gönderilmesi ve verilerin güvenli saklanması.
          </li>
          <li>
            <strong className="text-on-surface">Yetkili kamu kurumları:</strong> yalnızca yasal
            talep hâlinde ve talep edilen kapsamda.
          </li>
        </ul>
        <p>Kişisel verileriniz pazarlama amacıyla üçüncü kişilere satılmaz veya kiralanmaz.</p>
      </LegalSection>

      <LegalSection heading="5. Saklama Süresi">
        <p>
          Sipariş ve fatura kayıtları, Vergi Usul Kanunu ve Türk Ticaret Kanunu uyarınca{" "}
          <strong className="text-on-surface">10 yıl</strong> saklanır. Üyelik verileriniz,
          hesabınızı silmenizi talep ettiğinizde yasal saklama yükümlülüğü bulunmayan kısımlar
          itibarıyla silinir veya anonim hâle getirilir.
        </p>
      </LegalSection>

      <LegalSection heading="6. Çerezler">
        <p>
          Sitemizde yalnızca oturumun açık kalması, sepetinizin korunması ve güvenlik amacıyla
          zorunlu çerezler kullanılır. Sepetiniz tarayıcınızın yerel depolamasında (localStorage)
          tutulur; tarayıcı verilerinizi temizlediğinizde silinir.
        </p>
      </LegalSection>

      <LegalSection heading="7. Veri Güvenliği">
        <p>
          Site ve tüm alt sayfaları SSL sertifikası ile şifrelenmiş bağlantı üzerinden
          sunulur. Şifreler geri döndürülemez algoritmalarla saklanır, yönetim paneline erişim
          yetkilendirme ile sınırlandırılmıştır.
        </p>
      </LegalSection>

      <LegalSection heading="8. KVKK Kapsamındaki Haklarınız">
        <p>KVKK m.11 uyarınca;</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Kişisel verinizin işlenip işlenmediğini öğrenme ve bilgi talep etme,</li>
          <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
          <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
          <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
          <li>Şartları oluştuysa silinmesini veya yok edilmesini isteme,</li>
          <li>Zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
        </ul>
        <p>
          haklarına sahipsiniz. Taleplerinizi{" "}
          <a
            href={`mailto:${company.email}`}
            className="text-primary underline underline-offset-4"
          >
            {company.email}
          </a>{" "}
          adresine iletebilirsiniz; başvurunuz en geç 30 gün içinde sonuçlandırılır.
        </p>
      </LegalSection>

      <LegalSection heading="İlgili Sayfalar">
        <p>
          <LegalLink href="/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</LegalLink> ·{" "}
          <LegalLink href="/iptal-ve-iade">İptal ve İade Politikası</LegalLink> ·{" "}
          <LegalLink href="/iletisim">Bize Ulaşın</LegalLink>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
