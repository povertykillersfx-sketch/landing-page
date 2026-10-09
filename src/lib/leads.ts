import "server-only";
import { LEAD_STATUSES, isLeadStatus, type LeadStatus } from "@/config/statuses";
import { getDb } from "@/lib/db";
import { formatSupabaseError, getSupabase, getSupabaseAdmin, isServerlessHost, isSupabaseConfigured, supabaseConfiguredSafe } from "@/lib/supabase";
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
  previously_purchased: number | boolean;
  previous_products: string | string[];
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

function iso(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

function statusRank(status: LeadStatus) {
  const index = LEAD_STATUSES.findIndex((item) => item.value === status);
  return index === -1 ? 9 : index;
}

function mapLead(row: LeadRow): Lead {
  let previousProducts: string[] = [];
  if (Array.isArray(row.previous_products)) {
    previousProducts = row.previous_products.filter((item): item is string => typeof item === "string");
  } else {
    try {
      const parsed = JSON.parse(row.previous_products) as unknown;
      if (Array.isArray(parsed)) {
        previousProducts = parsed.filter((item): item is string => typeof item === "string");
      }
    } catch {
      previousProducts = [];
    }
  }
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    whatsapp: row.whatsapp || "",
    country: row.country,
    tradingExperience: row.trading_experience,
    previouslyPurchased: row.previously_purchased === true || row.previously_purchased === 1,
    previousProducts,
    depositRange: row.deposit_range,
    depositRank: row.deposit_rank,
    status: isLeadStatus(row.status) ? row.status : "new",
    notes: row.notes,
    callBookedAt: iso(row.call_booked_at),
    createdAt: iso(row.created_at) || row.created_at,
    updatedAt: iso(row.updated_at) || row.updated_at,
  };
}

function throwIfError(error: { message?: string; code?: string } | null, fallback: string) {
  const message = formatSupabaseError(error, fallback);
  if (message) throw new Error(message);
}

export async function createLead(input: LeadPayload, now = new Date()): Promise<Lead> {
  const id = crypto.randomUUID();
  const timestamp = now.toISOString();
  if (supabaseConfiguredSafe()) {
    const { error } = await getSupabase().from("leads").insert({
      id,
      full_name: input.fullName,
      email: input.email,
      phone: input.phone,
      whatsapp: input.whatsapp,
      country: input.country,
      trading_experience: input.tradingExperience,
      previously_purchased: input.previouslyPurchased,
      previous_products: input.previousProducts,
      deposit_range: input.depositRange,
      deposit_rank: input.depositRank,
      status: "new",
      status_rank: statusRank("new"),
      notes: "",
      call_booked_at: null,
      created_at: timestamp,
      updated_at: timestamp,
    });
    throwIfError(error, "Lead could not be saved.");
    return {
      id,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      whatsapp: input.whatsapp,
      country: input.country,
      tradingExperience: input.tradingExperience,
      previouslyPurchased: input.previouslyPurchased,
      previousProducts: input.previousProducts,
      depositRange: input.depositRange,
      depositRank: input.depositRank,
      status: "new",
      notes: "",
      callBookedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }
  if (isServerlessHost()) {
    throw new Error("Set SUPABASE_URL and SUPABASE_ANON_KEY in Netlify, then redeploy.");
  }
  getDb()
    .prepare(
      `INSERT INTO leads (
      id, full_name, email, phone, whatsapp, country, trading_experience, previously_purchased,
      previous_products, deposit_range, deposit_rank, status, notes, call_booked_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', '', NULL, ?, ?)`,
    )
    .run(
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
  const lead = await getLead(id);
  if (!lead) throw new Error("Lead could not be saved.");
  return lead;
}

export async function getLead(id: string): Promise<Lead | null> {
  if (isSupabaseConfigured()) {
    const { data, error } = await (await getSupabaseAdmin()).from("leads").select("*").eq("id", id).maybeSingle();
    throwIfError(error, "Lead could not be loaded.");
    return data ? mapLead(data as LeadRow) : null;
  }
  const row = getDb().prepare("SELECT * FROM leads WHERE id = ?").get(id) as LeadRow | undefined;
  return row ? mapLead(row) : null;
}

export async function updateLead(id: string, patch: { status?: LeadStatus; notes?: string }): Promise<Lead | null> {
  const existing = await getLead(id);
  if (!existing) return null;
  const status = patch.status ?? existing.status;
  const notes = patch.notes !== undefined ? sanitizeText(patch.notes, 5000) : existing.notes;
  const callBookedAt = status === "call_booked" && !existing.callBookedAt ? new Date().toISOString() : existing.callBookedAt;
  const updatedAt = new Date().toISOString();
  if (isSupabaseConfigured()) {
    const { error } = await (await getSupabaseAdmin())
      .from("leads")
      .update({
        status,
        status_rank: statusRank(status),
        notes,
        call_booked_at: callBookedAt,
        updated_at: updatedAt,
      })
      .eq("id", id);
    throwIfError(error, "Lead could not be updated.");
    return getLead(id);
  }
  getDb()
    .prepare("UPDATE leads SET status = ?, notes = ?, call_booked_at = ?, updated_at = ? WHERE id = ?")
    .run(status, notes, callBookedAt, updatedAt, id);
  return getLead(id);
}

export async function markCallBooked(id: string): Promise<Lead | null> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabase().rpc("mark_lead_call_booked", { p_id: id });
    throwIfError(error, "Lead could not be updated.");
    return data ? mapLead(data as LeadRow) : null;
  }
  const existing = await getLead(id);
  if (!existing) return null;
  const status = existing.status === "new" || existing.status === "contacted" ? "call_booked" : existing.status;
  const callBookedAt = existing.callBookedAt ?? new Date().toISOString();
  if (status === existing.status && callBookedAt === existing.callBookedAt) return existing;
  const updatedAt = new Date().toISOString();
  getDb()
    .prepare("UPDATE leads SET status = ?, call_booked_at = ?, updated_at = ? WHERE id = ?")
    .run(status, callBookedAt, updatedAt, id);
  return getLead(id);
}

