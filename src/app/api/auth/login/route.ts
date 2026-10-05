import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { adminAuthConfigured, verifyAdminCredentials } from "@/lib/admin-auth";
import { RequestError, assertSameOrigin, getClientIp, readJson } from "@/lib/http";
import { consumeRateLimit } from "@/lib/rate-limit";
import { ADMIN_COOKIE, adminCookieOptions, signAdminSession } from "@/lib/session";
import { safeInternalPath } from "@/lib/urls";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = await readJson(request);
    const record = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
    if (!adminAuthConfigured()) {
      return NextResponse.json(
        { ok: false, error: "Admin login is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD." },
        { status: 500 },
      );
    }
    const email = typeof record.email === "string" ? record.email : "";
    const password = typeof record.password === "string" ? record.password : "";
    const ip = getClientIp(request);
    const emailKey = createHash("sha256").update(email.toLowerCase()).digest("hex").slice(0, 12);
    const allowed =
      consumeRateLimit(`login:${ip}`, 20, 15 * 60 * 1000) &&
      consumeRateLimit(`login:${ip}:${emailKey}`, 8, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json({ ok: false, error: "Too many attempts. Try again later." }, { status: 429 });
    }
    const valid = await verifyAdminCredentials(email, password);
    if (!valid) {
      return NextResponse.json({ ok: false, error: "Incorrect email or password." }, { status: 401 });
    }
    const token = await signAdminSession(email.trim().toLowerCase());
    const response = NextResponse.json({
      ok: true,
      redirectTo: safeInternalPath(typeof record.next === "string" ? record.next : "/admin"),
    });
    response.cookies.set(ADMIN_COOKIE, token, adminCookieOptions());
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    if (error instanceof RequestError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error && error.message.includes("SESSION_SECRET")
      ? "Admin session is not configured. Set SESSION_SECRET."
      : "Something went wrong. Please try again.";
    console.error(error instanceof Error ? error.message : "Login failed");
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
