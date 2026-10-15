"use client";

import { useEffect, useRef, useState } from "react";
import { HERO } from "@/config/content";
import { parseVideoUrl, videoPlayerSrc } from "@/lib/urls";

type VimeoPlayer = {
  ready: () => Promise<void>;
  play: () => Promise<unknown>;
  setMuted: (muted: boolean) => Promise<unknown>;
  setVolume: (volume: number) => Promise<unknown>;
  getMuted: () => Promise<boolean>;
};

type VimeoPlayerCtor = new (element: HTMLIFrameElement) => VimeoPlayer;

const players = new WeakMap<HTMLIFrameElement, VimeoPlayer>();

function vimeoCtor(): VimeoPlayerCtor | null {
  return (window as Window & { Vimeo?: { Player?: VimeoPlayerCtor } }).Vimeo?.Player ?? null;
}

function loadVimeoPlayerApi(): Promise<VimeoPlayerCtor> {
  const existing = vimeoCtor();
  if (existing) return Promise.resolve(existing);
  return new Promise((resolve, reject) => {
    const scriptId = "vimeo-player-api";
    const done = () => {
      const ctor = vimeoCtor();
      if (ctor) resolve(ctor);
      else reject(new Error("Vimeo Player API failed to load."));
    };
    const previous = document.getElementById(scriptId);
    if (previous) {
      previous.addEventListener("load", done, { once: true });
      previous.addEventListener("error", () => reject(new Error("Vimeo Player API failed to load.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://player.vimeo.com/api/player.js";
    script.async = true;
    script.onload = done;
    script.onerror = () => reject(new Error("Vimeo Player API failed to load."));
    document.head.appendChild(script);
  });
}

function kickVimeoSound(iframe: HTMLIFrameElement | null, player: VimeoPlayer | null) {
  const win = iframe?.contentWindow;
  if (win) {
    const origin = "https://player.vimeo.com";
    win.postMessage({ method: "setVolume", value: 1 }, origin);
    win.postMessage({ method: "setMuted", value: false }, origin);
    win.postMessage({ method: "play" }, origin);
  }
  if (player) {
    void player.setVolume(1);
    void player.setMuted(false);
    void player.play();
  }
}

async function getPlayer(iframe: HTMLIFrameElement) {
  const attached = players.get(iframe);
  if (attached) return attached;
  const Player = await loadVimeoPlayerApi();
  const player = players.get(iframe) ?? new Player(iframe);
  players.set(iframe, player);
  await player.ready();
  return player;
}

export function VslPlayer({ videoUrl }: { videoUrl: string }) {
  const source = parseVideoUrl(videoUrl);
  const embedSrc = videoPlayerSrc(source);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<VimeoPlayer | null>(null);
  const [playing, setPlaying] = useState(source.type !== "none");
  const [needsSoundTap, setNeedsSoundTap] = useState(source.type !== "none");
  const ready = source.type !== "none";

  const unlockSound = () => {
    kickVimeoSound(iframeRef.current, playerRef.current);
    const file = fileRef.current;
    if (file) {
      file.muted = false;
      file.volume = 1;
      void file.play();
    }
    setNeedsSoundTap(false);
  };

  useEffect(() => {
    if (source.type !== "vimeo" || !playing) return;
    let cancelled = false;
    const iframe = iframeRef.current;
    if (!iframe) return;

    const onUnlock = () => unlockSound();
    const events = ["pointerdown", "keydown", "touchstart"] as const;
    for (const event of events) window.addEventListener(event, onUnlock, true);

    void (async () => {
      try {
        const player = await getPlayer(iframe);
        if (cancelled) return;
        playerRef.current = player;
        kickVimeoSound(iframe, player);
      } catch {
        /* overlay stays until the visitor taps */
      }
    })();

    return () => {
      cancelled = true;
      for (const event of events) window.removeEventListener(event, onUnlock, true);
    };
  }, [playing, source.type, embedSrc]);

  useEffect(() => {
    if (source.type !== "file" || !playing) return;
    const video = fileRef.current;
    if (!video) return;
    video.muted = false;
    video.volume = 1;
    const attempt = video.play();
    if (!attempt) return;
    const unlock = () => {
      video.muted = false;
      video.volume = 1;
      void video.play();
      setNeedsSoundTap(false);
    };
    const events = ["pointerdown", "keydown", "touchstart"] as const;
    void attempt.catch(() => {
      setNeedsSoundTap(true);
      for (const event of events) window.addEventListener(event, unlock, true);
    });
    return () => {
      for (const event of events) window.removeEventListener(event, unlock, true);
    };
  }, [playing, source.type, videoUrl]);

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
        {source.type === "youtube" && playing && embedSrc ? (
          <iframe
            src={embedSrc}
            title="PKFX walkthrough"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : null}
        {source.type === "vimeo" && playing && embedSrc ? (
          <iframe
            ref={iframeRef}
            src={embedSrc}
            title="PKFX walkthrough"
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : null}
        {source.type === "file" && playing ? (
          <video ref={fileRef} src={source.url} autoPlay playsInline controls />
        ) : null}
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
        {playing && needsSoundTap ? (
          <button type="button" className="lp-sound-unlock" onPointerDown={unlockSound} onClick={unlockSound}>
            <span>Tap to start with sound</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
