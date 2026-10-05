import Link from "next/link";
import { BRAND_NAME, DISCLAIMER } from "@/config/content";
import { Logo } from "@/components/landing/logo";
import { isConfiguredUrl } from "@/lib/urls";
import type { PublicConfig } from "@/config/site";

export function SiteFooter({ config }: { config: PublicConfig }) {
  const socials = [
    ["Instagram", config.instagramUrl],
    ["Telegram", config.telegramUrl],
    ["YouTube", config.youtubeUrl],
  ].filter((item): item is [string, string] => isConfiguredUrl(item[1]));
  return (
    <footer className="site-footer" id="site-footer">
      <div className="wrap footer-grid">
        <div>
          <Link href="/" className="logo">
            <Logo url={config.logoUrl} />
          </Link>
          <p className="disclaimer">{DISCLAIMER}</p>
        </div>
        <div>
          <div className="socials">
            <Link href="/apply">Apply</Link>
            {socials.map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer">
                {label}
              </a>
            ))}
          </div>
          <p className="faint">© {new Date().getFullYear()} {BRAND_NAME}</p>
        </div>
      </div>
    </footer>
  );
}