export async function markCallBookedByEmail(email: string): Promise<Lead | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabase().rpc("mark_lead_call_booked_by_email", { p_email: normalized });
    throwIfError(error, "Lead could not be updated.");
    return data ? mapLead(data as LeadRow) : null;
  }
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

function dateBounds(query: LeadQuery, timeZone: string) {
  const zone = safeTimeZone(timeZone);
  let fromIso = "";
  let toIso = "";
  if (query.from && isIsoDate(query.from)) {
    const [year, month, day] = query.from.split("-").map(Number);
    fromIso = zonedMidnightUtc(year, month, day, zone).toISOString();
  }
  if (query.to && isIsoDate(query.to)) {
    const [year, month, day] = query.to.split("-").map(Number);
    const next = addCalendarDays(year, month, day, 1);
    toIso = zonedMidnightUtc(next.year, next.month, next.day, zone).toISOString();
  }
  return { fromIso, toIso };
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
  const { fromIso, toIso } = dateBounds(query, timeZone);
  if (fromIso) {
    where.push("created_at >= ?");
    params.push(fromIso);
  }
  if (toIso) {
    where.push("created_at < ?");
    params.push(toIso);
  }
  return {
    sql: where.length ? `WHERE ${where.join(" AND ")}` : "",
    params,
  };
}

function applySupabaseFilters(client: Awaited<ReturnType<typeof getSupabaseAdmin>>, query: LeadQuery, timeZone: string) {
  let request = client.from("leads").select("*", { count: "exact" });
  if (query.q) {
    const term = query.q.replace(/[%*,()]/g, " ").trim();
    if (term) {
      const pattern = `%${term}%`;
      request = request.or(
        `full_name.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern},whatsapp.ilike.${pattern}`,
      );
    }
  }
  if (query.country) request = request.eq("country", query.country);
  if (query.experience) request = request.eq("trading_experience", query.experience);
  if (query.purchased === "yes") request = request.eq("previously_purchased", true);
  if (query.purchased === "no") request = request.eq("previously_purchased", false);
  if (query.deposit) request = request.eq("deposit_range", query.deposit);
  if (query.status && isLeadStatus(query.status)) request = request.eq("status", query.status);
  const { fromIso, toIso } = dateBounds(query, timeZone);
  if (fromIso) request = request.gte("created_at", fromIso);
  if (toIso) request = request.lt("created_at", toIso);
  const sort = query.sort || "newest";
  if (sort === "oldest") request = request.order("created_at", { ascending: true });
  else if (sort === "deposit") request = request.order("deposit_rank", { ascending: false }).order("created_at", { ascending: false });
  else if (sort === "status") request = request.order("status_rank", { ascending: true }).order("created_at", { ascending: false });
  else request = request.order("created_at", { ascending: false });
  return request;
}

