import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import TrustBar from "@/components/layout/TrustBar";
import { getNavItems } from "@/lib/queries";

/** Vitrin tarafının ortak çerçevesi. Admin paneli bu layout'u kullanmaz. */
export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const nav = await getNavItems();

  return (
    <>
      <Header nav={nav} />
      {/* Header fixed olduğu için içerik 80px aşağıdan başlar */}
      <main className="pt-20">{children}</main>
      <TrustBar />
      <Footer />
    </>
  );
}
