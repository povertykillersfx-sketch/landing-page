"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/landing/logo";
import { CtaLink } from "@/components/landing/cta-link";

const links = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#included", label: "What’s included" },
  { href: "#testimonials", label: "Testimonials" },
];

export function SiteHeader({ logoUrl }: { logoUrl: string }) {
  const path = usePathname();
  const onHome = path === "/";
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link href="/" className="logo" aria-label="Poverty Killers FX home">
          <Logo url={logoUrl} />
        </Link>
        {onHome ? (
          <nav className="nav-links" aria-label="Page">
            {links.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        ) : (
          <Link href="/" className="nav-links" style={{ display: "inline-flex" }}>
            Back to site
          </Link>
        )}
        {onHome ? <CtaLink location="header" className="btn btn-primary header-cta" /> : null}
      </div>
    </header>
  );
}
