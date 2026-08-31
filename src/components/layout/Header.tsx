"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AccountMenu from "@/components/layout/AccountMenu";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { selectCount, useCart } from "@/store/cart";

export type NavItem = {
  label: string;
  href: string;
  /** İndirim gibi vurgulu bağlantılar kırmızı gösterilir */
  accent?: boolean;
};

const defaultNav: NavItem[] = [
  { label: "Yeni Gelenler", href: "/koleksiyon/yeni-gelenler" },
  { label: "Ayakkabı", href: "/koleksiyon/ayakkabi" },
  { label: "Çanta", href: "/koleksiyon/canta" },
  { label: "Koleksiyonlar", href: "/koleksiyonlar" },
  { label: "İndirim", href: "/koleksiyon/indirim", accent: true },
];

export function Header({ nav = defaultNav }: { nav?: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const count = useCart(selectCount);

  // localStorage'dan gelen sepet sunucu HTML'inde yok; hydration uyuşmazlığını
  // önlemek için rozeti ancak mount sonrası gösteriyoruz.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const cartCount = mounted ? count : 0;

  return (
    <header className="glass fixed top-0 z-50 w-full shadow-ambient transition-all duration-300">
      <div className="container-nisa flex h-20 items-center justify-between">
        <button
          aria-label="Menü"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="text-primary md:hidden"
        >
          <Icon name={open ? "close" : "menu"} />
        </button>

        <Link
          href="/"
          className="font-headline-md text-headline-md tracking-widest text-primary"
        >
          NISA
        </Link>

        <nav className="hidden items-center gap-gutter md:flex">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "font-label-caps text-label-caps uppercase transition-colors duration-300 hover:text-primary",
                  item.accent ? "text-error hover:opacity-80" : "text-on-surface-variant",
                  active && !item.accent && "border-b border-primary/30 pb-1 text-primary"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4 text-primary">
          <Link href="/arama" aria-label="Ara" className="transition-colors duration-300 hover:text-primary-container">
            <Icon name="search" className="text-[24px]" />
          </Link>
          <AccountMenu />
          <Link
            href="/sepet"
            aria-label="Sepetim"
            className="relative transition-colors duration-300 hover:text-primary-container"
          >
            <Icon name="shopping_bag" className="text-[24px]" />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-label-caps text-[10px] leading-none text-on-primary">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobil menü */}
      {open && (
        <nav className="border-t border-outline-variant/30 bg-surface px-margin-mobile py-stack-sm md:hidden">
          <ul className="flex flex-col gap-4">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "font-label-caps text-label-caps uppercase transition-colors duration-300",
                    item.accent ? "text-error" : "text-on-surface-variant hover:text-primary"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

export default Header;
