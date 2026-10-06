"use client";

import { useState } from "react";
import { features, featuresHeading } from "@/config/features";

export function OfferAccordion() {
  const [open, setOpen] = useState(0);
  return (
    <section className="lp-offer" id="offer" aria-labelledby="offer-heading">
      <div className="lp-offer-head">
        <h2 id="offer-heading">{featuresHeading}</h2>
      </div>
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
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                    <path d="m8.5 12.2 2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="offer-title">{feature.title}</span>
                <span className={`offer-chevron ${expanded ? "up" : ""}`} aria-hidden="true" />
              </button>
              {expanded ? <p>{feature.description}</p> : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
