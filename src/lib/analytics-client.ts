const once = new Set<string>();

export function track(event: string, metadata?: Record<string, string>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...(metadata || {}) });
  if (typeof window.gtag === "function") window.gtag("event", event, metadata || {});
  if (typeof window.fbq === "function") window.fbq("trackCustom", event, metadata || {});
  const body = JSON.stringify({ event, path: window.location.pathname, metadata: metadata || {} });
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

export function trackOnce(event: string, metadata?: Record<string, string>) {
  if (once.has(event)) return;
  once.add(event);
  track(event, metadata);
}
