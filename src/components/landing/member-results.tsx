"use client";

import { useRef, useState } from "react";
import { resultsHeading, resultsNote, testimonials } from "@/config/testimonials";
import { CtaLink } from "@/components/landing/cta-link";
import { PRIMARY_CTA } from "@/config/content";

export function MemberResults() {
  const scroller = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [shot, setShot] = useState<{ src: string; alt: string } | null>(null);

  function scrollByCard(direction: number) {
    const node = scroller.current;
    if (!node) return;
    const card = node.querySelector("article");
    const amount = (card?.getBoundingClientRect().width || 280) + 14;
    node.scrollBy({ left: amount * direction, behavior: "smooth" });
  }

  return (
    <section className="lp-results" id="testimonials" aria-labelledby="results-heading">
      <h2 id="results-heading">{resultsHeading}</h2>
      <p className="lp-results-note">{resultsNote}</p>
      <div
        ref={scroller}
        className="results-track"
        tabIndex={0}
        role="region"
        aria-label="Member result screenshots"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") scrollByCard(1);
          if (event.key === "ArrowLeft") scrollByCard(-1);
        }}
      >
        {testimonials.map((item) => (
          <article className="result-card" key={`${item.name}-${item.screenshot}`}>
            <button
              type="button"
              className="result-shot"
              onClick={() => {
                setShot({ src: item.screenshot, alt: `${item.name}: ${item.testimonial}` });
                dialog.current?.showModal();
              }}
            >
              <img src={item.screenshot} alt="" loading="lazy" decoding="async" />
            </button>
            <p>
              <strong>{item.name}</strong>
              {item.testimonial}
            </p>
          </article>
        ))}
      </div>
      {testimonials.length > 1 ? (
        <div className="carousel-nav results-nav">
          <button type="button" className="btn btn-ghost" onClick={() => scrollByCard(-1)} aria-label="Previous results">
            Previous
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => scrollByCard(1)} aria-label="Next results">
            Next
          </button>
        </div>
      ) : null}
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
