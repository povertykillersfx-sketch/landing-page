"use client";

import { useState } from "react";
import { parseVideoUrl } from "@/lib/urls";

function ListenCard({ asButton, onClick }: { asButton: boolean; onClick?: () => void }) {
  const inner = (
    <>
      <span className="listen-kicker">Your video has started</span>
      <span className="listen-icon" aria-hidden="true">
        <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
          <path d="M4 10v4h3l4 3V7L7 10H4Z" fill="currentColor" />
          <path d="M16 9.5 20.5 14M20.5 9.5 16 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
      <span className="listen-action">Click to listen</span>
    </>
  );
  if (!asButton) {
    return (
      <div className="listen-card" role="group" aria-label="Video will play here once a walkthrough is added">
        {inner}
      </div>
    );
  }
  return (
    <button type="button" className="listen-card" onClick={onClick} aria-label="Play video">
      {inner}
    </button>
  );
}

export function VslPlayer({ videoUrl }: { videoUrl: string }) {
  const source = parseVideoUrl(videoUrl);
  const [playing, setPlaying] = useState(false);
  const ready = source.type !== "none";
  return (
    <div className="lp-video">
      <div className="lp-video-poster" aria-hidden="true">
        <svg viewBox="0 0 360 280" className="lp-chart">
          <path d="M10 210 C 50 200, 70 120, 110 140 S 170 80, 210 100 280 40, 350 55" />
          <path d="M10 230 C 80 220, 120 180, 180 190 S 260 150, 350 160" />
        </svg>
      </div>
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
      {source.type === "file" && playing ? <video src={source.url} controls autoPlay playsInline /> : null}
      {!playing ? <ListenCard asButton={ready} onClick={() => ready && setPlaying(true)} /> : null}
    </div>
  );
}
