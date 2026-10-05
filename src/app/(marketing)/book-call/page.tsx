import type { Metadata } from "next";
import { CalendlyEmbed, ExternalBookingRedirect } from "@/components/booking/calendly-embed";
import { buildCalendlyEmbedUrl } from "@/lib/calendly";
import { getPublicConfig } from "@/lib/public-config";
import { verifyBookingToken } from "@/lib/session";
import { isCalendlyUrl, isConfiguredUrl } from "@/lib/urls";
import { CtaLink } from "@/components/landing/cta-link";

export const metadata: Metadata = {
  title: "Book your call",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function BookCallPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const booking = token ? await verifyBookingToken(token) : null;
  const config = getPublicConfig();

  if (!booking) {
    return (
      <div className="page-narrow">
        <p className="eyebrow">Booking</p>
        <h1>Complete your application first</h1>
        <p className="lede">Book a call after the short qualification form. That way the team knows your trading experience before you meet.</p>
        <div className="hero-actions">
          <CtaLink location="book-gate" />
        </div>
      </div>
    );
  }

  const configured = isConfiguredUrl(config.calendlyUrl);
  return (
    <div className="page-narrow">
      <p className="eyebrow">Booking</p>
      <h1>Book Your PKFX Call</h1>
      <p className="lede">Choose a time that works for you.</p>
      {configured && isCalendlyUrl(config.calendlyUrl) ? (
        <CalendlyEmbed
          token={token || ""}
          url={buildCalendlyEmbedUrl(config.calendlyUrl, { name: booking.name, email: booking.email })}
        />
      ) : null}
      {configured && !isCalendlyUrl(config.calendlyUrl) ? <ExternalBookingRedirect url={config.calendlyUrl} /> : null}
      {!configured ? (
        <div className="panel" style={{ marginTop: "1.2rem" }}>
          <p className="success-banner">Your application has been received.</p>
          <p className="lede">We’ll contact {booking.email} to confirm a time for your call.</p>
          {process.env.NODE_ENV === "development" ? (
            <p className="dev-note">Set calendlyUrl in src/config/site.ts or the CALENDLY_URL environment variable to embed the calendar.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
