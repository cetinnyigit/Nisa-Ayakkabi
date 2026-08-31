import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Button from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice, toNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Hesabım",
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

const paymentLabels: Record<string, string> = {
  PENDING: "Ödeme bekleniyor",
  PAID: "Ödendi",
  FAILED: "Ödeme başarısız",
  REFUNDED: "İade edildi",
};

export default async function AccountPage() {
  const session = await auth();
  // Middleware zaten koruyor; bu ikinci kontrol doğrudan erişime karşı.
  if (!session) redirect("/giris?callbackUrl=/hesabim");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { select: { id: true, quantity: true } } },
  });

  return (
    <div className="container-nisa py-stack-lg">
      <header className="mb-stack-md">
        <h1 className="mb-2 font-display-lg text-display-lg-mobile text-on-surface md:text-display-lg">
          Hesabım
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {session.user.name ?? session.user.email}
        </p>
      </header>

      <h2 className="mb-stack-sm font-headline-sm text-headline-sm text-on-surface">
        Siparişlerim
      </h2>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center rounded-lg border border-outline-variant/30 bg-surface-container-low py-stack-lg text-center">
          <Icon name="receipt_long" className="mb-4 text-[40px] text-outline-variant" />
          <p className="mb-stack-sm font-body-lg text-body-lg text-on-surface-variant">
            Henüz siparişiniz yok.
          </p>
          <Button href="/koleksiyonlar">Koleksiyonları Keşfet</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/siparis/${order.orderNumber}`}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-outline-variant/30 bg-surface-container-low p-6 transition-shadow duration-300 hover:shadow-ambient-hover"
            >
              <div>
                <p className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                  {formatDate(order.createdAt)}
                </p>
                <p className="font-headline-sm text-headline-sm text-on-surface">
                  {order.orderNumber}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {order.items.reduce((n, i) => n + i.quantity, 0)} ürün ·{" "}
                  {statusLabels[order.status] ?? order.status} ·{" "}
                  {paymentLabels[order.paymentStatus] ?? order.paymentStatus}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-headline-sm text-headline-sm text-primary">
                  {formatPrice(toNumber(order.total))}
                </span>
                <Icon name="arrow_forward" className="text-tertiary" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
