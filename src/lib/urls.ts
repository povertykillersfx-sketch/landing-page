export function isConfiguredUrl(value: string | undefined | null): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("YOUR_")) return false;
  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function safeMediaUrl(value: string | undefined | null): string | null {
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return value;
  return isConfiguredUrl(value) ? value.trim() : null;
}

export function isCalendlyUrl(value: string | undefined | null): value is string {
  if (!isConfiguredUrl(value)) return false;
  const host = new URL(value).hostname.replace(/^www\./, "");
  return host === "calendly.com" || host.endsWith(".calendly.com");
}

export type VideoSource =
  | { type: "none" }
  | { type: "youtube"; id: string }
  | { type: "vimeo"; id: string }
  | { type: "file"; url: string };

export function parseVideoUrl(value: string | undefined | null): VideoSource {
  if (!isConfiguredUrl(value)) return { type: "none" };
  const url = new URL(value);
  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id && /^[\w-]{6,}$/.test(id) ? { type: "youtube", id } : { type: "none" };
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "m.youtube.com") {
    const fromQuery = url.searchParams.get("v");
    if (fromQuery && /^[\w-]{6,}$/.test(fromQuery)) return { type: "youtube", id: fromQuery };
    const parts = url.pathname.split("/").filter(Boolean);
    const id = parts[0] === "embed" || parts[0] === "shorts" ? parts[1] : "";
    return id && /^[\w-]{6,}$/.test(id) ? { type: "youtube", id } : { type: "none" };
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean).find((part) => /^\d+$/.test(part));
    return id ? { type: "vimeo", id } : { type: "none" };
  }
  return { type: "file", url: value.trim() };
}

export function safeGaId(id: string | undefined): string {
  const value = id?.trim() || "";
  return /^G-[A-Z0-9]+$/.test(value) || /^UA-\d{4,}-\d+$/.test(value) ? value : "";
}

export function safePixelId(id: string | undefined): string {
  const value = id?.trim() || "";
  return /^\d{5,20}$/.test(value) ? value : "";
}

export function safeInternalPath(value: string | undefined | null): string {
  if (!value) return "/admin";
  if (!value.startsWith("/admin")) return "/admin";
  if (value.startsWith("//") || value.includes("\\") || value.includes("://")) return "/admin";
  return value;
}
