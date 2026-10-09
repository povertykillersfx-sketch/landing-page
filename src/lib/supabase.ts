import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const globalStore = globalThis as unknown as {
  __pkfxSupabaseAnon?: SupabaseClient | null;
  __pkfxSupabaseAdmin?: { client: SupabaseClient; expiresAt: number } | null;
};

export function supabaseUrl() {
  return (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
}

export function supabaseAnonKey() {
  return (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "").trim();
}

function looksLikeSecretKey(key: string) {
  if (key.startsWith("sb_secret_")) return true;
  const parts = key.split(".");
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as { role?: string };
    return payload.role === "service_role";
  } catch {
    return false;
  }
}

function assertHttpsUrl(url: string) {
  try {
    const parsed = new URL(url);
    const local = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    if (parsed.protocol === "https:") return;
    if (parsed.protocol === "http:" && local) return;
  } catch {
    throw new Error("SUPABASE_URL is not a valid URL.");
  }
  throw new Error("SUPABASE_URL must be an https origin.");
}

export function isSupabaseConfigured() {
  const url = supabaseUrl();
  const key = supabaseAnonKey();
  const secret = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!url && !key && !secret) return false;
  if (secret && !key) {
    throw new Error("Use SUPABASE_ANON_KEY (anon/publishable), not the service role secret.");
  }
  if (!key) return false;
  if (!url) {
    throw new Error("Set SUPABASE_URL with SUPABASE_ANON_KEY.");
  }
  if (looksLikeSecretKey(key)) {
    throw new Error("SUPABASE_ANON_KEY must be the anon/publishable key, not the service role secret.");
  }
  assertHttpsUrl(url);
  return true;
}

function createAnonClient() {
  return createClient(supabaseUrl(), supabaseAnonKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }
  if (!globalStore.__pkfxSupabaseAnon) {
    globalStore.__pkfxSupabaseAnon = createAnonClient();
  }
  return globalStore.__pkfxSupabaseAnon;
}

export async function getSupabaseAdmin(): Promise<SupabaseClient> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }
  const cached = globalStore.__pkfxSupabaseAdmin;
  if (cached && cached.expiresAt > Date.now() + 30_000) return cached.client;

  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  if (!email.includes("@") || password.length < 10) {
    throw new Error("Admin dashboard needs ADMIN_EMAIL and ADMIN_PASSWORD to read leads in Supabase.");
  }

  const client = createAnonClient();
  let session = (await client.auth.signInWithPassword({ email, password })).data.session;
  if (!session) {
    session = (await client.auth.signUp({ email, password })).data.session;
  }
  if (!session) {
    throw new Error(
      "Could not sign the admin into Supabase. Create an Auth user with ADMIN_EMAIL / ADMIN_PASSWORD, or turn off Confirm email and try again.",
    );
  }
  const expiresAt = (session.expires_at || Math.floor(Date.now() / 1000) + 50 * 60) * 1000;
  globalStore.__pkfxSupabaseAdmin = { client, expiresAt };
  return client;
}

export function resetSupabase() {
  globalStore.__pkfxSupabaseAnon = undefined;
  globalStore.__pkfxSupabaseAdmin = undefined;
}
