import { AnalyticsScripts } from "@/components/analytics/scripts";
import { ReserveProvider } from "@/components/form/reserve-provider";
import { SiteFooter } from "@/components/landing/footer";
import { SiteHeader } from "@/components/landing/header";
import { getCountryOptions } from "@/lib/countries";
import { getPublicConfig } from "@/lib/public-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const config = getPublicConfig();
  return (
    <div className="funnel">
      <AnalyticsScripts gaId={config.gaMeasurementId} pixelId={config.metaPixelId} />
      <ReserveProvider countries={getCountryOptions()}>
        <SiteHeader logoUrl={config.logoUrl} />
        {children}
        <SiteFooter config={config} />
      </ReserveProvider>
    </div>
  );
}
