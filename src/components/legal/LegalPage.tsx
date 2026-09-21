import Link from "next/link";

/**
 * Yasal metin sayfalarının ortak çerçevesi (mesafeli satış, iade, teslimat,
 * gizlilik, ön bilgilendirme). Tipografi tek yerden yönetilsin diye ayrıldı.
 */
export function LegalPage({
  title,
  intro,
  updatedAt,
  children,
}: {
  title: string;
  intro?: string;
  /** "15.09.2026" gibi — metnin son güncellenme tarihi */
  updatedAt?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pb-stack-lg pt-stack-md">
      <header className="container-nisa mb-stack-md max-w-3xl">
        <h1 className="mb-4 font-display-lg text-display-lg-mobile text-on-surface md:text-display-lg">
          {title}
        </h1>
        {intro && (
          <p className="font-body-lg text-body-lg text-on-surface-variant">{intro}</p>
        )}
        {updatedAt && (
          <p className="mt-4 font-body-sm text-body-sm text-on-surface-variant/70">
            Son güncelleme: {updatedAt}
          </p>
        )}
      </header>

      <div className="container-nisa max-w-3xl space-y-stack-md">{children}</div>
    </div>
  );
}

/** Numaralı/başlıklı madde bloğu */
export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-stack-sm font-headline-sm text-headline-sm text-on-surface">
        {heading}
      </h2>
      <div className="space-y-4 font-body-md text-body-md leading-relaxed text-on-surface-variant">
        {children}
      </div>
    </section>
  );
}

/** Ad/değer çiftlerini iki sütunlu tablo gibi gösterir (satıcı bilgileri vb.) */
export function LegalTable({ rows }: { rows: Array<[string, React.ReactNode]> }) {
  return (
    <dl className="divide-y divide-outline-variant/30 rounded-lg border border-outline-variant/30 bg-surface-container-low">
      {rows.map(([label, value]) => (
        <div key={label} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:gap-6">
          <dt className="font-label-caps text-label-caps uppercase text-on-surface-variant sm:w-56 sm:shrink-0">
            {label}
          </dt>
          <dd className="font-body-md text-body-md text-on-surface">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Metin içi iç bağlantı — yasal sayfalar birbirine referans veriyor */
export function LegalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-primary underline underline-offset-4 hover:opacity-80">
      {children}
    </Link>
  );
}

export default LegalPage;
