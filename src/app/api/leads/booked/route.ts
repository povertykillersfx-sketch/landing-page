import { NextResponse } from "next/server";
import { RequestError, assertSameOrigin, readJson } from "@/lib/http";
import { markCallBooked } from "@/lib/leads";
import { verifyBookingToken } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = await readJson(request);
    const token = typeof body === "object" && body && "token" in body && typeof body.token === "string" ? body.token : "";
    const booking = token ? await verifyBookingToken(token) : null;
    if (!booking) return NextResponse.json({ ok: false }, { status: 401 });
    const lead = markCallBooked(booking.leadId);
    if (!lead) return NextResponse.json({ ok: false }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof RequestError) return NextResponse.json({ ok: false }, { status: error.status });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
