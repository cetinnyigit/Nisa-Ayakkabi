"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { FREE_SHIPPING_FOR_ALL, FREE_SHIPPING_THRESHOLD, calculateTotals } from "@/lib/shipping";
import { formatPrice } from "@/lib/utils";

type Props = {
  subtotal: number;
  /** Ödemeye geçiş butonu; ödeme sayfasında gizlenir */
  action?: { href: string; label: string } | null;
  /** Sipariş özetinin altında gösterilecek ek içerik (ör. ödeme butonu) */
  children?: React.ReactNode;
};

export function OrderSummary({ subtotal, action, children }: Props) {
  const { shipping, total } = calculateTotals(subtotal);
  const remaining = FREE_SHIPPING_FOR_ALL ? 0 : FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <div className="sticky top-32 rounded-lg border border-outline-variant/30 bg-secondary-container/20 p-8 shadow-ambient">
      <h2 className="mb-6 border-b border-outline-variant/30 pb-4 font-headline-sm text-headline-sm text-primary">
        Sipariş Özeti
      </h2>

      <div className="mb-6 space-y-4 border-b border-outline-variant/30 pb-6 font-body-md text-body-md text-on-surface-variant">
        <div className="flex justify-between">
          <span>Ara Toplam</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Kargo</span>
          <span className={shipping === 0 ? "text-primary" : undefined}>
            {shipping === 0 ? "Ücretsiz" : formatPrice(shipping)}
          </span>
        </div>
        {remaining > 0 && (
          <p className="font-body-sm text-body-sm text-on-surface-variant/80">
            Ücretsiz kargoya <strong className="text-primary">{formatPrice(remaining)}</strong>{" "}
            kaldı.
          </p>
        )}
      </div>

      <div className="mb-8 flex items-center justify-between">
        <span className="font-headline-sm text-headline-sm text-on-surface">Toplam</span>
        <span className="font-headline-sm text-headline-sm text-primary">
          {formatPrice(total)}
        </span>
      </div>

      {action && (
        <Link
          href={action.href}
          className="block w-full rounded bg-tertiary py-4 text-center font-label-caps text-label-caps uppercase text-on-tertiary shadow-ambient transition-colors duration-300 hover:bg-on-tertiary-fixed-variant"
        >
          {action.label}
        </Link>
      )}

      {children}

      <div className="mt-6 flex justify-center gap-4 text-outline opacity-70">
        <Icon name="lock" />
        <Icon name="local_shipping" />
        <Icon name="currency_exchange" />
      </div>
    </div>
  );
}

export default OrderSummary;
