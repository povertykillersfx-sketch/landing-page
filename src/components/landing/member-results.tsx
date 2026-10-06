"use client";

import { useRef, useState } from "react";
import { resultsHeading, resultsNote, testimonials } from "@/config/testimonials";
import { CtaLink } from "@/components/landing/cta-link";
import { PRIMARY_CTA } from "@/config/content";

export function MemberResults() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [shot, setShot] = useState<{ src: string; alt: string } | null>(null);

  return (
    <section className="lp-results" id="testimonials" aria-labelledby="results-heading">
      <p className="lp-results-kicker">From the community</p>
      <h2 id="results-heading">{resultsHeading}</h2>
      <p className="lp-results-note">{resultsNote}</p>
      <div className="results-wall" role="list">
        {testimonials.map((item) => (
          <article className="result-card" key={`${item.name}-${item.screenshot}`} role="listitem">
            <button
              type="button"
              className="result-shot"
              onClick={() => {
                setShot({ src: item.screenshot, alt: `${item.name}: ${item.testimonial}` });
                dialog.current?.showModal();
              }}
            >
              <img src={item.screenshot} alt={`${item.name}: ${item.testimonial}`} loading="lazy" decoding="async" />
            </button>
            <p>
              <strong>{item.name}</strong>
              <q>{item.testimonial}</q>
            </p>
          </article>
        ))}
      </div>
      <CtaLink location="results" className="btn btn-spot">
        {PRIMARY_CTA}
      </CtaLink>
      <dialog
        ref={dialog}
        className="lightbox"
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current?.close();
        }}
      >
        {shot ? <img src={shot.src} alt={shot.alt} /> : null}
      </dialog>
    </section>
  );
}
