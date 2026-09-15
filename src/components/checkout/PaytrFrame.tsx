"use client";

import Script from "next/script";

declare global {
  interface Window {
    iFrameResize?: (options: Record<string, unknown>, target: string) => void;
  }
}

/**
 * PayTR ödeme iframe'i.
 *
 * PayTR'nin ödeme ekranı adım adım (kart bilgisi → 3D doğrulama → sonuç) büyüyüp
 * küçüldüğü için sabit yükseklik vermek mobilde içeriği kesiyor. PayTR bunun için
 * kendi iframeResizer kopyasını sunuyor; script yüklendiğinde iframe yüksekliği
 * içeriğe göre otomatik ayarlanır. Script yüklenemezse min-height devrede kalır.
 */
export default function PaytrFrame({ token }: { token: string }) {
  return (
    <>
      <iframe
        id="paytriframe"
        src={`https://www.paytr.com/odeme/guvenli/${token}`}
        title="PayTR Güvenli Ödeme"
        className="w-full"
        style={{ minHeight: 720, border: 0 }}
        scrolling="no"
      />
      <Script
        src="https://www.paytr.com/js/iframeResizer.min.js"
        strategy="afterInteractive"
        onLoad={() => window.iFrameResize?.({}, "#paytriframe")}
      />
    </>
  );
}
