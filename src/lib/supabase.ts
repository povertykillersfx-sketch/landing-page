import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const globalStore = globalThis as unknown as { __pkfxSupabase?: SupabaseClient | null };

export function supabaseUrl() {
  return (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
}

export function supabaseServiceKey() {
  return (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
}

export function isSupabaseConfigured() {
  const url = supabaseUrl();
  const key = supabaseServiceKey();
  if (!url && !key) return false;
  if (!url || !key) {
    throw new Error("Set both SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
  try {
    const parsed = new URL(url);
    const local = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    if (parsed.protocol === "https:") return true;
    if (parsed.protocol === "http:" && local) return true;
  } catch {
    throw new Error("SUPABASE_URL is not a valid URL.");
  }
  throw new Error("SUPABASE_URL must be an https origin.");
}

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }
  if (!globalStore.__pkfxSupabase) {
    globalStore.__pkfxSupabase = createClient(supabaseUrl(), supabaseServiceKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return globalStore.__pkfxSupabase;
}

export function resetSupabase() {
  globalStore.__pkfxSupabase = undefined;
}
