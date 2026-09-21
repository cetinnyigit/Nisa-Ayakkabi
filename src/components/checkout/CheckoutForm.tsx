"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import SafeImage from "@/components/ui/SafeImage";
import Link from "next/link";
import CartSyncNotice from "@/components/cart/CartSyncNotice";
import OrderSummary from "@/components/cart/OrderSummary";
import { Icon } from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { selectSubtotal, useCart } from "@/store/cart";
import { cn, formatPrice } from "@/lib/utils";

const fieldClass =
  "w-full border-b border-outline-variant bg-surface-container-lowest px-0 py-3 " +
  "font-body-md text-body-md transition-colors duration-300 " +
  "placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-0";

type Fields = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  addressLine2: string;
  city: string;
  district: string;
  postalCode: string;
  note: string;
};

const empty: Fields = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  address: "",
  addressLine2: "",
  city: "",
  district: "",
  postalCode: "",
  note: "",
};

export function CheckoutForm() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const subtotal = useCart(selectSubtotal);

  const { data: session } = useSession();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [fields, setFields] = useState<Fields>(empty);

  // Giriş yapılmışsa bilinen bilgileri doldur; kullanıcı yine değiştirebilir.
  useEffect(() => {
    if (!session?.user) return;
    const [firstName = "", ...rest] = (session.user.name ?? "").split(" ");
    setFields((f) => ({
      ...f,
      email: f.email || (session.user.email ?? ""),
      firstName: f.firstName || firstName,
      lastName: f.lastName || rest.join(" "),
    }));
  }, [session]);
  const [error, setError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Mesafeli Sözleşmeler Yönetmeliği: sipariş onayından önce açık onay alınmalı.
  const [accepted, setAccepted] = useState(false);

  function update<K extends keyof Fields>(key: K, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setErrorField(null);

    if (!accepted) {
      setError("Devam etmek için sözleşmeleri onaylamanız gerekiyor.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/siparis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Sipariş oluşturulamadı.");
        setErrorField(data.field ?? null);
        setSubmitting(false);
        return;
      }

      // Sepet, ödeme onaylandıktan sonra temizlenir — ödeme yarıda kalırsa
      // kullanıcı sepetini kaybetmemeli.
      router.push(`/odeme/${data.orderNumber}`);
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
      setSubmitting(false);
    }
  }

  if (!mounted) {
    return (
      <p className="py-stack-lg text-center font-body-md text-body-md text-on-surface-variant">
        Yükleniyor…
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-stack-lg text-center">
        <Icon name="shopping_bag" className="mb-6 text-[48px] text-outline-variant" />
        <p className="mb-stack-md font-headline-sm text-headline-sm text-on-surface">
          Ödeme yapmak için sepetinizde ürün olmalı.
        </p>
        <Button href="/koleksiyonlar" size="lg">
          Koleksiyonları Keşfet
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-gutter lg:flex-row">
      <div className="flex-1 space-y-stack-md">
        {/* Fiyat/stok bayatlamışsa kullanıcı ödemeden ÖNCE görsün */}
        <CartSyncNotice />
        <section>
          <h2 className="mb-stack-sm flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface">
            <Icon name="mail" className="text-tertiary" />
            İletişim
          </h2>
          <input
            required
            type="email"
            placeholder="E-posta Adresi"
            value={fields.email}
            onChange={(e) => update("email", e.target.value)}
            className={cn(fieldClass, errorField === "email" && "border-error")}
          />
          <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant/80">
            Sipariş onayınızı bu adrese göndereceğiz.
          </p>
        </section>

        <section>
          <h2 className="mb-stack-sm flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface">
            <Icon name="local_shipping" className="text-tertiary" />
            Teslimat Adresi
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              required
              placeholder="Ad"
              value={fields.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              className={cn(fieldClass, errorField === "firstName" && "border-error")}
            />
            <input
              required
              placeholder="Soyad"
              value={fields.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              className={cn(fieldClass, errorField === "lastName" && "border-error")}
            />
            <input
              required
              placeholder="Adres"
              value={fields.address}
              onChange={(e) => update("address", e.target.value)}
              className={cn(fieldClass, "md:col-span-2", errorField === "address" && "border-error")}
            />
            <input
              placeholder="Daire, kat vb. (isteğe bağlı)"
              value={fields.addressLine2}
              onChange={(e) => update("addressLine2", e.target.value)}
              className={cn(fieldClass, "md:col-span-2")}
            />
            <input
              required
              placeholder="İl"
              value={fields.city}
              onChange={(e) => update("city", e.target.value)}
              className={cn(fieldClass, errorField === "city" && "border-error")}
            />
            <input
              placeholder="İlçe"
              value={fields.district}
              onChange={(e) => update("district", e.target.value)}
              className={fieldClass}
            />
            <input
              required
              inputMode="numeric"
              placeholder="Posta Kodu"
              value={fields.postalCode}
              onChange={(e) => update("postalCode", e.target.value)}
              className={cn(fieldClass, errorField === "postalCode" && "border-error")}
            />
            <input
              required
              type="tel"
              placeholder="Telefon (05XX XXX XX XX)"
              value={fields.phone}
              onChange={(e) => update("phone", e.target.value)}
              className={cn(fieldClass, errorField === "phone" && "border-error")}
            />
            <input
              placeholder="Sipariş notu (isteğe bağlı)"
              value={fields.note}
              onChange={(e) => update("note", e.target.value)}
              className={cn(fieldClass, "md:col-span-2")}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-stack-sm flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface">
            <Icon name="credit_card" className="text-tertiary" />
            Ödeme
          </h2>
          <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-6">
            <p className="font-body-md text-body-md text-on-surface">
              Kredi / banka kartı ile güvenli ödeme
            </p>
            <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">
              Devam ettiğinizde sipariş özetiniz oluşturulur ve PayTR&apos;nin güvenli ödeme
              ekranına yönlendirilirsiniz. Kart bilgileriniz sitemize hiçbir zaman iletilmez.
            </p>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-error/30 bg-error-container px-4 py-3 font-body-sm text-body-sm text-on-error-container"
          >
            {error}
          </div>
        )}
      </div>

      <div className="w-full shrink-0 lg:w-96">
        <OrderSummary subtotal={subtotal} action={null}>
          <div className="mb-6 space-y-4 border-b border-outline-variant/30 pb-6">
            {items.map((item) => (
              <div key={item.variantId} className="flex items-center gap-3">
                <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded bg-surface-container">
                  {item.image && (
                    <SafeImage src={item.image} alt="" fill sizes="56px" className="object-cover" />
                  )}
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 font-label-caps text-[10px] leading-none text-on-primary">
                    {item.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-body-sm text-body-sm text-on-surface">{item.name}</p>
                  <p className="font-body-sm text-[12px] text-on-surface-variant">
                    {item.color} / {item.size}
                  </p>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <label className="mb-4 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-tertiary"
            />
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              <Link
                href="/on-bilgilendirme-formu"
                target="_blank"
                className="text-primary underline underline-offset-2"
              >
                Ön Bilgilendirme Formu
              </Link>
              &apos;nu ve{" "}
              <Link
                href="/mesafeli-satis-sozlesmesi"
                target="_blank"
                className="text-primary underline underline-offset-2"
              >
                Mesafeli Satış Sözleşmesi
              </Link>
              &apos;ni okudum, onaylıyorum.
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting || !accepted}
            className="w-full rounded bg-tertiary py-4 font-label-caps text-label-caps uppercase text-on-tertiary shadow-ambient transition-colors duration-300 hover:bg-on-tertiary-fixed-variant disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Sipariş oluşturuluyor…" : "Ödemeye Geç"}
          </button>

          <Link
            href="/sepet"
            className="mt-4 block text-center font-label-caps text-label-caps uppercase text-on-surface-variant transition-colors hover:text-primary"
          >
            Sepete Dön
          </Link>
        </OrderSummary>
      </div>
    </form>
  );
}

export default CheckoutForm;
