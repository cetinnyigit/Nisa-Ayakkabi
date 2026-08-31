"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Input from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const submitClass =
  "w-full rounded-lg bg-tertiary py-4 font-label-caps text-label-caps uppercase text-on-tertiary " +
  "transition-colors duration-300 hover:bg-on-tertiary-fixed-variant " +
  "disabled:cursor-not-allowed disabled:opacity-50";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/hesabim";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      // Hangi alanın yanlış olduğunu söylemiyoruz — hesap sayımını zorlaştırır.
      setError("E-posta veya şifre hatalı.");
      setSubmitting(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
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
      />
      <div>
        <Input
          id="password"
          label="Şifre"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="mt-2 text-right">
          <Link
            href="/sifremi-unuttum"
            className="font-body-sm text-body-sm text-on-surface-variant transition-colors hover:text-primary"
          >
            Şifremi unuttum
          </Link>
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-error/30 bg-error-container px-4 py-3 font-body-sm text-body-sm text-on-error-container"
        >
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting} className={submitClass}>
        {submitting ? "Giriş yapılıyor…" : "Giriş Yap"}
      </button>

      <p className="text-center font-body-sm text-body-sm text-on-surface-variant">
        Hesabınız yok mu?{" "}
        <Link href="/kayit" className="text-primary hover:underline">
          Kayıt olun
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [fields, setFields] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setErrorField(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/kayit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Kayıt oluşturulamadı.");
        setErrorField(data.field ?? null);
        setSubmitting(false);
        return;
      }

      // Kayıttan sonra doğrudan giriş yap
      await signIn("credentials", {
        email: fields.email,
        password: fields.password,
        redirect: false,
      });
      router.push("/hesabim");
      router.refresh();
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Input
        id="name"
        label="Ad Soyad"
        required
        autoComplete="name"
        value={fields.name}
        onChange={(e) => setFields((f) => ({ ...f, name: e.target.value }))}
        error={errorField === "name" ? " " : undefined}
      />
      <Input
        id="email"
        label="E-posta"
        type="email"
        required
        autoComplete="email"
        value={fields.email}
        onChange={(e) => setFields((f) => ({ ...f, email: e.target.value }))}
        error={errorField === "email" ? " " : undefined}
      />
      <Input
        id="password"
        label="Şifre"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        hint="En az 8 karakter."
        value={fields.password}
        onChange={(e) => setFields((f) => ({ ...f, password: e.target.value }))}
        error={errorField === "password" ? " " : undefined}
      />

      {error && (
        <p
          role="alert"
          className={cn(
            "rounded-lg border border-error/30 bg-error-container px-4 py-3",
            "font-body-sm text-body-sm text-on-error-container"
          )}
        >
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting} className={submitClass}>
        {submitting ? "Hesap oluşturuluyor…" : "Hesap Oluştur"}
      </button>

      <p className="text-center font-body-sm text-body-sm text-on-surface-variant">
        Zaten hesabınız var mı?{" "}
        <Link href="/giris" className="text-primary hover:underline">
          Giriş yapın
        </Link>
      </p>
    </form>
  );
}
