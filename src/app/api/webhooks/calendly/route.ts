import { NextResponse } from "next/server";
import { calendlyInviteeEmail, verifyCalendlySignature } from "@/lib/calendly";
import { markCallBookedByEmail } from "@/lib/leads";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const key = process.env.CALENDLY_WEBHOOK_SIGNING_KEY || "";
  if (!key) {
    return NextResponse.json({ error: "Calendly webhook is not configured." }, { status: 503 });
  }
  const payload = await request.text();
  const signature = request.headers.get("calendly-webhook-signature") || "";
  if (!verifyCalendlySignature(payload, signature, key)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }
  let body: unknown;
  try {
    body = JSON.parse(payload) as unknown;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }
  const email = calendlyInviteeEmail(body);
  if (email) {
    const lead = await markCallBookedByEmail(email);
    if (!lead) console.error("Calendly invitee did not match a lead.");
  }
  return NextResponse.json({ ok: true });
}
