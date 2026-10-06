import "server-only";
import { isLeadStatus, type LeadStatus } from "@/config/statuses";
import { getDb } from "@/lib/db";
import { addCalendarDays, isIsoDate, periodStarts, safeTimeZone, zonedMidnightUtc } from "@/lib/time";
import { sanitizeText, type LeadPayload } from "@/lib/validation";

export type Lead = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  country: string;
  tradingExperience: string;
  previouslyPurchased: boolean;
  previousProducts: string[];
  depositRange: string;
  depositRank: number;
  status: LeadStatus;
  notes: string;
  callBookedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type LeadRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  country: string;
  trading_experience: string;
  previously_purchased: number;
  previous_products: string;
  deposit_range: string;
  deposit_rank: number;
  status: string;
  notes: string;
  call_booked_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadSort = "newest" | "oldest" | "deposit" | "status";

export type LeadQuery = {
  q?: string;
  country?: string;
  experience?: string;
  purchased?: "" | "yes" | "no";
  deposit?: string;
  status?: string;
  from?: string;
  to?: string;
  sort?: LeadSort;
  page?: number;
  pageSize?: number;
};

const SORTS: Record<LeadSort, string> = {
  newest: "created_at DESC",
  oldest: "created_at ASC",
  deposit: "deposit_rank DESC, created_at DESC",
  status: `CASE status
    WHEN 'new' THEN 0
    WHEN 'contacted' THEN 1
    WHEN 'call_booked' THEN 2
    WHEN 'qualified' THEN 3
    WHEN 'not_qualified' THEN 4
    WHEN 'converted' THEN 5
    WHEN 'lost' THEN 6
    ELSE 9 END, created_at DESC`,
};

