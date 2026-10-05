import { createHmac, timingSafeEqual } from "node:crypto";
import { isCalendlyUrl } from "@/lib/urls";

export function buildCalendlyEmbedUrl(base: string, prefill: { name?: string; email?: string }) {
  const url = new URL(base);
  if (prefill.name) url.searchParams.set("name", prefill.name);
  if (prefill.email) url.searchParams.set("email", prefill.email);
  url.searchParams.set("hide_gdpr_banner", "1");
  url.searchParams.set("background_color", "0c1017");
  url.searchParams.set("text_color", "f4f6f8");
  url.searchParams.set("primary_color", "8eb6ff");
  url.searchParams.set("utm_source", "pkfx");
  url.searchParams.set("utm_medium", "website");
  return url.toString();
}

export function verifyCalendlySignature(payload: string, header: string, key: string, now = Date.now()): boolean {
  if (!payload || !header || !key) return false;
  const parts = Object.fromEntries(
    header.split(",").map((piece) => {
      const index = piece.indexOf("=");
      if (index === -1) return ["", ""];
      return [piece.slice(0, index).trim(), piece.slice(index + 1).trim()];
    }),
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature || !/^\d+$/.test(timestamp) || !/^[a-f0-9]+$/i.test(signature)) return false;
  const age = Math.abs(now - Number(timestamp) * 1000);
  if (age > 3 * 60 * 1000) return false;
  const expected = createHmac("sha256", key).update(`${timestamp}.${payload}`).digest("hex");
  const left = Buffer.from(expected, "utf8");
  const right = Buffer.from(signature, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function calendlyInviteeEmail(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const body = payload as { event?: unknown; payload?: { email?: unknown; invitee?: { email?: unknown } } };
  if (body.event !== "invitee.created") return "";
  const email = body.payload?.email || body.payload?.invitee?.email;
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export function canEmbedCalendly(url: string) {
  return isCalendlyUrl(url);
}
