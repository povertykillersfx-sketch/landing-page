import { BRAND_NAME, META_DESCRIPTION } from "@/config/content";
import { TrackView } from "@/components/analytics/track-view";
import { LandingPage } from "@/components/landing/landing-page";
import { StickyCta } from "@/components/landing/sticky-cta";
import { getPublicConfig } from "@/lib/public-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function HomePage() {
  const config = getPublicConfig();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND_NAME,
    alternateName: "PKFX",
    description: META_DESCRIPTION,
    url: config.siteUrl,
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <TrackView event="landing_page_view" />
      <LandingPage videoUrl={config.vslVideoUrl} />
      <StickyCta />
    </>
  );
}