export async function queryLeads(query: LeadQuery, timeZone = "UTC") {
  const pageSize = Math.min(Math.max(query.pageSize || 20, 1), 1000);
  const page = Math.max(query.page || 1, 1);
  const offset = (page - 1) * pageSize;
  if (isSupabaseConfigured()) {
    const { data, error, count } = await applySupabaseFilters(await getSupabaseAdmin(), query, timeZone).range(
      offset,
      offset + pageSize - 1,
    );
    throwIfError(error, "Leads could not be loaded.");
    return { leads: (data || []).map((row) => mapLead(row as LeadRow)), total: count || 0, page, pageSize };
  }
  const db = getDb();
  const { sql, params } = whereClause(query, timeZone);
  const sort = SORTS[query.sort || "newest"] ?? SORTS.newest;
  const totalRow = db.prepare(`SELECT COUNT(*) AS count FROM leads ${sql}`).get(...params) as { count: number };
  const rows = db.prepare(`SELECT * FROM leads ${sql} ORDER BY ${sort} LIMIT ? OFFSET ?`).all(...params, pageSize, offset) as LeadRow[];
  return { leads: rows.map(mapLead), total: totalRow.count, page, pageSize };
}

export async function listLeadsForExport(query: LeadQuery, timeZone = "UTC"): Promise<Lead[]> {
  const leads: Lead[] = [];
  let page = 1;
  while (page <= 50) {
    const result = await queryLeads({ ...query, page, pageSize: 1000 }, timeZone);
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

export async function leadStats(now = new Date(), timeZone = "UTC"): Promise<LeadStats> {
  const starts = periodStarts(now, timeZone);
  if (isSupabaseConfigured()) {
    const client = await getSupabaseAdmin();
    const today = starts.today.toISOString();
    const week = starts.week.toISOString();
    const month = starts.month.toISOString();
    const [total, todayCount, weekCount, monthCount, booked, uncontacted] = await Promise.all([
      client.from("leads").select("id", { count: "exact", head: true }),
      client.from("leads").select("id", { count: "exact", head: true }).gte("created_at", today),
      client.from("leads").select("id", { count: "exact", head: true }).gte("created_at", week),
      client.from("leads").select("id", { count: "exact", head: true }).gte("created_at", month),
      client.from("leads").select("id", { count: "exact", head: true }).or("call_booked_at.not.is.null,status.eq.call_booked"),
      client.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
    ]);
    for (const result of [total, todayCount, weekCount, monthCount, booked, uncontacted]) {
      throwIfError(result.error, "Lead stats could not be loaded.");
    }
    return {
      total: total.count || 0,
      today: todayCount.count || 0,
      week: weekCount.count || 0,
      month: monthCount.count || 0,
      callsBooked: booked.count || 0,
      uncontacted: uncontacted.count || 0,
    };
  }
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

export async function listLeadFacets() {
  if (isSupabaseConfigured()) {
    const { data, error } = await (await getSupabaseAdmin()).from("leads").select("country, trading_experience");
    throwIfError(error, "Lead filters could not be loaded.");
    const countries = [
      ...new Set((data || []).map((row) => String(row.country || "")).filter(Boolean)),
    ].sort((a, b) => a.localeCompare(b));
    const experiences = [
      ...new Set((data || []).map((row) => String(row.trading_experience || "")).filter(Boolean)),
    ].sort((a, b) => a.localeCompare(b));
    return { countries, experiences };
  }
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
