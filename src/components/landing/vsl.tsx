"use client";

import { useState } from "react";
import { VSL } from "@/config/content";
import { CtaLink } from "@/components/landing/cta-link";
import { parseVideoUrl } from "@/lib/urls";

export function VslSection({ videoUrl }: { videoUrl: string }) {
  const source = parseVideoUrl(videoUrl);
  const [playing, setPlaying] = useState(false);
  return (
    <section className="section" id="how-it-works">
      <div className="wrap">
        <div className="section-head">
          <h2>{VSL.heading}</h2>
          <p className="lede">{VSL.subheading}</p>
        </div>
        <div className="video-shell">
          <div className="video-frame">
            {source.type === "youtube" && playing ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${source.id}?autoplay=1&rel=0`}
                title="PKFX walkthrough"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : null}
            {source.type === "vimeo" && playing ? (
              <iframe
                src={`https://player.vimeo.com/video/${source.id}?autoplay=1`}
                title="PKFX walkthrough"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : null}
            {source.type === "file" && playing ? (
              <video src={source.url} controls autoPlay playsInline />
            ) : null}
            {!playing ? (
              <button
                type="button"
                className="play-face"
                onClick={() => source.type !== "none" && setPlaying(true)}
                disabled={source.type === "none"}
                aria-label={source.type === "none" ? VSL.unavailable : "Play video"}
              >
                <span className="play-icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                  </svg>
                </span>
                <span>{source.type === "none" ? VSL.unavailable : "Play walkthrough"}</span>
              </button>
            ) : null}
          </div>
          <div className="video-actions">
            <CtaLink location="vsl" />
          </div>
        </div>
        {process.env.NODE_ENV === "development" && source.type === "none" ? (
          <p className="dev-note">Set vslVideoUrl in src/config/site.ts or the VSL_VIDEO_URL environment variable.</p>
        ) : null}
      </div>
    </section>
  );
}
