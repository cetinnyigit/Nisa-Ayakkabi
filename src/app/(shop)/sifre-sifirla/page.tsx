import type { Metadata } from "next";
import Link from "next/link";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Icon } from "@/components/ui/Icon";
import { TOKEN_TTL_MINUTES, checkResetToken } from "@/lib/password-reset";

export const metadata: Metadata = {
  title: "Yeni Şifre Belirle",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

const reasons: Record<string, string> = {
  not_found: "Bu bağlantı geçersiz.",
  used: "Bu bağlantı zaten kullanılmış.",
  expired: `Bağlantının süresi dolmuş (${TOKEN_TTL_MINUTES} dakika geçerlidir).`,
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token ?? "";
  // Token sunucuda doğrulanır; geçersizse form hiç gösterilmez.
  const check = await checkResetToken(token);

  return (
    <div className="container-nisa py-stack-lg">
      <div className="mx-auto max-w-md">
        <header className="mb-stack-md text-center">
          <h1 className="mb-2 font-display-lg text-display-lg-mobile text-on-surface md:text-display-lg">
            Yeni Şifre
          </h1>
          {check.valid && (
            <p className="font-body-md text-body-md text-on-surface-variant">
              Hesabınız için yeni bir şifre belirleyin.
            </p>
          )}
        </header>

        {check.valid ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-8 text-center">
            <Icon name="link_off" className="mb-4 text-[40px] text-error" />
            <p className="mb-2 font-headline-sm text-headline-sm text-on-surface">
              {reasons[check.reason]}
            </p>
            <p className="mb-stack-sm font-body-md text-body-md text-on-surface-variant">
              Güvenlik gereği sıfırlama bağlantıları tek kullanımlıktır ve kısa süre geçerlidir.
            </p>
            <Link
              href="/sifremi-unuttum"
              className="inline-block rounded-lg bg-tertiary px-8 py-3 font-label-caps text-label-caps uppercase text-on-tertiary transition-colors duration-300 hover:bg-on-tertiary-fixed-variant"
            >
              Yeni Bağlantı İste
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
