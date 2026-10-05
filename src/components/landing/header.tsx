"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/landing/logo";

export function SiteHeader({ logoUrl }: { logoUrl: string }) {
  const path = usePathname();
  const onHome = path === "/";
  return (
    <header className={onHome ? "site-header lp-header" : "site-header"}>
      <div className="wrap header-inner">
        <Link href="/" className="logo" aria-label="Poverty Killers FX home">
          <Logo url={logoUrl} />
        </Link>
        {onHome ? null : (
          <Link href="/" className="back-link">
            Back
          </Link>
        )}
      </div>
    </header>
  );
}
