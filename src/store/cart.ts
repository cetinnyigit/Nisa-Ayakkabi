"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  /** ProductVariant.id — sepetteki satırın kimliği */
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  size: string;
  color: string;
  price: number;
  image: string | null;
  quantity: number;
  /** Varyantın anlık stoğu; miktar artırırken sınır olarak kullanılır */
  maxStock: number;
};

/** Sunucuyla eşitleme sonucunda kullanıcıya bildirilecek değişiklikler. */
export type CartSyncChange =
  | { type: "removed"; name: string }
  | { type: "price"; name: string; from: number; to: number }
  | { type: "quantity"; name: string; from: number; to: number };

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  /** Fiyat/stok bilgisini sunucudan tazeler, değişiklikleri döndürür. */
  sync: () => Promise<CartSyncChange[]>;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: Math.min(i.quantity + quantity, i.maxStock) }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { ...item, quantity: Math.min(quantity, item.maxStock) }],
          };
        }),

      removeItem: (variantId) =>
        set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) })),

      setQuantity: (variantId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.variantId !== variantId)
              : state.items.map((i) =>
                  i.variantId === variantId
                    ? { ...i, quantity: Math.min(quantity, i.maxStock) }
                    : i
                ),
        })),

      clear: () => set({ items: [] }),

      sync: async () => {
        const current = get().items;
        if (current.length === 0) return [];

        let payload: {
          items: Array<
            | { variantId: string; available: false }
            | {
                variantId: string;
                available: true;
                name: string;
                price: number;
                stock: number;
                image: string | null;
              }
          >;
        };

        try {
          const res = await fetch("/api/sepet/dogrula", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ variantIds: current.map((i) => i.variantId) }),
          });
          if (!res.ok) return [];
          payload = await res.json();
        } catch {
          // Ağ hatasında sepete dokunmuyoruz; sunucu zaten ödeme anında doğruluyor.
          return [];
        }

        const changes: CartSyncChange[] = [];
        const next: CartItem[] = [];

        for (const item of current) {
          const fresh = payload.items.find((x) => x.variantId === item.variantId);

          if (!fresh || !fresh.available || fresh.stock <= 0) {
            changes.push({ type: "removed", name: item.name });
            continue;
          }

          let quantity = item.quantity;
          if (quantity > fresh.stock) {
            changes.push({
              type: "quantity",
              name: item.name,
              from: quantity,
              to: fresh.stock,
            });
            quantity = fresh.stock;
          }

          if (fresh.price !== item.price) {
            changes.push({
              type: "price",
              name: item.name,
              from: item.price,
              to: fresh.price,
            });
          }

          next.push({
            ...item,
            name: fresh.name,
            price: fresh.price,
            image: fresh.image,
            maxStock: fresh.stock,
            quantity,
          });
        }

        if (changes.length > 0) set({ items: next });
        return changes;
      },
    }),
    { name: "nisa-cart" }
  )
);

/** Toplam ürün adedi (rozet için). */
export const selectCount = (s: CartState) => s.items.reduce((n, i) => n + i.quantity, 0);

/** Ara toplam. */
export const selectSubtotal = (s: CartState) =>
  s.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
