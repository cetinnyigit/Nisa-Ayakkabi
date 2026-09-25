"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Genel Bakış", icon: "dashboard" },
  { href: "/admin/siparisler", label: "Siparişler", icon: "receipt_long" },
  { href: "/admin/urunler", label: "Ürünler", icon: "shopping_bag" },
  { href: "/admin/kategoriler", label: "Kategoriler", icon: "category" },
  { href: "/admin/gorunum", label: "Görünüm", icon: "wallpaper" },
];

export function AdminNav({ userName }: { userName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Sayfa değişince mobil çekmeceyi kapat
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      {/* Mobil üst çubuk: masaüstünde sabit menü zaten görünür */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center gap-4 border-b border-outline-variant/30 bg-surface px-margin-mobile shadow-ambient md:hidden">
        <button
          type="button"
          aria-label="Menü"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="text-primary"
        >
          <Icon name="menu" />
        </button>
        <Link href="/admin" className="font-headline-sm text-headline-sm text-primary">
          Yönetim Paneli
        </Link>
      </div>

      {/* Çekmece açıkken arka planı karart */}
      {open && (
        <button
          type="button"
          aria-label="Menüyü kapat"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-on-surface/40 md:hidden"
        />
      )}

      <nav
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col overflow-y-auto bg-surface px-6 py-8 shadow-[40px_0_40px_rgba(112,90,73,0.04)] transition-transform duration-300 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-12 flex items-start justify-between gap-4">
          <div>
            <Link href="/admin" className="font-headline-md text-headline-sm text-primary">
              Nisa Ayakkabı
            </Link>
            <p className="mt-2 font-label-caps text-label-caps uppercase text-on-surface-variant">
              Yönetim Paneli
            </p>
          </div>
          <button
            type="button"
            aria-label="Menüyü kapat"
            onClick={() => setOpen(false)}
            className="text-on-surface-variant transition-colors hover:text-primary md:hidden"
          >
            <Icon name="close" />
          </button>
        </div>

        <ul className="flex flex-grow flex-col gap-2">
          {links.map((link) => {
            // "/admin" yalnızca tam eşleşmede aktif olmalı
            const active =
              link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 font-label-caps text-label-caps uppercase transition-colors duration-300",
                    active
                      ? "border-r-2 border-primary bg-secondary-container/40 text-primary"
                      : "text-on-surface-variant hover:bg-secondary-container/50 hover:text-primary"
                  )}
                >
                  <Icon name={link.icon} />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-outline-variant/30 pt-4">
          <p className="mb-3 truncate px-4 font-body-sm text-body-sm text-on-surface-variant">
            {userName}
          </p>
          <Link
            href="/"
            className="flex items-center gap-4 px-4 py-2 font-label-caps text-label-caps uppercase text-on-surface-variant transition-colors hover:text-primary"
          >
            <Icon name="storefront" className="text-[18px]" />
            Mağazaya Dön
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-4 px-4 py-2 font-label-caps text-label-caps uppercase text-on-surface-variant transition-colors hover:text-error"
          >
            <Icon name="logout" className="text-[18px]" />
            Çıkış Yap
          </button>
        </div>
      </nav>
    </>
  );
}

export default AdminNav;
