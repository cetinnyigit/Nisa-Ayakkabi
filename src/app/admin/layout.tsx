import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Yönetim Paneli",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Middleware zaten /admin/* yolunu koruyor; bu ikinci kontrol, middleware
  // atlanırsa (ör. matcher değişirse) panelin açıkta kalmaması içindir.
  const session = await auth();
  if (!session) redirect("/giris?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen bg-background">
      <AdminNav userName={session.user.name ?? session.user.email ?? "Yönetici"} />
      <main className="ml-0 px-margin-mobile py-stack-md md:ml-64 md:px-margin-desktop">
        {children}
      </main>
    </div>
  );
}
