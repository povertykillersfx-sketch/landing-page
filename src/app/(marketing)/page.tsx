import { BRAND_NAME, META_DESCRIPTION } from "@/config/content";
import { TrackView } from "@/components/analytics/track-view";
import { FinalCta, FeaturesSection, Hero, ProblemSection, TestimonialsSection, TrustSection } from "@/components/landing/sections";
import { StickyCta } from "@/components/landing/sticky-cta";
import { VslSection } from "@/components/landing/vsl";
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
      <Hero />
      <VslSection videoUrl={config.vslVideoUrl} />
      <ProblemSection />
      <FeaturesSection />
      <TestimonialsSection />
      <TrustSection />
      <FinalCta />
      <StickyCta />
    </>
  );
}
