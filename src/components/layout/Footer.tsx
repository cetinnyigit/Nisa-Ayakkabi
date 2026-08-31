import Link from "next/link";

const links = [
  { label: "Marka Hikayesi", href: "/marka-hikayesi" },
  { label: "Sürdürülebilirlik", href: "/surdurulebilirlik" },
  { label: "Kargo & İade", href: "/kargo-ve-iade" },
  { label: "Bize Ulaşın", href: "/iletisim" },
  { label: "Gizlilik Politikası", href: "/gizlilik" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="container-nisa mt-stack-lg flex flex-col justify-between gap-gutter bg-surface-container-low py-stack-md md:flex-row">
      <div className="flex flex-col gap-4">
        <span className="font-headline-sm text-headline-sm text-tertiary">NISA</span>
        <p className="font-body-sm text-body-sm uppercase text-tertiary">
          © {year} Nisa Ayakkabı. El işçiliği lüks parçalar.
        </p>
      </div>

      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="font-label-caps text-label-caps uppercase text-on-surface-variant transition-colors duration-300 hover:text-primary"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}

export default Footer;
