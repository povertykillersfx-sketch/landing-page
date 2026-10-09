import { NextResponse } from "next/server";
import { getCountryOptions } from "@/lib/countries";
import { RequestError, assertSameOrigin, getClientIp, readJson } from "@/lib/http";
import { createLead } from "@/lib/leads";
import { consumeRateLimit } from "@/lib/rate-limit";
import { signBookingToken } from "@/lib/session";
import { validateLead } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = await readJson(request);
    const record = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
    if (typeof record.companyWebsite === "string" && record.companyWebsite.trim()) {
      throw new RequestError("Unable to submit.", 400);
    }
    const ip = getClientIp(request);
    if (!(await consumeRateLimit(`lead:${ip}`, 5, 60 * 60 * 1000))) {
      return NextResponse.json(
        { ok: false, errors: { form: "Too many submissions. Please try again later." } },
        { status: 429 },
      );
    }
    const parsed = validateLead(record, getCountryOptions());
    if (!parsed.ok) {
      return NextResponse.json({ ok: false, errors: parsed.errors }, { status: 400 });
    }
    const startedAt = typeof record.startedAt === "number" ? record.startedAt : 0;
    const elapsed = Date.now() - startedAt;
    if (!startedAt || elapsed < 400 || startedAt > Date.now() + 60_000 || elapsed > 12 * 60 * 60 * 1000) {
      return NextResponse.json(
        { ok: false, errors: { form: "Please wait a moment and submit the form again." } },
        { status: 400 },
      );
    }
    if ((process.env.SESSION_SECRET || "").trim().length < 32) {
      console.error("SESSION_SECRET is not configured.");
      return NextResponse.json(
        { ok: false, errors: { form: "The application form is temporarily unavailable." } },
        { status: 500 },
      );
    }
    const lead = await createLead(parsed.value);
    const token = await signBookingToken({ leadId: lead.id, name: lead.fullName, email: lead.email });
    return NextResponse.json({ ok: true, redirectTo: `/book-call?token=${encodeURIComponent(token)}` });
  } catch (error) {
    if (error instanceof RequestError) {
      return NextResponse.json({ ok: false, errors: { form: error.message } }, { status: error.status });
    }
    const raw = error instanceof Error ? error.message : "Lead submission failed";
    console.error(raw);
    const form = /SESSION_SECRET/i.test(raw)
      ? "The application form is temporarily unavailable."
      : /SQLite|SUPABASE|schema\.sql/i.test(raw)
        ? "Lead storage is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in Netlify, then redeploy."
        : "Something went wrong. Please try again.";
    return NextResponse.json({ ok: false, errors: { form } }, { status: 500 });
  }
}
