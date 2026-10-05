import { AnalyticsScripts } from "@/components/analytics/scripts";
import { SiteFooter } from "@/components/landing/footer";
import { SiteHeader } from "@/components/landing/header";
import { getPublicConfig } from "@/lib/public-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const config = getPublicConfig();
  return (
    <>
      <AnalyticsScripts gaId={config.gaMeasurementId} pixelId={config.metaPixelId} />
      <SiteHeader logoUrl={config.logoUrl} />
      {children}
      <SiteFooter config={config} />
    </>
  );
}
