"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Input from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/sifre/sifirla", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Şifre değiştirilemedi.");
        setSubmitting(false);
        return;
      }

      setDone(true);
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-8 text-center">
        <Icon name="check_circle" className="mb-4 text-[40px] text-primary" />
        <p className="mb-2 font-headline-sm text-headline-sm text-on-surface">
          Şifreniz güncellendi.
        </p>
        <p className="mb-stack-sm font-body-md text-body-md text-on-surface-variant">
          Yeni şifrenizle giriş yapabilirsiniz.
        </p>
        <button
          onClick={async () => {
            await signIn(undefined, { callbackUrl: "/hesabim" });
            router.refresh();
          }}
          className="rounded-lg bg-tertiary px-8 py-3 font-label-caps text-label-caps uppercase text-on-tertiary transition-colors duration-300 hover:bg-on-tertiary-fixed-variant"
        >
          Giriş Yap
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Input
        id="password"
        label="Yeni Şifre"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        hint="En az 8 karakter."
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Input
        id="confirm"
        label="Yeni Şifre (Tekrar)"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-error/30 bg-error-container px-4 py-3 font-body-sm text-body-sm text-on-error-container"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-tertiary py-4 font-label-caps text-label-caps uppercase text-on-tertiary transition-colors duration-300 hover:bg-on-tertiary-fixed-variant disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Kaydediliyor…" : "Şifreyi Güncelle"}
      </button>

      <p className="text-center font-body-sm text-body-sm text-on-surface-variant">
        <Link href="/sifremi-unuttum" className="text-primary hover:underline">
          Yeni bağlantı iste
        </Link>
      </p>
    </form>
  );
}

export default ResetPasswordForm;
