import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/AuthForms";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Kayıt Ol",
  robots: { index: false },
};

export default async function RegisterPage() {
  const session = await auth();
  if (session) redirect("/hesabim");

  return (
    <div className="container-nisa py-stack-lg">
      <div className="mx-auto max-w-md">
        <header className="mb-stack-md text-center">
          <h1 className="mb-2 font-display-lg text-display-lg-mobile text-on-surface md:text-display-lg">
            Hesap Oluştur
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Siparişlerinizi takip edin, adreslerinizi kaydedin.
          </p>
        </header>

        <RegisterForm />
      </div>
    </div>
  );
}
