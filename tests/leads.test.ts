import { beforeEach, describe, expect, it } from "vitest";
import { leadsToCsv } from "@/lib/csv";
import { leadStats, listLeadsForExport, markCallBooked, markCallBookedByEmail, parseLeadQuery, queryLeads, updateLead, createLead } from "@/lib/leads";
import { recordAnalyticsEvent } from "@/lib/analytics";
import { consumeRateLimit } from "@/lib/rate-limit";
import { formatSupabaseError, isSupabaseConfigured } from "@/lib/supabase";
import { sampleLead, useTestDb } from "./helpers";

describe("leads database", () => {
  beforeEach(() => {
    useTestDb();
  });

  it("saves, updates, filters, sorts and exports leads", async () => {
    const older = await createLead({ ...sampleLead, fullName: "Grace Hopper", email: "grace@example.com", depositRange: "Under $100", depositRank: 1 }, new Date("2026-08-01T12:00:00.000Z"));
    const newer = await createLead({ ...sampleLead, fullName: "=Ada", email: "ada@example.com", depositRange: "$1000+", depositRank: 4 }, new Date("2026-10-05T12:00:00.000Z"));
    const mid = await createLead({ ...sampleLead, fullName: "Katherine Johnson", email: "kj@example.com", whatsapp: "+447911123456", previouslyPurchased: false, previousProducts: [], country: "United Kingdom", depositRange: "$500–$999", depositRank: 3 }, new Date("2026-10-03T12:00:00.000Z"));

    expect((await queryLeads({ q: `" OR 1=1 --` })).total).toBe(0);
    expect((await queryLeads({ q: "ada@example" })).leads.map((lead) => lead.email)).toEqual(["ada@example.com"]);
    expect((await queryLeads({ q: "447911123456" })).leads.map((lead) => lead.id)).toEqual([mid.id]);
    expect((await queryLeads({ country: "United Kingdom" })).leads.map((lead) => lead.id)).toEqual([mid.id]);
    expect((await queryLeads({ purchased: "no" })).total).toBe(1);
    expect((await queryLeads({ experience: "1–2 years", deposit: "$1000+" })).leads[0]?.id).toBe(newer.id);
    expect((await queryLeads({ sort: "deposit" })).leads.map((lead) => lead.depositRange)).toEqual(["$1000+", "$500–$999", "Under $100"]);
    expect((await queryLeads({ sort: "oldest" })).leads[0]?.id).toBe(older.id);
    expect(parseLeadQuery({ sort: "created_at; drop table leads", page: "2" }).sort).toBe("newest");

    const noted = await updateLead(newer.id, { notes: "Interested in the scanner.\n<script>alert(1)</script>", status: "contacted" });
    expect(noted?.notes).toBe("Interested in the scanner.\nalert(1)");
    expect(noted?.status).toBe("contacted");
    expect(noted?.callBookedAt).toBeNull();

    const booked = await markCallBooked(newer.id);
    expect(booked?.status).toBe("call_booked");
    expect(booked?.callBookedAt).toBeTruthy();
    await updateLead(newer.id, { status: "qualified" });
    const stillQualified = await markCallBooked(newer.id);
    expect(stillQualified?.status).toBe("qualified");

    const byEmail = await markCallBookedByEmail("KJ@example.com");
    expect(byEmail?.status).toBe("call_booked");

    const csv = leadsToCsv(await listLeadsForExport({ sort: "oldest" }));
    expect(csv.startsWith("\uFEFFName,Email")).toBe(true);
    expect(csv).toContain("grace@example.com");
    expect(csv).toContain("Trading course; Paid signals");
    expect(csv).toContain("'=Ada");
    expect(csv).not.toContain("<script>");

    const stats = await leadStats(new Date("2026-10-05T15:00:00.000Z"), "UTC");
    expect(stats.total).toBe(3);
    expect(stats.today).toBe(1);
    expect(stats.week).toBe(1);
    expect(stats.month).toBe(2);
    expect(stats.callsBooked).toBe(2);
    expect(stats.uncontacted).toBe(1);
  });

  it("counts today in the business timezone", async () => {
    await createLead(sampleLead, new Date("2026-10-05T02:30:00.000Z"));
    const stillSameDay = await leadStats(new Date("2026-10-05T03:00:00.000Z"), "America/New_York");
    expect(stillSameDay.today).toBe(1);
    const nextMorning = await leadStats(new Date("2026-10-05T05:00:00.000Z"), "America/New_York");
    expect(nextMorning.today).toBe(0);
  });

  it("does not use Supabase unless the anon key is set", () => {
    expect(isSupabaseConfigured()).toBe(false);
    process.env.SUPABASE_URL = "https://example.supabase.co";
    expect(isSupabaseConfigured()).toBe(false);
    process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_not-for-this-app";
    expect(() => isSupabaseConfigured()).toThrow(/ANON_KEY/);
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    process.env.SUPABASE_ANON_KEY = "sb_publishable_example";
    expect(isSupabaseConfigured()).toBe(true);
    process.env.SUPABASE_ANON_KEY = "sb_secret_example";
    expect(() => isSupabaseConfigured()).toThrow(/anon\/publishable/);
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    expect(formatSupabaseError({ code: "PGRST205", message: "Could not find the table 'public.leads' in the schema cache" }, "fail")).toMatch(
      /schema\.sql/,
    );
    expect(formatSupabaseError({ message: "permission denied" }, "fail")).toBe("permission denied");
  });

  it("rate limits and stores only known analytics events", async () => {
    expect(await consumeRateLimit("lead:test", 2, 60_000)).toBe(true);
    expect(await consumeRateLimit("lead:test", 2, 60_000)).toBe(true);
    expect(await consumeRateLimit("lead:test", 2, 60_000)).toBe(false);
    expect(await recordAnalyticsEvent("cta_click", "/apply", { location: "hero", bad: 1 as never })).toBe(true);
    expect(await recordAnalyticsEvent("drop_table", "/", {})).toBe(false);
  });
});
