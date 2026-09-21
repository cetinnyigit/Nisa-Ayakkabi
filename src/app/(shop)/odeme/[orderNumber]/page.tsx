import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import PaytrFrame from "@/components/checkout/PaytrFrame";
import { Icon } from "@/components/ui/Icon";
import { auth } from "@/lib/auth";
import { company } from "@/lib/company";
import { preparePaymentOid } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { createPaytrToken, isPaytrConfigured } from "@/lib/paytr";
import { formatPrice, toNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Güvenli Ödeme",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

function siteUrl() {
  const envUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const host = headers().get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

function clientIp() {
  const h = headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? "127.0.0.1";
}

export default async function PaymentPage({
  params,
  searchParams,
}: {
  params: { orderNumber: string };
  searchParams: { durum?: string };
}) {
  // PayTR başarısız ödemede merchant_fail_url'e yönlendirir.
  const failedAttempt = searchParams.durum === "basarisiz";

  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: {
      address: true,
      // Üye siparişlerinde guestEmail null kalır; PayTR'ye gerçek adres gitmeli.
      user: { select: { email: true } },
      items: { include: { product: { select: { name: true } }, variant: true } },
    },
  });

  if (!order) notFound();

  // Bir hesaba bağlı siparişin ödeme ekranı yalnızca sahibine (veya yöneticiye)
  // açılır. Aksi halde sipariş numarasını bilen herkes tutarı görebilir ve her
  // yenilemede PayTR'ye token isteği tetikleyebilirdi.
  if (order.userId) {
    const session = await auth();
    const isOwner = session?.user?.id === order.userId;
    const isAdmin = session?.user?.role === "ADMIN";
    if (!isOwner && !isAdmin) notFound();
  }

  // Ödemesi tamamlanmış siparişte ödeme ekranı gösterilmez
  if (order.paymentStatus === "PAID") {
    redirect(`/siparis/${order.orderNumber}`);
  }

  if (!isPaytrConfigured()) {
    return (
      <div className="container-nisa py-stack-lg">
        <div className="mx-auto max-w-xl rounded-lg border border-outline-variant/30 bg-surface-container-low p-8 text-center">
          <Icon name="build" className="mb-4 text-[40px] text-tertiary" />
          <h1 className="mb-2 font-headline-sm text-headline-sm text-on-surface">
            Ödeme altyapısı henüz etkin değil
          </h1>
          <p className="mb-6 font-body-md text-body-md text-on-surface-variant">
            Siparişiniz <strong>{order.orderNumber}</strong> numarasıyla oluşturuldu ancak ödeme
            sağlayıcısı yapılandırılmadığı için tahsilat yapılamıyor.
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant/80">
            Yönetici için: <code>PAYTR_MERCHANT_ID</code>, <code>PAYTR_MERCHANT_KEY</code> ve{" "}
            <code>PAYTR_MERCHANT_SALT</code> ortam değişkenlerini tanımlayın.
          </p>
          <Link
            href="/sepet"
            className="mt-6 inline-block font-label-caps text-label-caps uppercase text-primary hover:underline"
          >
            Sepete Dön
          </Link>
        </div>
      </div>
    );
  }

  const site = siteUrl();

  // Her ödeme denemesi PayTR'ye ayrı bir merchant_oid ile gider; başarısız bir
  // denemeden sonra aynı numarayla token istenemez.
  const merchantOid = await preparePaymentOid(order);

  let token: string | null = null;
  let error: string | null = null;

  try {
    token = await createPaytrToken({
      orderNumber: merchantOid,
      email: order.user?.email ?? order.guestEmail ?? company.supportEmail,
      amount: toNumber(order.total),
      userName: `${order.address.firstName} ${order.address.lastName}`,
      userAddress: `${order.address.address}, ${order.address.district ?? ""} ${order.address.city}`.trim(),
      userPhone: order.address.phone,
      userIp: clientIp(),
      basket: order.items.map((item) => ({
        name: item.variant
          ? `${item.product.name} (${item.variant.color} / ${item.variant.size})`
          : item.product.name,
        price: toNumber(item.price),
        quantity: item.quantity,
      })),
      okUrl: `${site}/siparis/${order.orderNumber}`,
      failUrl: `${site}/odeme/${order.orderNumber}?durum=basarisiz`,
    });
  } catch (e) {
    console.error("PayTR token alınamadı:", e);
    error = e instanceof Error ? e.message : "Ödeme başlatılamadı.";
  }

  return (
    <div className="container-nisa py-stack-lg">
      <div className="mx-auto max-w-3xl">
        <header className="mb-stack-md text-center">
          <h1 className="mb-2 font-display-lg text-display-lg-mobile text-on-surface md:text-display-lg">
            Güvenli Ödeme
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Sipariş No: <strong className="text-on-surface">{order.orderNumber}</strong> &nbsp;·&nbsp;
            Tutar: <strong className="text-primary">{formatPrice(toNumber(order.total))}</strong>
          </p>
        </header>

        {failedAttempt && !error && (
          <div
            role="alert"
            className="mb-stack-sm rounded-lg border border-error/30 bg-error-container p-4 text-center font-body-md text-body-md text-on-error-container"
          >
            Önceki ödeme tamamlanamadı, kartınızdan tahsilat yapılmadı. Aşağıdan tekrar
            deneyebilirsiniz.
          </div>
        )}

        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-error/30 bg-error-container p-6 text-center font-body-md text-body-md text-on-error-container"
          >
            <p className="mb-4">{error}</p>
            <Link
              href={`/odeme/${order.orderNumber}`}
              className="font-label-caps text-label-caps uppercase underline"
            >
              Tekrar Dene
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container-lowest shadow-ambient">
            <PaytrFrame token={token!} />
          </div>
        )}

        <p className="mt-6 text-center font-body-sm text-body-sm text-on-surface-variant/80">
          <Icon name="lock" className="align-middle text-[16px]" /> Kart bilgileriniz doğrudan
          PayTR&apos;ye iletilir, sitemizde saklanmaz.
        </p>
      </div>
    </div>
  );
}
