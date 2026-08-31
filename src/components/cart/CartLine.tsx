"use client";

import SafeImage from "@/components/ui/SafeImage";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { useCart, type CartItem } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

export function CartLine({ item }: { item: CartItem }) {
  const setQuantity = useCart((s) => s.setQuantity);
  const removeItem = useCart((s) => s.removeItem);

  const atMax = item.quantity >= item.maxStock;

  return (
    <div className="group flex flex-col items-center gap-6 rounded-lg bg-surface-container-low p-6 shadow-ambient transition-shadow duration-300 hover:shadow-ambient-hover md:flex-row md:items-start">
      <Link
        href={`/urun/${item.slug}`}
        className="relative h-40 w-32 shrink-0 overflow-hidden rounded bg-surface-container"
      >
        {item.image && (
          <SafeImage
            src={item.image}
            alt={item.name}
            fill
            sizes="128px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
      </Link>

      <div className="flex h-full w-full flex-1 flex-col">
        <div className="mb-2 flex items-start justify-between gap-4">
          <div>
            <Link href={`/urun/${item.slug}`}>
              <h3 className="font-headline-sm text-headline-sm text-on-surface transition-colors hover:text-primary">
                {item.name}
              </h3>
            </Link>
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
              Renk: {item.color} &nbsp;|&nbsp; Numara: {item.size}
            </p>
            {atMax && (
              <p className="mt-1 font-body-sm text-body-sm text-error">
                Bu varyantta en fazla {item.maxStock} adet alabilirsiniz.
              </p>
            )}
          </div>

          <button
            onClick={() => removeItem(item.variantId)}
            aria-label={`${item.name} ürününü sepetten çıkar`}
            className="p-2 text-on-surface-variant transition-colors hover:text-error"
          >
            <Icon name="close" className="text-xl" />
          </button>
        </div>

        <div className="mt-auto flex w-full items-end justify-between pt-4">
          <div className="flex items-center rounded border border-outline-variant">
            <button
              onClick={() => setQuantity(item.variantId, item.quantity - 1)}
              aria-label="Adedi azalt"
              className="px-3 py-1 text-on-surface-variant transition-colors hover:bg-surface-variant"
            >
              <Icon name="remove" className="text-sm" />
            </button>
            <span className="min-w-[2rem] px-2 text-center font-body-md text-body-md">
              {item.quantity}
            </span>
            <button
              onClick={() => setQuantity(item.variantId, item.quantity + 1)}
              disabled={atMax}
              aria-label="Adedi artır"
              className="px-3 py-1 text-on-surface-variant transition-colors hover:bg-surface-variant disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon name="add" className="text-sm" />
            </button>
          </div>

          <p className="font-headline-sm text-headline-sm text-primary">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CartLine;
