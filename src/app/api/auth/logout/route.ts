import { NextResponse } from "next/server";
import { RequestError, assertSameOrigin } from "@/lib/http";
import { ADMIN_COOKIE, adminCookieOptions } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, "", { ...adminCookieOptions(), maxAge: 0 });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    if (error instanceof RequestError) return NextResponse.json({ ok: false }, { status: error.status });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