function mapLead(row: LeadRow): Lead {
  let previousProducts: string[] = [];
  try {
    const parsed = JSON.parse(row.previous_products) as unknown;
    if (Array.isArray(parsed)) {
      previousProducts = parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    previousProducts = [];
  }
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    whatsapp: row.whatsapp || "",
    country: row.country,
    tradingExperience: row.trading_experience,
    previouslyPurchased: row.previously_purchased === 1,
    previousProducts,
    depositRange: row.deposit_range,
    depositRank: row.deposit_rank,
    status: isLeadStatus(row.status) ? row.status : "new",
    notes: row.notes,
    callBookedAt: row.call_booked_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createLead(input: LeadPayload, now = new Date()): Lead {
  const db = getDb();
  const id = crypto.randomUUID();
  const timestamp = now.toISOString();
  db.prepare(
    `INSERT INTO leads (
      id, full_name, email, phone, whatsapp, country, trading_experience, previously_purchased,
      previous_products, deposit_range, deposit_rank, status, notes, call_booked_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', '', NULL, ?, ?)`,
  ).run(
    id,
    input.fullName,
    input.email,
    input.phone,
    input.whatsapp,
    input.country,
    input.tradingExperience,
    input.previouslyPurchased ? 1 : 0,
    JSON.stringify(input.previousProducts),
    input.depositRange,
    input.depositRank,
    timestamp,
    timestamp,
  );
  const lead = getLead(id);
  if (!lead) throw new Error("Lead could not be saved.");
  return lead;
}

export function getLead(id: string): Lead | null {
  const row = getDb().prepare("SELECT * FROM leads WHERE id = ?").get(id) as LeadRow | undefined;
  return row ? mapLead(row) : null;
}

export function updateLead(id: string, patch: { status?: LeadStatus; notes?: string }): Lead | null {
  const existing = getLead(id);
  if (!existing) return null;
  const status = patch.status ?? existing.status;
  const notes = patch.notes !== undefined ? sanitizeText(patch.notes, 5000) : existing.notes;
  const callBookedAt = status === "call_booked" && !existing.callBookedAt ? new Date().toISOString() : existing.callBookedAt;
  const updatedAt = new Date().toISOString();
  getDb()
    .prepare("UPDATE leads SET status = ?, notes = ?, call_booked_at = ?, updated_at = ? WHERE id = ?")
    .run(status, notes, callBookedAt, updatedAt, id);
  return getLead(id);
}

export function markCallBooked(id: string): Lead | null {
  const existing = getLead(id);
  if (!existing) return null;
  const status = existing.status === "new" || existing.status === "contacted" ? "call_booked" : existing.status;
  const callBookedAt = existing.callBookedAt ?? new Date().toISOString();
  if (status === existing.status && callBookedAt === existing.callBookedAt) return existing;
  getDb()
    .prepare("UPDATE leads SET status = ?, call_booked_at = ?, updated_at = ? WHERE id = ?")
    .run(status, callBookedAt, new Date().toISOString(), id);
  return getLead(id);
}

export function markCallBookedByEmail(email: string): Lead | null {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  const row = getDb()
    .prepare("SELECT id FROM leads WHERE email = ? ORDER BY created_at DESC LIMIT 1")
    .get(normalized) as { id: string } | undefined;
  if (!row) return null;
  return markCallBooked(row.id);
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

export function parseLeadQuery(input: URLSearchParams | Record<string, string | string[] | undefined>): LeadQuery {
  const get = (key: string) => {
    if (input instanceof URLSearchParams) return input.get(key)?.trim() || "";
    return firstValue(input[key]).trim();
  };
  const sortValue = get("sort");
  const sorts: LeadSort[] = ["newest", "oldest", "deposit", "status"];
  const purchased = get("purchased");
  const page = Number(get("page"));
  return {
    q: get("q").slice(0, 100),
    country: get("country").slice(0, 80),
    experience: get("experience").slice(0, 80),
    purchased: purchased === "yes" || purchased === "no" ? purchased : "",
    deposit: get("deposit").slice(0, 80),
    status: get("status").slice(0, 40),
    from: get("from").slice(0, 10),
    to: get("to").slice(0, 10),
    sort: sorts.includes(sortValue as LeadSort) ? (sortValue as LeadSort) : "newest",
    page: Number.isFinite(page) && page > 0 ? Math.min(Math.floor(page), 100000) : 1,
  };
}

function whereClause(query: LeadQuery, timeZone: string) {
  const where: string[] = [];
  const params: Array<string | number> = [];
  if (query.q) {
    const term = `%${escapeLike(query.q)}%`;
    where.push("(full_name LIKE ? ESCAPE '\\' OR email LIKE ? ESCAPE '\\' OR phone LIKE ? ESCAPE '\\' OR whatsapp LIKE ? ESCAPE '\\')");
    params.push(term, term, term, term);
  }
  if (query.country) {
    where.push("country = ?");
    params.push(query.country);
  }
  if (query.experience) {
    where.push("trading_experience = ?");
    params.push(query.experience);
  }
  if (query.purchased === "yes") where.push("previously_purchased = 1");
  if (query.purchased === "no") where.push("previously_purchased = 0");
  if (query.deposit) {
    where.push("deposit_range = ?");
    params.push(query.deposit);
  }
  if (query.status && isLeadStatus(query.status)) {
    where.push("status = ?");
    params.push(query.status);
  }
  const zone = safeTimeZone(timeZone);
  if (query.from && isIsoDate(query.from)) {
    const [year, month, day] = query.from.split("-").map(Number);
    where.push("created_at >= ?");
    params.push(zonedMidnightUtc(year, month, day, zone).toISOString());
  }
  if (query.to && isIsoDate(query.to)) {
    const [year, month, day] = query.to.split("-").map(Number);
    const next = addCalendarDays(year, month, day, 1);
    where.push("created_at < ?");
    params.push(zonedMidnightUtc(next.year, next.month, next.day, zone).toISOString());
  }
  return {
    sql: where.length ? `WHERE ${where.join(" AND ")}` : "",
    params,
  };
}

export function queryLeads(query: LeadQuery, timeZone = "UTC") {
  const db = getDb();
  const { sql, params } = whereClause(query, timeZone);
  const sort = SORTS[query.sort || "newest"] ?? SORTS.newest;
  const pageSize = Math.min(Math.max(query.pageSize || 20, 1), 1000);
  const page = Math.max(query.page || 1, 1);
  const offset = (page - 1) * pageSize;
  const totalRow = db.prepare(`SELECT COUNT(*) AS count FROM leads ${sql}`).get(...params) as { count: number };
  const rows = db.prepare(`SELECT * FROM leads ${sql} ORDER BY ${sort} LIMIT ? OFFSET ?`).all(...params, pageSize, offset) as LeadRow[];
  return { leads: rows.map(mapLead), total: totalRow.count, page, pageSize };
}

export function listLeadsForExport(query: LeadQuery, timeZone = "UTC"): Lead[] {
  const leads: Lead[] = [];
  let page = 1;
  while (page <= 50) {
    const result = queryLeads({ ...query, page, pageSize: 1000 }, timeZone);
    leads.push(...result.leads);
    if (leads.length >= result.total || result.leads.length === 0) break;
    page += 1;
  }
  return leads;
}

export type LeadStats = {
  total: number;
  today: number;
  week: number;
  month: number;
  callsBooked: number;
  uncontacted: number;
};

export function leadStats(now = new Date(), timeZone = "UTC"): LeadStats {
  const starts = periodStarts(now, timeZone);
  const row = getDb()
    .prepare(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) AS today,
        SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) AS week,
        SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) AS month,
        SUM(CASE WHEN call_booked_at IS NOT NULL OR status = 'call_booked' THEN 1 ELSE 0 END) AS calls_booked,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS uncontacted
      FROM leads`,
    )
    .get(starts.today.toISOString(), starts.week.toISOString(), starts.month.toISOString()) as {
    total: number;
    today: number | null;
    week: number | null;
    month: number | null;
    calls_booked: number | null;
    uncontacted: number | null;
  };
  return {
    total: row.total || 0,
    today: row.today || 0,
    week: row.week || 0,
    month: row.month || 0,
    callsBooked: row.calls_booked || 0,
    uncontacted: row.uncontacted || 0,
  };
}

export function listLeadFacets() {
  const db = getDb();
  const countries = db.prepare("SELECT DISTINCT country FROM leads WHERE country != '' ORDER BY country COLLATE NOCASE").all() as {
    country: string;
  }[];
  const experiences = db
    .prepare("SELECT DISTINCT trading_experience AS experience FROM leads ORDER BY trading_experience COLLATE NOCASE")
    .all() as { experience: string }[];
  return {
    countries: countries.map((row) => row.country),
    experiences: experiences.map((row) => row.experience),
  };
}

export function leadFiltersActive(query: LeadQuery): boolean {
  return Boolean(query.q || query.country || query.experience || query.purchased || query.deposit || query.status || query.from || query.to);
}
