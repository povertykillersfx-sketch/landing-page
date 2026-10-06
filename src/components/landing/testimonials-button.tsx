"use client";

import { useState } from "react";
import { HERO } from "@/config/content";
import { testimonials, testimonialsArePlaceholders } from "@/config/testimonials";
import { TestimonialCarousel } from "@/components/landing/testimonials";

export function TestimonialsButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="btn btn-ghost-spot" onClick={() => setOpen(true)}>
        {HERO.testimonialsCta}
      </button>
      {open ? (
        <div className="lp-modal" role="dialog" aria-modal="true" aria-labelledby="testimonials-title">
          <div className="lp-modal-card">
            <div className="lp-modal-top">
              <h2 id="testimonials-title">Member testimonials</h2>
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            {testimonialsArePlaceholders ? (
              <p className="sample-banner" role="note">
                Member stories will appear here once real testimonials are added in src/config/testimonials.ts.
              </p>
            ) : (
              <TestimonialCarousel testimonials={testimonials} />
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
