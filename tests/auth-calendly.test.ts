import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { verifyAdminCredentials } from "@/lib/admin-auth";
import { buildCalendlyEmbedUrl, calendlyInviteeEmail, verifyCalendlySignature } from "@/lib/calendly";
import { signAdminSession, signBookingToken, verifyAdminSession, verifyBookingToken } from "@/lib/session";
import { useTestAuth } from "./helpers";

describe("auth and calendly", () => {
  beforeEach(() => {
    useTestAuth();
  });

  it("accepts the admin password and rejects the wrong one", async () => {
    expect(await verifyAdminCredentials("admin@pkfx.test", "correct-horse-battery")).toBe(true);
    expect(await verifyAdminCredentials("admin@pkfx.test", "wrong-password")).toBe(false);
    expect(await verifyAdminCredentials("other@pkfx.test", "correct-horse-battery")).toBe(false);
  });

  it("does not treat a booking token as an admin session", async () => {
    const admin = await signAdminSession("admin@pkfx.test");
    const booking = await signBookingToken({ leadId: "11111111-1111-4111-8111-111111111111", name: "Ada", email: "ada@example.com" });
    expect((await verifyAdminSession(admin))?.email).toBe("admin@pkfx.test");
    expect(await verifyAdminSession(booking)).toBeNull();
    expect((await verifyBookingToken(booking))?.leadId).toBe("11111111-1111-4111-8111-111111111111");
    expect(await verifyBookingToken(admin)).toBeNull();
  });

  it("verifies Calendly webhook signatures and invitee emails", () => {
    const payload = JSON.stringify({ event: "invitee.created", payload: { email: "Ada@Example.com" } });
    const timestamp = "1700000000";
    const signature = createHmac("sha256", "whsec").update(`${timestamp}.${payload}`).digest("hex");
    expect(verifyCalendlySignature(payload, `t=${timestamp},v1=${signature}`, "whsec", 1700000000 * 1000)).toBe(true);
    expect(verifyCalendlySignature(payload, `t=${timestamp},v1=${signature}`, "whsec", 1700000000 * 1000 + 10 * 60 * 1000)).toBe(false);
    expect(verifyCalendlySignature(payload, `t=${timestamp},v1=deadbeef`, "whsec", 1700000000 * 1000)).toBe(false);
    expect(calendlyInviteeEmail(JSON.parse(payload))).toBe("ada@example.com");
    const url = buildCalendlyEmbedUrl("https://calendly.com/pkfx/intro", { name: "Ada Lovelace", email: "ada@example.com" });
    expect(url).toContain("name=Ada+Lovelace");
    expect(url).toContain("email=ada%40example.com");
  });
});
