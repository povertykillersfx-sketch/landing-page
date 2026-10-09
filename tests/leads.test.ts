import { beforeEach, describe, expect, it } from "vitest";
import { leadsToCsv } from "@/lib/csv";
import { leadStats, listLeadsForExport, markCallBooked, markCallBookedByEmail, parseLeadQuery, queryLeads, updateLead, createLead } from "@/lib/leads";
import { recordAnalyticsEvent } from "@/lib/analytics";
import { consumeRateLimit } from "@/lib/rate-limit";
import { sampleLead, useTestDb } from "./helpers";

describe("leads database", () => {
  beforeEach(() => {
    useTestDb();
  });

  it("saves, updates, filters, sorts and exports leads", () => {
    const older = createLead({ ...sampleLead, fullName: "Grace Hopper", email: "grace@example.com", depositRange: "Under $100", depositRank: 1 }, new Date("2026-08-01T12:00:00.000Z"));
    const newer = createLead({ ...sampleLead, fullName: "=Ada", email: "ada@example.com", depositRange: "$10,000+", depositRank: 6 }, new Date("2026-10-05T12:00:00.000Z"));
    const mid = createLead({ ...sampleLead, fullName: "Katherine Johnson", email: "kj@example.com", whatsapp: "+447911123456", previouslyPurchased: false, previousProducts: [], country: "United Kingdom", depositRange: "$500–$999", depositRank: 3 }, new Date("2026-10-03T12:00:00.000Z"));

    expect(queryLeads({ q: `" OR 1=1 --` }).total).toBe(0);
    expect(queryLeads({ q: "ada@example" }).leads.map((lead) => lead.email)).toEqual(["ada@example.com"]);
    expect(queryLeads({ q: "447911123456" }).leads.map((lead) => lead.id)).toEqual([mid.id]);
    expect(queryLeads({ country: "United Kingdom" }).leads.map((lead) => lead.id)).toEqual([mid.id]);
    expect(queryLeads({ purchased: "no" }).total).toBe(1);
    expect(queryLeads({ experience: "1–2 years", deposit: "$10,000+" }).leads[0]?.id).toBe(newer.id);
    expect(queryLeads({ sort: "deposit" }).leads.map((lead) => lead.depositRange)).toEqual(["$10,000+", "$500–$999", "Under $100"]);
    expect(queryLeads({ sort: "oldest" }).leads[0]?.id).toBe(older.id);
    expect(parseLeadQuery({ sort: "created_at; drop table leads", page: "2" }).sort).toBe("newest");

    const noted = updateLead(newer.id, { notes: "Interested in the scanner.\n<script>alert(1)</script>", status: "contacted" });
    expect(noted?.notes).toBe("Interested in the scanner.\nalert(1)");
    expect(noted?.status).toBe("contacted");
    expect(noted?.callBookedAt).toBeNull();

    const booked = markCallBooked(newer.id);
    expect(booked?.status).toBe("call_booked");
    expect(booked?.callBookedAt).toBeTruthy();
    updateLead(newer.id, { status: "qualified" });
    const stillQualified = markCallBooked(newer.id);
    expect(stillQualified?.status).toBe("qualified");

    const byEmail = markCallBookedByEmail("KJ@example.com");
    expect(byEmail?.status).toBe("call_booked");

    const csv = leadsToCsv(listLeadsForExport({ sort: "oldest" }));
    expect(csv.startsWith("\uFEFFName,Email")).toBe(true);
    expect(csv).toContain("grace@example.com");
    expect(csv).toContain("Trading course; Paid signals");
    expect(csv).toContain("'=Ada");
    expect(csv).not.toContain("<script>");

    const stats = leadStats(new Date("2026-10-05T15:00:00.000Z"), "UTC");
    expect(stats.total).toBe(3);
    expect(stats.today).toBe(1);
    expect(stats.week).toBe(1);
    expect(stats.month).toBe(2);
    expect(stats.callsBooked).toBe(2);
    expect(stats.uncontacted).toBe(1);
  });

  it("counts today in the business timezone", () => {
    createLead(sampleLead, new Date("2026-10-05T02:30:00.000Z"));
    const stillSameDay = leadStats(new Date("2026-10-05T03:00:00.000Z"), "America/New_York");
    expect(stillSameDay.today).toBe(1);
    const nextMorning = leadStats(new Date("2026-10-05T05:00:00.000Z"), "America/New_York");
    expect(nextMorning.today).toBe(0);
  });

  it("rate limits and stores only known analytics events", () => {
    expect(consumeRateLimit("lead:test", 2, 60_000)).toBe(true);
    expect(consumeRateLimit("lead:test", 2, 60_000)).toBe(true);
    expect(consumeRateLimit("lead:test", 2, 60_000)).toBe(false);
    expect(recordAnalyticsEvent("cta_click", "/apply", { location: "hero", bad: 1 as never })).toBe(true);
    expect(recordAnalyticsEvent("drop_table", "/", {})).toBe(false);
  });
});
