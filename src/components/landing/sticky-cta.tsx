"use client";

import { useEffect, useState } from "react";
import { CtaLink } from "@/components/landing/cta-link";
import { PRIMARY_CTA } from "@/config/content";

export function StickyCta() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("hero-cta");
    const footer = document.getElementById("site-footer");
    let heroVisible = true;
    let footerVisible = false;
    const update = () => setVisible(!heroVisible && !footerVisible);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === hero) heroVisible = entry.isIntersecting;
          if (entry.target === footer) footerVisible = entry.isIntersecting;
        }
        update();
      },
      { threshold: 0.2 },
    );
    if (hero) observer.observe(hero);
    if (footer) observer.observe(footer);
    update();
    return () => observer.disconnect();
  }, []);
  if (!visible) return null;
  return (
    <div className="sticky-cta">
      <CtaLink location="sticky" className="btn btn-spot">
        {PRIMARY_CTA}
      </CtaLink>
    </div>
  );
}
