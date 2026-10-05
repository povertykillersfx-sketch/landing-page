import { HERO } from "@/config/content";
import { CtaLink } from "@/components/landing/cta-link";
import { OfferAccordion } from "@/components/landing/offer-accordion";
import { VslPlayer } from "@/components/landing/vsl";

const MARKETS = ["EUR/USD", "GBP/USD", "XAU/USD", "USD/JPY", "US100", "NAS100", "UK100", "GER40"];

export function LandingPage({ videoUrl }: { videoUrl: string }) {
  const tape = [...MARKETS, ...MARKETS];
  return (
    <div className="lp">
      <h1>
        <span>{HERO.headlineLead}</span>
        <span className="accent">{HERO.headlineAccent}</span>
        <span>{HERO.headlineMid}</span>
        <span className="accent">{HERO.headlineFree}</span>
      </h1>
      <p className="lp-sub">{HERO.supporting}</p>
      <VslPlayer videoUrl={videoUrl} />
      <CtaLink location="hero" id="hero-cta" className="btn btn-go" />
      <p className="lp-proof">{HERO.freeLine}</p>
      <p className="lp-note">{HERO.applicationNote}</p>
      <div className="lp-ticker" aria-hidden="true">
        <div className="lp-ticker-track">
          {tape.map((symbol, index) => (
            <span key={`${symbol}-${index}`}>{symbol}</span>
          ))}
        </div>
      </div>
      <OfferAccordion />
      <CtaLink location="offer" className="btn btn-go" />
    </div>
  );
}
