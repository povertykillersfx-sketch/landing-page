"use client";

import { useState } from "react";
import { features, featuresHeading } from "@/config/features";

export function OfferAccordion() {
  const [open, setOpen] = useState(0);
  return (
    <section className="lp-offer" aria-labelledby="offer-heading">
      <h2 id="offer-heading">{featuresHeading}</h2>
      <ul>
        {features.map((feature, index) => {
          const expanded = open === index;
          return (
            <li key={feature.title} className={expanded ? "open" : undefined}>
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? -1 : index)}
              >
                <span className="offer-check" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12.5 9.2 17 19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="offer-title">{feature.title}</span>
                <span className="offer-chevron" aria-hidden="true" />
              </button>
              {expanded ? <p>{feature.description}</p> : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
