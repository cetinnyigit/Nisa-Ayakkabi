"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useCart, type CartSyncChange } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

function describe(change: CartSyncChange): string {
  switch (change.type) {
    case "removed":
      return `"${change.name}" stokta kalmadığı için sepetinizden çıkarıldı.`;
    case "quantity":
      return `"${change.name}" adedi ${change.from}'den ${change.to}'e düşürüldü (stok yetersiz).`;
    case "price":
      return `"${change.name}" fiyatı ${formatPrice(change.from)} → ${formatPrice(change.to)} olarak güncellendi.`;
  }
}

/**
 * Sepet localStorage'da tutulduğu için fiyat ve stok bayatlayabilir.
 * Sayfa açılışında sunucudan tazelenir; bir şey değiştiyse kullanıcıya
 * ÖDEME ÖNCESİNDE söylenir — sürpriz tutarla karşılaşmasın.
 */
export function CartSyncNotice() {
  const sync = useCart((s) => s.sync);
  const [changes, setChanges] = useState<CartSyncChange[]>([]);

  useEffect(() => {
    let cancelled = false;
    sync().then((result) => {
      if (!cancelled) setChanges(result);
    });
    return () => {
      cancelled = true;
    };
  }, [sync]);

  if (changes.length === 0) return null;

  return (
    <div
      role="status"
      className="mb-stack-sm rounded-lg border border-primary-container bg-primary-fixed/30 p-4"
    >
      <p className="mb-2 flex items-center gap-2 font-label-caps text-label-caps uppercase text-on-primary-container">
        <Icon name="info" className="text-[18px]" />
        Sepetiniz güncellendi
      </p>
      <ul className="list-disc space-y-1 pl-6 font-body-sm text-body-sm text-on-surface">
        {changes.map((change, i) => (
          <li key={i}>{describe(change)}</li>
        ))}
      </ul>
    </div>
  );
}

export default CartSyncNotice;
