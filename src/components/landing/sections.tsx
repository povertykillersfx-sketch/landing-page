import { ACCESS_STEPS, FINAL_CTA, HERO, PROBLEM } from "@/config/content";
import { features, featuresHeading } from "@/config/features";
import { socialProof, trustPoints } from "@/config/metrics";
import { testimonials, testimonialsArePlaceholders } from "@/config/testimonials";
import { FeatureIcon } from "@/components/icons";
import { CtaLink } from "@/components/landing/cta-link";
import { ScannerMock } from "@/components/landing/scanner";
import { TestimonialCarousel } from "@/components/landing/testimonials";

export function Hero() {
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">{HERO.eyebrow}</p>
          <h1>{HERO.headline}</h1>
          <p className="lede">{HERO.supporting}</p>
          <div className="hero-actions">
            <CtaLink location="hero" id="hero-cta" />
            <p className="micro">{HERO.freeLine}</p>
            <p className="note">{HERO.applicationNote}</p>
          </div>
          <ol className="steps">
            {ACCESS_STEPS.map((step, index) => (
              <li key={step.title}>
                <span className="step-no">{index + 1}</span>
                <div>
                  <strong>{step.title}</strong>
                  <span>{step.text}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <ScannerMock />
      </div>
    </section>
  );
}

export function ProblemSection() {
  return (
    <section className="section" id="problem">
      <div className="wrap">
        <div className="section-head">
          <h2>{PROBLEM.heading}</h2>
          <p className="lede">{PROBLEM.intro}</p>
        </div>
        <div className="problem-grid">
          <ul className="problem-list">
            {PROBLEM.items.map((item, index) => (
              <li key={item}>
                <span className="index">{String(index + 1).padStart(2, "0")}</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <article className="solution-card">
            <h3>{PROBLEM.solution}</h3>
            <p>{PROBLEM.solutionDetail}</p>
          </article>
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section className="section" id="included">
      <div className="wrap">
        <div className="section-head">
          <h2>{featuresHeading}</h2>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <div className="icon-wrap">
                <FeatureIcon name={feature.icon} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TrustSection() {
  const published = socialProof.metrics.filter((metric) => metric.value.trim());
  return (
    <section className="section" id="trust">
      <div className="wrap">
        <div className="section-head">
          <h2>{socialProof.heading}</h2>
          <p className="lede">{socialProof.supporting}</p>
        </div>
        {published.length ? (
          <div className="metric-grid">
            {published.map((metric) => (
              <div className="metric" key={metric.id}>
                <b>{metric.value}</b>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
        ) : null}
        <div className="feature-grid">
          {trustPoints.map((point) => (
            <article className="trust-card" key={point.title}>
              <h3>{point.title}</h3>
              <p>{point.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  return (
    <section className="section" id="testimonials">
      <div className="wrap">
        <div className="section-head">
          <h2>What Traders Are Saying</h2>
        </div>
        {testimonialsArePlaceholders ? (
          <p className="sample-banner" role="note">
            These are sample testimonials for layout preview only. They are not real customer reviews. Replace them in src/config/testimonials.ts.
          </p>
        ) : null}
        <TestimonialCarousel testimonials={testimonials} />
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="section" id="get-started">
      <div className="wrap">
        <div className="cta-band glass">
          <h2>{FINAL_CTA.headline}</h2>
          <p className="lede">{FINAL_CTA.text}</p>
          <CtaLink location="final" />
        </div>
      </div>
    </section>
  );
}
