"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/app/admin/actions";

const options = [
  { value: "PENDING", label: "Bekliyor" },
  { value: "PROCESSING", label: "Hazırlanıyor" },
  { value: "SHIPPED", label: "Kargoda" },
  { value: "DELIVERED", label: "Teslim edildi" },
  { value: "CANCELLED", label: "İptal" },
];

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  function change(next: string) {
    const previous = value;
    setValue(next);
    setError(false);

    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, next);
      } catch {
        // Sunucu reddederse arayüzü eski değere döndür
        setValue(previous);
        setError(true);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        disabled={pending}
        onChange={(e) => change(e.target.value)}
        className="rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-0 disabled:opacity-50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className="font-body-sm text-body-sm text-error">Kaydedilemedi</span>}
    </div>
  );
}

export default OrderStatusSelect;
