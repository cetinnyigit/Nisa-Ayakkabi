import Link from "next/link";
import SalesChart from "@/components/admin/SalesChart";
import StatCard from "@/components/admin/StatCard";
import { Icon } from "@/components/ui/Icon";
import {
  LOW_STOCK_THRESHOLD,
  getDashboardStats,
  getLowStockVariants,
  getRecentOrders,
  getSalesSeries,
} from "@/lib/admin-queries";
import { formatDate, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  PENDING: "Bekliyor",
  PROCESSING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim edildi",
  CANCELLED: "İptal",
};

const paymentLabels: Record<string, string> = {
  PENDING: "Ödeme bekliyor",
  PAID: "Ödendi",
  FAILED: "Başarısız",
  REFUNDED: "İade",
};

export default async function AdminDashboard() {
  const [stats, orders, lowStock, series] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(),
    getLowStockVariants(),
    getSalesSeries(14),
  ]);

  return (
    <div className="mx-auto max-w-container-max">
      <header className="mb-stack-md">
        <h1 className="mb-2 font-display-lg text-display-lg-mobile text-on-surface md:text-display-lg">
          Hoş Geldiniz.
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Koleksiyonunuzun performansını buradan yönetin.
        </p>
      </header>

      <div className="mb-stack-md grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Toplam Ciro"
          value={formatPrice(stats.revenue)}
          icon="account_balance_wallet"
          hint="Yalnızca ödemesi alınan siparişler"
        />
        <StatCard
          label="Bu Ay"
          value={formatPrice(stats.monthRevenue)}
          icon="trending_up"
        />
        <StatCard
          label="Bekleyen Sipariş"
          value={String(stats.pendingOrders)}
          icon="local_shipping"
          hint={`Toplam ${stats.totalOrders} sipariş`}
        />
        <StatCard
          label="Stok Uyarısı"
          value={String(stats.lowStockCount)}
          icon="inventory_2"
          hint={`${LOW_STOCK_THRESHOLD} adet ve altı varyant`}
          accent={stats.lowStockCount > 0}
        />
      </div>

      <div className="mb-stack-md">
        <SalesChart data={series} />
      </div>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
        {/* Son siparişler */}
        <section className="rounded-lg bg-surface-container-lowest p-6 shadow-ambient lg:col-span-2">
          <div className="mb-6 flex items-center justify-between border-b border-outline-variant/30 pb-4">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Son Siparişler</h2>
            <Link
              href="/admin/siparisler"
              className="font-label-caps text-label-caps uppercase text-primary hover:underline"
            >
              Tümü
            </Link>
          </div>

          {orders.length === 0 ? (
            <p className="py-8 text-center font-body-md text-body-md text-on-surface-variant">
              Henüz sipariş yok.
            </p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/siparisler#${order.orderNumber}`}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/20 pb-4 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="font-body-md text-body-md text-on-surface">{order.customer}</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {order.orderNumber} · {order.itemCount} ürün ·{" "}
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-body-md text-body-md text-primary">
                      {formatPrice(order.total)}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {statusLabels[order.status]} ·{" "}
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
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Stok uyarıları */}
        <section className="rounded-lg bg-surface-container-lowest p-6 shadow-ambient">
          <div className="mb-6 flex items-center justify-between border-b border-outline-variant/30 pb-4">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Azalan Stok</h2>
            <Link
              href="/admin/urunler"
              className="font-label-caps text-label-caps uppercase text-primary hover:underline"
            >
              Yönet
            </Link>
          </div>

          {lowStock.length === 0 ? (
            <p className="py-8 text-center font-body-md text-body-md text-on-surface-variant">
              <Icon name="check_circle" className="mb-2 block text-[32px] text-primary" />
              Stok seviyeleri iyi durumda.
            </p>
          ) : (
            <ul className="space-y-3">
              {lowStock.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-body-sm text-body-sm text-on-surface">
                      {v.productName}
                    </p>
                    <p className="font-body-sm text-[12px] text-on-surface-variant">
                      {v.color} / {v.size}
                    </p>
                  </div>
                  <span
                    className={`font-label-caps text-label-caps ${v.stock <= 0 ? "text-error" : "text-on-surface-variant"}`}
                  >
                    {v.stock <= 0 ? "Tükendi" : `${v.stock} adet`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
