"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { PRIMARY_CTA } from "@/config/content";
import { track } from "@/lib/analytics-client";

export function CtaLink({
  location,
  className = "btn btn-primary",
  id,
  children,
}: {
  location: string;
  className?: string;
  id?: string;
  children?: ReactNode;
}) {
  return (
    <Link
      id={id}
      href="/apply"
      className={className}
      data-testid={`cta-${location}`}
      onClick={() => track("cta_click", { location })}
    >
      {children || PRIMARY_CTA}
    </Link>
  );
}
