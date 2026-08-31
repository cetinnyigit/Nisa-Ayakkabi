import Link from "next/link";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import { Icon } from "@/components/ui/Icon";
import { getAdminOrders } from "@/lib/admin-queries";
import { cn, formatDate, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const filters = [
  { value: "", label: "Tümü" },
  { value: "PENDING", label: "Bekliyor" },
  { value: "PROCESSING", label: "Hazırlanıyor" },
  { value: "SHIPPED", label: "Kargoda" },
  { value: "DELIVERED", label: "Teslim edildi" },
  { value: "CANCELLED", label: "İptal" },
];

const paymentLabels: Record<string, string> = {
  PENDING: "Ödeme bekliyor",
  PAID: "Ödendi",
  FAILED: "Başarısız",
  REFUNDED: "İade",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { durum?: string; sayfa?: string };
}) {
  const status = searchParams.durum || undefined;
  const pageParam = Number(searchParams.sayfa);
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const { orders, total, pageCount } = await getAdminOrders(status, page);

  function pageHref(target: number) {
    const params = new URLSearchParams();
    if (status) params.set("durum", status);
    if (target > 1) params.set("sayfa", String(target));
    const qs = params.toString();
    return qs ? `/admin/siparisler?${qs}` : "/admin/siparisler";
  }

  return (
    <div className="mx-auto max-w-container-max">
      <header className="mb-stack-sm">
        <h1 className="mb-2 font-display-lg text-headline-md text-on-surface">Siparişler</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Toplam {total} sipariş · sayfa {page}/{pageCount}
        </p>
      </header>

      <div className="mb-stack-sm flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/admin/siparisler?durum=${f.value}` : "/admin/siparisler"}
            className={cn(
              "rounded border px-4 py-2 font-label-caps text-label-caps uppercase transition-colors duration-300",
              (searchParams.durum ?? "") === f.value
                ? "border-primary bg-primary/5 text-primary"
                : "border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary"
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg bg-surface-container-lowest py-stack-lg text-center shadow-ambient">
          <Icon name="receipt_long" className="mb-4 text-[40px] text-outline-variant" />
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Bu filtreye uyan sipariş yok.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              id={order.orderNumber}
              className="rounded-lg bg-surface-container-lowest p-6 shadow-ambient"
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-4 border-b border-outline-variant/30 pb-4">
                <div>
                  <p className="font-headline-sm text-headline-sm text-on-surface">
                    {order.orderNumber}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {formatDate(order.createdAt)} ·{" "}
                    <span
                      className={
                        order.paymentStatus === "PAID"
                          ? "text-primary"
                          : order.paymentStatus === "FAILED"
                            ? "text-error"
                            : undefined
                      }
                    >
                      {paymentLabels[order.paymentStatus]}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-headline-sm text-headline-sm text-primary">
                    {formatPrice(order.total)}
                  </span>
                  <OrderStatusSelect orderId={order.id} status={order.status} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
                <div>
                  <p className="mb-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
                    Müşteri
                  </p>
                  <p className="font-body-md text-body-md text-on-surface">{order.customer}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {order.phone}
                    {order.email && (
                      <>
                        <br />
                        {order.email}
                      </>
                    )}
                    <br />
                    {order.city}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <p className="mb-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
                    Ürünler
                  </p>
                  <ul className="space-y-1">
                    {order.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex justify-between gap-4 font-body-sm text-body-sm text-on-surface"
                      >
                        <span>
                          {item.quantity} × {item.name}
                          {item.variant && (
                            <span className="text-on-surface-variant"> ({item.variant})</span>
                          )}
                        </span>
                        <span className="shrink-0 text-on-surface-variant">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </li>
                    ))}
                    {order.hiddenItemCount > 0 && (
                      <li className="font-body-sm text-body-sm text-on-surface-variant">
                        …ve {order.hiddenItemCount} kalem daha (toplam {order.itemCount})
                      </li>
                    )}
                  </ul>

                  {order.note && (
                    <p className="mt-3 whitespace-pre-line rounded border border-outline-variant/50 bg-surface-container p-3 font-body-sm text-body-sm text-on-surface">
                      {order.note}
                    </p>
                  )}
                </div>
              </div>

              <Link
                href={`/siparis/${order.orderNumber}`}
                className="mt-4 inline-flex items-center gap-2 font-label-caps text-label-caps uppercase text-primary hover:underline"
              >
                Müşteri görünümü
                <Icon name="open_in_new" className="text-[16px]" />
              </Link>
            </article>
          ))}

          {pageCount > 1 && (
            <nav className="flex items-center justify-between gap-4 pt-stack-sm">
              {page > 1 ? (
                <Link
                  href={pageHref(page - 1)}
                  className="inline-flex items-center gap-2 rounded border border-outline-variant px-5 py-3 font-label-caps text-label-caps uppercase text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon name="arrow_back" className="text-[16px]" />
                  Önceki
                </Link>
              ) : (
                <span />
              )}

              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Sayfa {page} / {pageCount}
              </span>

              {page < pageCount ? (
                <Link
                  href={pageHref(page + 1)}
                  className="inline-flex items-center gap-2 rounded border border-outline-variant px-5 py-3 font-label-caps text-label-caps uppercase text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                >
                  Sonraki
                  <Icon name="arrow_forward" className="text-[16px]" />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
