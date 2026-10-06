import { HERO, PRIMARY_CTA } from "@/config/content";
import { CtaLink } from "@/components/landing/cta-link";
import { OfferAccordion } from "@/components/landing/offer-accordion";
import { MemberResults } from "@/components/landing/member-results";
import { SocialProof } from "@/components/landing/social-proof";
import { VslPlayer } from "@/components/landing/vsl";

const FLOATS = ["💰", "📉", "📈", "💸", "💵", "💹", "🏦", "💶"];

function SpotLabel() {
  return (
    <>
      {PRIMARY_CTA}
      <svg className="spot-flame" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
}

export function LandingPage({ videoUrl }: { videoUrl: string }) {
  return (
    <div className="lp">
      <div className="lp-float" aria-hidden="true">
        {FLOATS.map((icon, index) => (
          <span key={`${icon}-${index}`} style={{ ["--i" as string]: String(index) }}>
            {icon}
          </span>
        ))}
      </div>
      <h1>
        {HERO.headlineLead} <span className="accent">{HERO.headlineAccent}</span>
      </h1>
      <p className="lp-sub">{HERO.supporting}</p>
      <VslPlayer videoUrl={videoUrl} />
      <CtaLink location="hero" id="hero-cta" className="btn btn-spot">
        <SpotLabel />
      </CtaLink>
      <p className="lp-note">{HERO.applicationNote}</p>
      <OfferAccordion />
      <MemberResults />
      <SocialProof />
    </div>
  );
}
