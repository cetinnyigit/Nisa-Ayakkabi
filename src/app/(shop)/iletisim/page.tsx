import type { Metadata } from "next";
import { LegalPage, LegalSection, LegalTable } from "@/components/legal/LegalPage";
import { company, formatAddress } from "@/lib/company";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "Nisa Ayakkabı iletişim bilgileri: adres, telefon numarası, e-posta adresi ve çalışma saatleri.",
};

export default function ContactPage() {
  const { address } = company;

  return (
    <LegalPage
      title="Bize Ulaşın"
      intro="Siparişiniz, iade talebiniz veya ürünlerimiz hakkındaki her konuda bize aşağıdaki kanallardan ulaşabilirsiniz."
    >
      <LegalSection heading="Satıcı Bilgileri">
        <LegalTable
          rows={[
            ["Ticari Unvan", company.legalName],
            ["Marka", company.brandName],
            [
              "Adres",
              <span key="adres">
                {address.line}
                <br />
                {address.district} / {address.city}
                {address.postalCode ? ` ${address.postalCode}` : ""}
                <br />
                {address.country}
              </span>,
            ],
            [
              "Telefon",
              <a key="tel" href={`tel:${company.phoneE164}`} className="hover:text-primary">
                {company.phone}
              </a>,
            ],
            [
              "E-posta",
              <a key="mail" href={`mailto:${company.email}`} className="hover:text-primary">
                {company.email}
              </a>,
            ],
            [
              "İade / Destek",
              <a
                key="destek"
                href={`mailto:${company.supportEmail}`}
                className="hover:text-primary"
              >
                {company.supportEmail}
              </a>,
            ],
            ["Vergi Dairesi", company.taxOffice],
            ["Vergi / TC Kimlik No", company.taxNumber],
            ...(company.mersisNumber
              ? ([["MERSİS No", company.mersisNumber]] as Array<[string, React.ReactNode]>)
              : []),
            ["Çalışma Saatleri", company.workingHours],
          ]}
        />
      </LegalSection>

      <LegalSection heading="Ne Kadar Sürede Dönüş Yapıyoruz?">
        <p>
          E-posta ile gelen talepleri çalışma günlerinde en geç 1 iş günü içinde yanıtlıyoruz.
          Telefonla {company.workingHours} aralığında bize doğrudan ulaşabilirsiniz.
        </p>
        <p>
          Sipariş durumunuzu sorgulamak için mesajınıza sipariş numaranızı eklerseniz süreç
          daha hızlı ilerler.
        </p>
      </LegalSection>

      <LegalSection heading="İade Gönderim Adresi">
        <p>
          İade edeceğiniz ürünleri aşağıdaki adrese gönderiniz. İade göndermeden önce{" "}
          <a href={`mailto:${company.supportEmail}`} className="text-primary underline underline-offset-4">
            {company.supportEmail}
          </a>{" "}
          adresine bilgi vermeniz süreci hızlandırır.
        </p>
        <p className="rounded-lg border border-outline-variant/30 bg-surface-container-low px-5 py-4 text-on-surface">
          {company.legalName}
          <br />
          {formatAddress()}
          <br />
          {company.phone}
        </p>
      </LegalSection>
    </LegalPage>
  );
}
