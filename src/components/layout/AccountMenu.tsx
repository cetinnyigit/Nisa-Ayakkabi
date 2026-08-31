"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";

const itemClass =
  "block w-full px-4 py-2 text-left font-label-caps text-label-caps uppercase " +
  "text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary";

export function AccountMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Oturum yokken doğrudan giriş sayfasına götür
  if (status !== "authenticated") {
    return (
      <Link
        href="/giris"
        aria-label="Giriş yap"
        className="transition-colors duration-300 hover:text-primary-container"
      >
        <Icon name="person" className="text-[24px]" />
      </Link>
    );
  }

  const isAdmin = session.user.role === "ADMIN";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Hesabım"
        aria-expanded={open}
        className="flex items-center transition-colors duration-300 hover:text-primary-container"
      >
        <Icon name="person" filled className="text-[24px]" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-3 w-56 overflow-hidden rounded-lg border border-outline-variant/30 bg-surface shadow-ambient">
          <p className="truncate border-b border-outline-variant/30 px-4 py-3 font-body-sm text-body-sm text-on-surface">
            {session.user.name ?? session.user.email}
          </p>

          <Link href="/hesabim" onClick={() => setOpen(false)} className={itemClass}>
            Siparişlerim
          </Link>

          {isAdmin && (
            <Link href="/admin" onClick={() => setOpen(false)} className={itemClass}>
              Yönetim Paneli
            </Link>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={`${itemClass} border-t border-outline-variant/30 hover:text-error`}
          >
            Çıkış Yap
          </button>
        </div>
      )}
    </div>
  );
}

export default AccountMenu;
