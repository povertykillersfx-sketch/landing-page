import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Database as SqliteDatabase } from "better-sqlite3";

type SqliteConstructor = typeof import("better-sqlite3");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL,
  trading_experience TEXT NOT NULL,
  previously_purchased INTEGER NOT NULL,
  previous_products TEXT NOT NULL,
  deposit_range TEXT NOT NULL,
  deposit_rank INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT NOT NULL DEFAULT '',
  call_booked_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_country ON leads(country);

CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  path TEXT NOT NULL DEFAULT '',
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON analytics_events(event_name);

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  window_start INTEGER NOT NULL
);
`;

const globalDb = globalThis as unknown as { __pkfxDb?: SqliteDatabase };

function loadSqlite(): SqliteConstructor {
  try {
    return require("better-sqlite3") as SqliteConstructor;
  } catch {
    throw new Error("SQLite is unavailable. Set SUPABASE_URL and SUPABASE_ANON_KEY for production.");
  }
}

function databasePath() {
  return process.env.DATABASE_PATH || path.join(process.cwd(), "data", "pkfx.sqlite");
}

function openDatabase() {
  const Database = loadSqlite();
  const file = databasePath();
  if (file !== ":memory:") {
    fs.mkdirSync(path.dirname(file), { recursive: true });
  }
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");
  db.exec(SCHEMA);
  const columns = db.pragma("table_info(leads)") as { name: string }[];
  if (!columns.some((column) => column.name === "whatsapp")) {
    db.exec("ALTER TABLE leads ADD COLUMN whatsapp TEXT NOT NULL DEFAULT ''");
  }
  return db;
}

export function getDb() {
  if (!globalDb.__pkfxDb) {
    globalDb.__pkfxDb = openDatabase();
  }
  return globalDb.__pkfxDb;
}

export function resetDb() {
  globalDb.__pkfxDb?.close();
  globalDb.__pkfxDb = undefined;
}
