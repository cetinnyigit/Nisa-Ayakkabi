import { formatPrice } from "@/lib/utils";

export type SalesPoint = { date: string; revenue: number; orders: number };

/**
 * "2026-08-27" değerini YEREL tarih olarak okur. `new Date("2026-08-27")`
 * UTC gece yarısı sayıldığı için negatif saat farkı olan bölgelerde bir gün
 * geriye kayardı.
 */
function parseLocalDate(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Bağımlılıksız sütun grafiği. Değerler sunucuda hesaplanır, çıktı düz SVG'dir —
 * istemciye ekstra JS gitmez.
 */
export function SalesChart({ data }: { data: SalesPoint[] }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  const total = data.reduce((sum, d) => sum + d.revenue, 0);
  const orderCount = data.reduce((sum, d) => sum + d.orders, 0);
  const hasSales = total > 0;

  const width = 100;
  const height = 40;
  const gap = 1.2;
  const barWidth = (width - gap * (data.length - 1)) / data.length;

  return (
    <section className="rounded-lg bg-surface-container-lowest p-6 shadow-ambient">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Satış Grafiği</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Son {data.length} gün · {orderCount} sipariş
          </p>
        </div>
        <p className="font-headline-sm text-headline-sm text-primary">{formatPrice(total)}</p>
      </div>

      {!hasSales ? (
        <p className="py-12 text-center font-body-md text-body-md text-on-surface-variant">
          Bu dönemde ödemesi tamamlanmış sipariş yok.
        </p>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            role="img"
            aria-label={`Son ${data.length} günün günlük cirosu`}
            className="h-48 w-full"
          >
            {data.map((point, i) => {
              const barHeight = (point.revenue / max) * height;
              return (
                <rect
                  key={point.date}
                  x={i * (barWidth + gap)}
                  y={height - barHeight}
                  width={barWidth}
                  height={barHeight || 0.3}
                  rx={0.6}
                  className={point.revenue > 0 ? "fill-primary-container" : "fill-surface-variant"}
                >
                  <title>
                    {parseLocalDate(point.date).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                    })}
                    : {formatPrice(point.revenue)} ({point.orders} sipariş)
                  </title>
                </rect>
              );
            })}
          </svg>

          <div className="mt-2 flex justify-between font-body-sm text-[12px] text-on-surface-variant">
            <span>
              {parseLocalDate(data[0].date).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "short",
              })}
            </span>
            <span>En yüksek gün: {formatPrice(max)}</span>
            <span>
              {parseLocalDate(data[data.length - 1].date).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
        </>
      )}
    </section>
  );
}

export default SalesChart;
