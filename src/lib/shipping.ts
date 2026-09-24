/** Kargo kuralları — vitrin, sepet ve ödeme adımı aynı kaynağı kullanır. */
import { formatPrice } from "@/lib/utils";

/**
 * true iken tüm siparişlerde kargo ücretsizdir; eşik ve ücret yok sayılır.
 * Ücretli kargoya dönmek için false yapın — metinler de eşik/ücrete göre güncellenir.
 */
export const FREE_SHIPPING_FOR_ALL = true;
export const FREE_SHIPPING_THRESHOLD = 1000;
export const SHIPPING_COST = 79.9;

export function calculateShipping(subtotal: number): number {
  if (FREE_SHIPPING_FOR_ALL || subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

export function calculateTotals(subtotal: number) {
  const shipping = calculateShipping(subtotal);
  return { subtotal, shipping, total: subtotal + shipping };
}

/** Vitrinde ve yasal metinlerde kullanılan tek cümlelik kargo özeti. */
export function shippingSummary(): string {
  if (FREE_SHIPPING_FOR_ALL) return "Tüm siparişlerde kargo ücretsizdir.";
  return (
    `Sepet tutarı ${formatPrice(FREE_SHIPPING_THRESHOLD)} ve üzerindeyse kargo ücretsizdir; ` +
    `bu tutarın altındaki siparişlerde ${formatPrice(SHIPPING_COST)} kargo ücreti uygulanır.`
  );
}
