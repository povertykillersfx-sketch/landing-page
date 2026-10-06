"use client";

import { useState } from "react";
import { HERO } from "@/config/content";
import { parseVideoUrl } from "@/lib/urls";

export function VslPlayer({ videoUrl }: { videoUrl: string }) {
  const source = parseVideoUrl(videoUrl);
  const [playing, setPlaying] = useState(source.type !== "none");
  const ready = source.type !== "none";
  return (
    <div className="lp-video">
      <div className="lp-video-bar">
        <span className="lp-chip">
          <i className="lp-dot" aria-hidden="true" />
          {HERO.videoHd}
        </span>
        <span className="lp-chip">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {HERO.videoLength}
        </span>
      </div>
      <div className="lp-video-stage">
        {source.type === "youtube" && playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${source.id}?autoplay=0&rel=0`}
            title="PKFX walkthrough"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : null}
        {source.type === "vimeo" && playing ? (
          <iframe
            src={`https://player.vimeo.com/video/${source.id}?title=0&byline=0&portrait=0`}
            title="PKFX walkthrough"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : null}
        {source.type === "file" && playing ? <video src={source.url} controls playsInline /> : null}
        {!playing ? (
          <button
            type="button"
            className="lp-play"
            onClick={() => ready && setPlaying(true)}
            disabled={!ready}
            aria-label={ready ? "Play video" : "Video coming soon"}
          >
            <span className="lp-play-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.5v13l11-6.5-11-6.5Z" />
              </svg>
            </span>
            <span>{ready ? "Play walkthrough" : "Video coming soon"}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
