import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="flex-1 mx-auto max-w-3xl px-4 py-12">{children}</div>
      <SiteFooter />
    </>
  );
}
