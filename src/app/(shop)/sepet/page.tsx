"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CartLine from "@/components/cart/CartLine";
import CartSyncNotice from "@/components/cart/CartSyncNotice";
import OrderSummary from "@/components/cart/OrderSummary";
import Button from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { selectSubtotal, useCart } from "@/store/cart";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const subtotal = useCart(selectSubtotal);
  const clear = useCart((s) => s.clear);

  // Sepet localStorage'da; sunucu HTML'i her zaman boş olur.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="container-nisa py-stack-lg">
      <header className="mb-stack-md flex items-end justify-between gap-gutter">
        <h1 className="font-display-lg text-display-lg-mobile text-on-surface md:text-display-lg">
          Sepetim
        </h1>
        {mounted && items.length > 0 && (
          <button
            onClick={clear}
            className="font-label-caps text-label-caps uppercase text-on-surface-variant transition-colors hover:text-error"
          >
            Sepeti Boşalt
          </button>
        )}
      </header>

      {/* Sepet tarayıcıda (localStorage) tutulduğu için JavaScript kapalıyken
          görüntülenemez. Kullanıcı boş bir sayfayla baş başa kalmasın. */}
      <noscript>
        <div className="mb-stack-sm rounded-lg border border-error/30 bg-error-container px-4 py-3 font-body-md text-body-md text-on-error-container">
          Sepetinizi görüntüleyebilmek için tarayıcınızda JavaScript&apos;i etkinleştirmeniz
          gerekiyor.
        </div>
      </noscript>

      {!mounted ? (
        <div className="py-stack-lg text-center font-body-md text-body-md text-on-surface-variant">
          Sepet yükleniyor…
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center py-stack-lg text-center">
          <Icon name="shopping_bag" className="mb-6 text-[48px] text-outline-variant" />
          <p className="mb-2 font-headline-sm text-headline-sm text-on-surface">
            Sepetiniz henüz boş.
          </p>
          <p className="mb-stack-md max-w-md font-body-md text-body-md text-on-surface-variant">
            El işçiliğiyle üretilen koleksiyonlarımıza göz atın, beğendiğiniz parçaları buraya
            ekleyin.
          </p>
          <Button href="/koleksiyonlar" size="lg">
            Koleksiyonları Keşfet
          </Button>
        </div>
      ) : (
        <>
          <CartSyncNotice />
          <div className="flex flex-col gap-gutter lg:flex-row">
            <div className="flex-1 space-y-gutter">
            {items.map((item) => (
              <CartLine key={item.variantId} item={item} />
            ))}

            <Link
              href="/koleksiyonlar"
              className="inline-flex items-center gap-2 pt-2 font-label-caps text-label-caps uppercase text-tertiary transition-colors hover:text-primary"
            >
              <Icon name="arrow_back" className="text-[16px]" />
              Alışverişe Devam Et
            </Link>
            </div>

            <div className="w-full shrink-0 lg:w-96">
              <OrderSummary
                subtotal={subtotal}
                action={{ href: "/odeme", label: "Güvenli Ödemeye Geç" }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
