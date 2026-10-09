import "server-only";
import { getDb } from "@/lib/db";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export async function consumeRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabase().rpc("consume_rate_limit", {
      p_key: key.slice(0, 120),
      p_limit: limit,
      p_window_ms: windowMs,
    });
    if (error) throw new Error(error.message);
    return data === true;
  }
  const db = getDb();
  const now = Date.now();
  const run = db.transaction(() => {
    if (Math.random() < 0.05) {
      db.prepare("DELETE FROM rate_limits WHERE window_start < ?").run(now - 24 * 60 * 60 * 1000);
    }
    const row = db.prepare("SELECT count, window_start FROM rate_limits WHERE key = ?").get(key) as
      | { count: number; window_start: number }
      | undefined;
    if (!row || now - row.window_start >= windowMs) {
      db.prepare(
        `INSERT INTO rate_limits (key, count, window_start) VALUES (?, 1, ?)
         ON CONFLICT(key) DO UPDATE SET count = 1, window_start = excluded.window_start`,
      ).run(key, now);
      return true;
    }
    if (row.count >= limit) return false;
    db.prepare("UPDATE rate_limits SET count = count + 1 WHERE key = ?").run(key);
    return true;
  });
  return run();
}
