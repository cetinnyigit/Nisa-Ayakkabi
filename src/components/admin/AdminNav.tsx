"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
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

  return (
    <nav className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-surface px-6 py-8 shadow-[40px_0_40px_rgba(112,90,73,0.04)]">
      <div className="mb-12">
        <Link href="/admin" className="font-headline-md text-headline-sm text-primary">
          Nisa Ayakkabı
        </Link>
        <p className="mt-2 font-label-caps text-label-caps uppercase text-on-surface-variant">
          Yönetim Paneli
        </p>
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
  );
}

export default AdminNav;
