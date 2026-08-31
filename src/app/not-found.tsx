import Link from "next/link";

/**
 * Hiçbir rotaya uymayan adresler için. Kök seviyede olduğu için mağaza
 * başlığı/altbilgisi yoktur; marka kimliğini kendi içinde taşır.
 * Mağaza içi 404'ler (ürün, koleksiyon) `(shop)/not-found.tsx` ile gösterilir.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-margin-mobile text-center">
      <Link
        href="/"
        className="mb-stack-md font-headline-md text-headline-md tracking-widest text-primary"
      >
        NISA
      </Link>

      <p className="mb-2 font-label-caps text-label-caps uppercase tracking-[0.2em] text-on-surface-variant">
        Hata 404
      </p>
      <h1 className="mb-4 font-display-lg text-display-lg-mobile text-on-surface md:text-display-lg">
        Bu sayfa bulunamadı.
      </h1>
      <p className="mb-stack-md max-w-md font-body-lg text-body-lg text-on-surface-variant">
        Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir.
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="rounded-lg bg-tertiary px-8 py-4 font-label-caps text-label-caps uppercase text-on-tertiary transition-colors duration-300 hover:bg-on-tertiary-fixed-variant"
        >
          Ana Sayfa
        </Link>
        <Link
          href="/koleksiyonlar"
          className="rounded-lg border border-primary-container px-8 py-4 font-label-caps text-label-caps uppercase text-primary transition-colors duration-300 hover:bg-primary-fixed/40"
        >
          Koleksiyonlar
        </Link>
      </div>
    </main>
  );
}
