import { NextResponse } from "next/server";
import { recordAnalyticsEvent } from "@/lib/analytics";
import { RequestError, assertSameOrigin, getClientIp, readJson } from "@/lib/http";
import { consumeRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (!(await consumeRateLimit(`analytics:${getClientIp(request)}`, 60, 60 * 1000))) {
      return new NextResponse(null, { status: 204 });
    }
    const body = await readJson(request, 4000);
    const record = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
    const event = typeof record.event === "string" ? record.event : "";
    const path = typeof record.path === "string" ? record.path : "";
    await recordAnalyticsEvent(event, path, record.metadata);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof RequestError) return new NextResponse(null, { status: error.status });
    return new NextResponse(null, { status: 204 });
  }
}
