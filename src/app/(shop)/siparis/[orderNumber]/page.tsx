import type { Metadata } from "next";
import SafeImage from "@/components/ui/SafeImage";
import { notFound, redirect } from "next/navigation";
import ClearCartOnSuccess from "@/components/checkout/ClearCartOnSuccess";
import Button from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice, toNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sipariş Durumu",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  PENDING: "Hazırlanıyor",
  PROCESSING: "Hazırlanıyor",
  SHIPPED: "Kargoya verildi",
  DELIVERED: "Teslim edildi",
  CANCELLED: "İptal edildi",
};

export default async function OrderPage({ params }: { params: { orderNumber: string } }) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: {
      address: true,
      items: {
        include: {
          product: { select: { name: true, slug: true, images: { take: 1, select: { url: true } } } },
          variant: true,
        },
      },
    },
  });

  if (!order) notFound();

  // Misafir siparişleri sipariş numarası bilinerek açılabilir (kullanıcının tek erişim
  // yolu bu). Bir hesaba bağlı siparişi ise yalnızca sahibi ya da yönetici görebilir.
  if (order.userId) {
    const session = await auth();
    // E-postadaki bağlantı çoğu zaman oturum açık olmayan bir tarayıcıda açılır:
    // 404 yerine girişe gönder, girişten sonra siparişe geri dönülsün.
    if (!session) {
      redirect(`/giris?callbackUrl=${encodeURIComponent(`/siparis/${order.orderNumber}`)}`);
    }
    const isOwner = session?.user?.id === order.userId;
    const isAdmin = session?.user?.role === "ADMIN";
    if (!isOwner && !isAdmin) notFound();
  }

  const paid = order.paymentStatus === "PAID";
  const pending = order.paymentStatus === "PENDING";

  return (
    <div className="container-nisa py-stack-lg">
      {paid && <ClearCartOnSuccess />}

      <div className="mx-auto max-w-2xl">
        <header className="mb-stack-md text-center">
          <Icon
            name={paid ? "check_circle" : pending ? "schedule" : "error"}
            className={`mb-4 text-[56px] ${paid ? "text-primary" : pending ? "text-tertiary" : "text-error"}`}
          />
          <h1 className="mb-2 font-display-lg text-display-lg-mobile text-on-surface md:text-display-lg">
            {paid
              ? "Siparişiniz alındı"
              : pending
                ? "Ödeme bekleniyor"
                : "Ödeme tamamlanamadı"}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            {paid
              ? "Teşekkür ederiz. Sipariş onayını e-posta adresinize gönderdik."
              : pending
                ? "Ödemeniz henüz onaylanmadı. Bankanızdan onay gelirse sipariş otomatik olarak işleme alınır."
                : "Ödeme sırasında bir sorun oluştu. Kartınızdan tahsilat yapılmadı."}
          </p>
        </header>

        <div className="mb-stack-md rounded-lg border border-outline-variant/30 bg-surface-container-low p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/30 pb-4">
            <div>
              <p className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                Sipariş No
              </p>
              <p className="font-headline-sm text-headline-sm text-on-surface">
                {order.orderNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                Tarih
              </p>
              <p className="font-body-md text-body-md text-on-surface">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded bg-surface-container">
                  {item.product.images[0] && (
                    <SafeImage
                      src={item.product.images[0].url}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-body-md text-body-md text-on-surface">{item.product.name}</p>
                  {item.variant && (
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {item.variant.color} / {item.variant.size} · {item.quantity} adet
                    </p>
                  )}
                </div>
                <span className="font-body-md text-body-md text-on-surface">
                  {formatPrice(toNumber(item.price) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2 border-t border-outline-variant/30 pt-4 font-body-md text-body-md text-on-surface-variant">
            <div className="flex justify-between">
              <span>Ara Toplam</span>
              <span>{formatPrice(toNumber(order.subtotal))}</span>
            </div>
            <div className="flex justify-between">
              <span>Kargo</span>
              <span>
                {toNumber(order.shippingCost) === 0
                  ? "Ücretsiz"
                  : formatPrice(toNumber(order.shippingCost))}
              </span>
            </div>
            <div className="flex justify-between pt-2 font-headline-sm text-headline-sm text-on-surface">
              <span>Toplam</span>
              <span className="text-primary">{formatPrice(toNumber(order.total))}</span>
            </div>
          </div>
        </div>

        <div className="mb-stack-md grid grid-cols-1 gap-gutter md:grid-cols-2">
          <div className="rounded-lg border border-outline-variant/30 p-6">
            <p className="mb-2 font-label-caps text-label-caps uppercase text-on-surface-variant">
              Teslimat Adresi
            </p>
            <p className="font-body-md text-body-md text-on-surface">
              {order.address.firstName} {order.address.lastName}
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {order.address.address}
              <br />
              {order.address.district && `${order.address.district}, `}
              {order.address.city} {order.address.postalCode}
              <br />
              {order.address.phone}
            </p>
          </div>

          <div className="rounded-lg border border-outline-variant/30 p-6">
            <p className="mb-2 font-label-caps text-label-caps uppercase text-on-surface-variant">
              Sipariş Durumu
            </p>
            <p className="font-body-md text-body-md text-on-surface">
              {statusLabels[order.status] ?? order.status}
            </p>
            <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">
              Ödeme:{" "}
              {paid ? "Onaylandı" : pending ? "Bekleniyor" : "Başarısız"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {!paid && !pending && (
            <Button href={`/odeme/${order.orderNumber}`}>Tekrar Öde</Button>
          )}
          <Button href="/koleksiyonlar" variant={paid ? "primary" : "ghost"}>
            Alışverişe Devam Et
          </Button>
        </div>
      </div>
    </div>
  );
}
