"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart";

/**
 * Sepet yalnızca ödeme onaylandıktan sonra temizlenir.
 * Ödeme yarıda kalırsa kullanıcı sepetini kaybetmez.
 */
export function ClearCartOnSuccess() {
  const clear = useCart((s) => s.clear);
  useEffect(() => clear(), [clear]);
  return null;
}

export default ClearCartOnSuccess;
