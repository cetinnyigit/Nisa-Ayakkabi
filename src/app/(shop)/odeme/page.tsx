import type { Metadata } from "next";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Ödeme",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="container-nisa py-stack-lg">
      <h1 className="mb-stack-md font-display-lg text-display-lg-mobile text-on-surface md:text-display-lg">
        Ödeme
      </h1>

      <noscript>
        <div className="mb-stack-sm rounded-lg border border-error/30 bg-error-container px-4 py-3 font-body-md text-body-md text-on-error-container">
          Ödeme adımını tamamlayabilmek için tarayıcınızda JavaScript&apos;i etkinleştirmeniz
          gerekiyor.
        </div>
      </noscript>

      <CheckoutForm />
    </div>
  );
}
