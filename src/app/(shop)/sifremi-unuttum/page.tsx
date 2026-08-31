import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Şifremi Unuttum",
  robots: { index: false },
};

export default async function ForgotPasswordPage() {
  const session = await auth();
  if (session) redirect("/hesabim");

  return (
    <div className="container-nisa py-stack-lg">
      <div className="mx-auto max-w-md">
        <header className="mb-stack-md text-center">
          <h1 className="mb-2 font-display-lg text-display-lg-mobile text-on-surface md:text-display-lg">
            Şifremi Unuttum
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Size bir sıfırlama bağlantısı gönderelim.
          </p>
        </header>

        <ForgotPasswordForm />
      </div>
    </div>
  );
}
