import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ConsentementBanner } from "@/components/ConsentementBanner";
import { AdSenseLoader } from "@/components/AdSenseLoader";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdSenseLoader />
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
      <ConsentementBanner />
    </>
  );
}
