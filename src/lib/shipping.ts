/** Kargo kuralları — vitrin, sepet ve ödeme adımı aynı kaynağı kullanır. */
export const FREE_SHIPPING_THRESHOLD = 1000;
export const SHIPPING_COST = 79.9;

export function calculateShipping(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

export function calculateTotals(subtotal: number) {
  const shipping = calculateShipping(subtotal);
  return { subtotal, shipping, total: subtotal + shipping };
}
