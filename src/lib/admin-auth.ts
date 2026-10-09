import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";

const DUMMY_HASH = "$2b$10$LzL6yEI7MBFpfkQOTskQ7.j1emx63Jje7xb7rmqTpkdGyFCjKjieO";

let hashCache: { source: string; hash: string } | null = null;

function safeEqual(a: string, b: string) {
  const left = createHash("sha256").update(a).digest();
  const right = createHash("sha256").update(b).digest();
  return timingSafeEqual(left, right);
}

export function adminAuthConfigured() {
  const email = process.env.ADMIN_EMAIL || "";
  const password = process.env.ADMIN_PASSWORD || "";
  const hash = process.env.ADMIN_PASSWORD_HASH || "";
  return email.includes("@") && (hash.startsWith("$2") || password.length >= 10);
}

export function resetAdminAuthCache() {
  hashCache = null;
}

async function expectedPasswordHash(): Promise<string | null> {
  const preset = process.env.ADMIN_PASSWORD_HASH || "";
  if (preset.startsWith("$2")) return preset;
  const password = process.env.ADMIN_PASSWORD || "";
  if (password.length < 10) return null;
  if (hashCache?.source === password) return hashCache.hash;
  const hash = await bcrypt.hash(password, 10);
  hashCache = { source: password, hash };
  return hash;
}

export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const hash = await expectedPasswordHash();
  let passwordOk = false;
  try {
    passwordOk = await bcrypt.compare(password, hash ?? DUMMY_HASH);
  } catch {
    passwordOk = false;
  }
  const emailOk = adminEmail.includes("@") && safeEqual(email.trim().toLowerCase(), adminEmail);
  return Boolean(hash) && emailOk && passwordOk;
}
