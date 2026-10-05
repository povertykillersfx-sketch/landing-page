"use client";

import { useRef, useState } from "react";
import type { Testimonial } from "@/config/testimonials";
import { safeMediaUrl } from "@/lib/urls";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [shot, setShot] = useState("");
  if (!testimonials.length) {
    return <p className="empty">Trader stories will appear here once they are added.</p>;
  }
  function scrollByCard(direction: number) {
    const node = scroller.current;
    if (!node) return;
    const card = node.querySelector("article");
    const amount = (card?.getBoundingClientRect().width || 280) + 14;
    node.scrollBy({ left: amount * direction, behavior: "smooth" });
  }
  return (
    <div>
      <div
        ref={scroller}
        className="carousel"
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Testimonials"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") scrollByCard(1);
          if (event.key === "ArrowLeft") scrollByCard(-1);
        }}
      >
        {testimonials.map((item) => {
          const image = safeMediaUrl(item.image);
          const screenshot = safeMediaUrl(item.screenshot);
          return (
            <article className="t-card" key={`${item.name}-${item.testimonial.slice(0, 24)}`}>
              <div className="t-top">
                {image ? (
                  <img className="avatar-img" src={image} alt="" loading="lazy" decoding="async" />
                ) : (
                  <span className="avatar" aria-hidden="true">{initials(item.name) || "PK"}</span>
                )}
                <div>
                  <strong>{item.name}</strong>
                  {item.role ? <div className="faint">{item.role}</div> : null}
                </div>
              </div>
              <p>{item.testimonial}</p>
              {screenshot ? (
                <button
                  type="button"
                  onClick={() => {
                    setShot(screenshot);
                    dialog.current?.showModal();
                  }}
                  style={{ padding: 0, border: 0, background: "transparent" }}
                >
                  <img className="shot" src={screenshot} alt={`Screenshot shared by ${item.name}`} loading="lazy" decoding="async" />
                </button>
              ) : null}
            </article>
          );
        })}
      </div>
      {testimonials.length > 1 ? (
        <div className="carousel-nav">
          <button type="button" className="btn btn-ghost" onClick={() => scrollByCard(-1)} aria-label="Previous testimonials">
            Previous
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => scrollByCard(1)} aria-label="Next testimonials">
            Next
          </button>
        </div>
      ) : null}
      <dialog
        ref={dialog}
        className="lightbox"
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current?.close();
        }}
      >
        {shot ? <img src={shot} alt="" /> : null}
      </dialog>
    </div>
  );
}
