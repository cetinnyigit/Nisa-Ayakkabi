"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Icon } from "@/components/ui/Icon";
import { deleteProduct } from "@/app/admin/product-actions";

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function remove() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteProduct(productId);
        router.push("/admin/urunler");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ürün silinemedi.");
        setConfirming(false);
      }
    });
  }

  return (
    <div>
      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="inline-flex items-center gap-2 font-label-caps text-label-caps uppercase text-on-surface-variant transition-colors hover:text-error"
        >
          <Icon name="delete" className="text-[18px]" />
          Ürünü Sil
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-error/30 bg-error-container px-4 py-3">
          <span className="font-body-sm text-body-sm text-on-error-container">
            <strong>{productName}</strong> kalıcı olarak silinecek. Emin misiniz?
          </span>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="rounded bg-error px-4 py-2 font-label-caps text-label-caps uppercase text-on-error disabled:opacity-50"
          >
            {pending ? "Siliniyor…" : "Evet, sil"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="font-label-caps text-label-caps uppercase text-on-error-container"
          >
            Vazgeç
          </button>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 rounded border border-error/30 bg-error-container px-4 py-2 font-body-sm text-body-sm text-on-error-container"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default DeleteProductButton;
