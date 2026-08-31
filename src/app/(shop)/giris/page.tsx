import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/AuthForms";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Giriş Yap",
  robots: { index: false },
};

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/hesabim");

  return (
    <div className="container-nisa py-stack-lg">
      <div className="mx-auto max-w-md">
        <header className="mb-stack-md text-center">
          <h1 className="mb-2 font-display-lg text-display-lg-mobile text-on-surface md:text-display-lg">
            Giriş Yap
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Siparişlerinizi takip etmek için hesabınıza girin.
          </p>
        </header>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>

        <p className="mt-stack-md rounded-lg border border-outline-variant/30 bg-surface-container-low p-4 text-center font-body-sm text-body-sm text-on-surface-variant">
          Alışveriş için üyelik gerekmiyor — sepetinizi doldurup misafir olarak da sipariş
          verebilirsiniz.
        </p>
      </div>
    </div>
  );
}
