import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { resetDb } from "@/lib/db";
import { resetAdminAuthCache } from "@/lib/admin-auth";

export function useTestDb() {
  const dir = mkdtempSync(path.join(tmpdir(), "pkfx-"));
  process.env.DATABASE_PATH = path.join(dir, "test.sqlite");
  resetDb();
  return process.env.DATABASE_PATH;
}

export function useTestAuth() {
  process.env.ADMIN_EMAIL = "admin@pkfx.test";
  process.env.ADMIN_PASSWORD = "correct-horse-battery";
  process.env.ADMIN_PASSWORD_HASH = "";
  process.env.SESSION_SECRET = "test-session-secret-should-be-32chars";
  resetAdminAuthCache();
}

export const sampleLead = {
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  phone: "+14155552671",
  whatsapp: "+14155552671",
  country: "United States",
  tradingExperience: "1–2 years",
  previouslyPurchased: true,
  previousProducts: ["Trading course", "Paid signals"],
  depositRange: "$1,000–$4,999",
  depositRank: 4,
};
