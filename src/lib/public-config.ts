import "server-only";
import { PKFX_CONFIG, type PublicConfig } from "@/config/site";

function envOverride(name: string, fallback: string) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : fallback;
}

export function getPublicConfig(): PublicConfig {
  return {
    ...PKFX_CONFIG,
    calendlyUrl: envOverride("CALENDLY_URL", PKFX_CONFIG.calendlyUrl),
    telegramUrl: envOverride("TELEGRAM_URL", PKFX_CONFIG.telegramUrl),
    vslVideoUrl: envOverride("VSL_VIDEO_URL", PKFX_CONFIG.vslVideoUrl),
    logoUrl: envOverride("LOGO_URL", PKFX_CONFIG.logoUrl),
    gaMeasurementId: envOverride("GA_MEASUREMENT_ID", PKFX_CONFIG.gaMeasurementId),
    metaPixelId: envOverride("META_PIXEL_ID", PKFX_CONFIG.metaPixelId),
    businessTimezone: envOverride("BUSINESS_TIMEZONE", PKFX_CONFIG.businessTimezone),
    siteUrl: envOverride("SITE_URL", PKFX_CONFIG.siteUrl),
  };
}
