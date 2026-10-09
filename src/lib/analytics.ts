import "server-only";
import { getDb } from "@/lib/db";
import { formatSupabaseError, getSupabase, isSupabaseConfigured } from "@/lib/supabase";

const ALLOWED_EVENTS = new Set([
  "landing_page_view",
  "cta_click",
  "form_started",
  "form_completed",
  "calendly_view",
  "booking_completed",
]);

export async function recordAnalyticsEvent(event: string, path: string, metadata: unknown): Promise<boolean> {
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
  const createdAt = new Date().toISOString();
  const id = crypto.randomUUID();
  if (isSupabaseConfigured()) {
    const { error } = await getSupabase().from("analytics_events").insert({
      id,
      event_name: event,
      path: safePath,
      metadata: clean,
      created_at: createdAt,
    });
    const message = formatSupabaseError(error, "Analytics event could not be saved.");
    if (message) throw new Error(message);
    return true;
  }
  const db = getDb();
  db.prepare("INSERT INTO analytics_events (id, event_name, path, metadata, created_at) VALUES (?, ?, ?, ?, ?)").run(
    id,
    event,
    safePath,
    JSON.stringify(clean),
    createdAt,
  );
  if (Math.random() < 0.01) {
    const cutoff = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare("DELETE FROM analytics_events WHERE created_at < ?").run(cutoff);
  }
  return true;
}
