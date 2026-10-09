"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { track, trackOnce } from "@/lib/analytics-client";

function isCalendlyScheduledEvent(event: MessageEvent) {
  if (event.origin !== "https://calendly.com") return false;
  const data = event.data as { event?: string } | undefined;
  return data?.event === "calendly.event_scheduled";
}

export function CalendlyEmbed({
  url,
  token,
  afterBookingUrl,
}: {
  url: string;
  token: string;
  afterBookingUrl?: string;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const redirected = useRef(false);
  const [booked, setBooked] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    trackOnce("calendly_view");
    function onMessage(event: MessageEvent) {
      if (!isCalendlyScheduledEvent(event) || redirected.current) return;
      redirected.current = true;
      setBooked(true);
      track("booking_completed");
      void fetch("/api/leads/booked", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
        .then((response) => {
          if (!response.ok) setNote("Your time was reserved with Calendly. We already have your application.");
        })
        .catch(() => setNote("Your time was reserved with Calendly. We already have your application."));
      if (!afterBookingUrl) return;
      window.setTimeout(() => {
        window.location.assign(afterBookingUrl);
      }, 900);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [token, afterBookingUrl]);

  return (
    <div>
      {booked ? (
        <p className="success-banner" role="status">
          {afterBookingUrl ? "You’re booked. Taking you to the PKFX Telegram channel…" : "You’re booked. We’ll see you on the call."}
        </p>
      ) : null}
      {note ? <p className="note">{note}</p> : null}
      {booked && afterBookingUrl ? (
        <p className="lede">
          If you are not redirected, <a href={afterBookingUrl}>join the Telegram channel here</a>.
        </p>
      ) : null}
      <div className="calendly-box">
        <div ref={parentRef} className="calendly-inline-widget" data-url={url} />
      </div>
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.Calendly && parentRef.current && !parentRef.current.querySelector("iframe")) {
            window.Calendly.initInlineWidget({ url, parentElement: parentRef.current });
          }
        }}
      />
    </div>
  );
}

export function ExternalBookingRedirect({ url }: { url: string }) {
  useEffect(() => {
    trackOnce("calendly_view");
    const timer = window.setTimeout(() => {
      window.location.assign(url);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [url]);
  return (
    <p className="lede">
      Taking you to the booking page… <a href={url}>Continue</a>
    </p>
  );
}
