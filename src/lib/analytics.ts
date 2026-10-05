import "server-only";
import { getDb } from "@/lib/db";

const ALLOWED_EVENTS = new Set([
  "landing_page_view",
  "cta_click",
  "form_started",
  "form_completed",
  "calendly_view",
  "booking_completed",
]);

export function recordAnalyticsEvent(event: string, path: string, metadata: unknown): boolean {
  if (!ALLOWED_EVENTS.has(event)) return false;
  const clean: Record<string, string> = {};
  if (metadata && typeof metadata === "object") {
    for (const [key, value] of Object.entries(metadata as Record<string, unknown>)) {
      if (!/^[a-z0-9_]{1,32}$/i.test(key) || typeof value !== "string") continue;
      clean[key] = value.slice(0, 80);
      if (Object.keys(clean).length >= 8) break;
    }
  }
  const safePath = (path || "").slice(0, 120).replace(/[^\w\-./]/g, "");
  const db = getDb();
  db.prepare("INSERT INTO analytics_events (id, event_name, path, metadata, created_at) VALUES (?, ?, ?, ?, ?)").run(
    crypto.randomUUID(),
    event,
    safePath,
    JSON.stringify(clean),
    new Date().toISOString(),
  );
  if (Math.random() < 0.01) {
    const cutoff = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare("DELETE FROM analytics_events WHERE created_at < ?").run(cutoff);
  }
  return true;
}
