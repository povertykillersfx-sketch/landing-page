import type { Metadata, Viewport } from "next";
import { Outfit, Sora } from "next/font/google";
import { BRAND_NAME, META_DESCRIPTION, PAGE_TITLE } from "@/config/content";
import { getPublicConfig } from "@/lib/public-config";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const sora = Sora({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-sora", display: "swap" });

export const viewport: Viewport = {
  themeColor: "#07090e",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const config = getPublicConfig();
  let metadataBase: URL;
  try {
    metadataBase = new URL(config.siteUrl);
  } catch {
    metadataBase = new URL("http://localhost:3000");
  }
  return {
    metadataBase,
    title: { default: PAGE_TITLE, template: "%s · PKFX" },
    description: META_DESCRIPTION,
    applicationName: "PKFX",
    openGraph: {
      title: PAGE_TITLE,
      description: META_DESCRIPTION,
      type: "website",
      siteName: BRAND_NAME,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: PAGE_TITLE,
      description: META_DESCRIPTION,
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${sora.variable}`}>
        <a className="skip-link" href="#content">Skip to content</a>
        <div id="content">{children}</div>
      </body>
    </html>
  );
}
