import "server-only";
import { getDb } from "@/lib/db";
import { formatSupabaseError, getSupabase, supabaseConfiguredSafe } from "@/lib/supabase";

const memoryStore = globalThis as unknown as {
  __pkfxRateLimits?: Map<string, { count: number; windowStart: number }>;
};

function memoryLimits() {
  if (!memoryStore.__pkfxRateLimits) memoryStore.__pkfxRateLimits = new Map();
  return memoryStore.__pkfxRateLimits;
}

export function consumeMemoryRateLimit(key: string, limit: number, windowMs: number): boolean {
  const store = memoryLimits();
  const now = Date.now();
  const rec = store.get(key);
  if (!rec || now - rec.windowStart >= windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return true;
  }
  if (rec.count >= limit) return false;
  rec.count += 1;
  return true;
}

function supabaseReady() {
  return supabaseConfiguredSafe();
}

function consumeSqliteRateLimit(key: string, limit: number, windowMs: number): boolean {
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

export async function consumeRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const safeKey = key.slice(0, 120);
  if (supabaseReady()) {
    try {
      const { data, error } = await getSupabase().rpc("consume_rate_limit", {
        p_key: safeKey,
        p_limit: limit,
        p_window_ms: windowMs,
      });
      const message = formatSupabaseError(error, "Rate limit check failed.");
      if (!message) return data === true;
      console.error(message);
    } catch (error) {
      console.error(error instanceof Error ? error.message : "Supabase rate limit failed");
    }
  }
  try {
    return consumeSqliteRateLimit(safeKey, limit, windowMs);
  } catch (error) {
    console.error(error instanceof Error ? error.message : "SQLite rate limit failed");
    return consumeMemoryRateLimit(safeKey, limit, windowMs);
  }
}
