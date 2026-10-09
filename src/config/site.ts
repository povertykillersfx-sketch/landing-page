/**
 * Central PKFX configuration.
 *
 * Replace the placeholder strings below, or set the matching environment
 * variables (environment variables take precedence):
 *
 *   CALENDLY_URL, TELEGRAM_URL, VSL_VIDEO_URL, LOGO_URL,
 *   GA_MEASUREMENT_ID, META_PIXEL_ID, BUSINESS_TIMEZONE, SITE_URL
 *
 * CALENDLY_URL is the single booking link used after the qualification form.
 * Do not link this URL from the landing page. Visitors must apply first.
 * After they book on Calendly, the booking page sends them to TELEGRAM_URL.
 */
export const CALENDLY_URL = "https://calendly.com/povertykillersfx/pkfx-ai-market-scanner-course";

export const PKFX_CONFIG = {
  calendlyUrl: CALENDLY_URL,
  vslVideoUrl: "https://vimeo.com/1201786453",
  logoUrl: "https://i.ibb.co/Mx3hvS9m/PK-FX-Real-PNG-2.png",
  instagramUrl: "YOUR_INSTAGRAM_URL",
  telegramUrl: "https://t.me/povertykillersfx",
  youtubeUrl: "YOUR_YOUTUBE_URL",
  gaMeasurementId: "",
  metaPixelId: "",
  businessTimezone: "UTC",
  siteUrl: "http://localhost:3000",
};

export type PublicConfig = typeof PKFX_CONFIG;
