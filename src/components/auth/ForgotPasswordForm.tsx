"use client";

import Link from "next/link";
import { useState } from "react";
import Input from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/sifre/talep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "İstek gönderilemedi.");
        setSubmitting(false);
        return;
      }

      setMessage(data.message);
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
      setSubmitting(false);
    }
  }

  if (message) {
    return (
      <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-8 text-center">
        <Icon name="mark_email_read" className="mb-4 text-[40px] text-primary" />
        <p className="mb-stack-sm font-body-lg text-body-lg text-on-surface">{message}</p>
        <Link
          href="/giris"
          className="font-label-caps text-label-caps uppercase text-primary hover:underline"
        >
          Giriş sayfasına dön
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Input
        id="email"
        label="E-posta"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        hint="Hesabınıza kayıtlı e-posta adresini girin."
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
        {submitting ? "Gönderiliyor…" : "Sıfırlama Bağlantısı Gönder"}
      </button>

      <p className="text-center font-body-sm text-body-sm text-on-surface-variant">
        <Link href="/giris" className="text-primary hover:underline">
          Giriş sayfasına dön
        </Link>
      </p>
    </form>
  );
}

export default ForgotPasswordForm;
