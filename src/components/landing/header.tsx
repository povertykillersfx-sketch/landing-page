"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/landing/logo";

export function SiteHeader({ logoUrl }: { logoUrl: string }) {
  const path = usePathname();
  const onHome = path === "/";
  const [open, setOpen] = useState(false);
  return (
    <header className={onHome ? "site-header lp-header" : "site-header"}>
      <div className="wrap header-inner">
        <Link href="/" className="logo" aria-label="Poverty Killers FX home">
          <Logo url={logoUrl} />
        </Link>
        {onHome ? (
          <>
            <nav className="nav-links" aria-label="Page">
              <a href="#offer">What’s included</a>
              <a href="#testimonials">Testimonials</a>
            </nav>
            <button
              type="button"
              className="lp-menu"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              <span />
              <span />
              <span />
            </button>
          </>
        ) : (
          <Link href="/" className="back-link">
            Back
          </Link>
        )}
      </div>
      {onHome && open ? (
        <div className="lp-menu-panel">
          <a href="#offer" onClick={() => setOpen(false)}>What’s included</a>
          <a href="#testimonials" onClick={() => setOpen(false)}>Testimonials</a>
        </div>
      ) : null}
    </header>
  );
}
