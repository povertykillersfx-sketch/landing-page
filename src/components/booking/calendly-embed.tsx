"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { track, trackOnce } from "@/lib/analytics-client";

export function CalendlyEmbed({ url, token }: { url: string; token: string }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [booked, setBooked] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    trackOnce("calendly_view");
    function onMessage(event: MessageEvent) {
      if (typeof event.origin !== "string" || !event.origin.endsWith("calendly.com")) return;
      const data = event.data as { event?: string } | undefined;
      if (data?.event !== "calendly.event_scheduled") return;
      setBooked(true);
      track("booking_completed");
      fetch("/api/leads/booked", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
        .then((response) => {
          if (!response.ok) setNote("Your time was reserved with Calendly. We already have your application.");
        })
        .catch(() => setNote("Your time was reserved with Calendly. We already have your application."));
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [token]);

  return (
    <div>
      {booked ? <p className="success-banner" role="status">You’re booked. We’ll see you on the call.</p> : null}
      {note ? <p className="note">{note}</p> : null}
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
