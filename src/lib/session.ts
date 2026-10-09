import { SignJWT, jwtVerify } from "jose";

export const ADMIN_COOKIE = "pkfx_admin_session";

function secretKey() {
  const secret = (process.env.SESSION_SECRET || "").trim();
  if (secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function signAdminSession(email: string) {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setIssuedAt()
    .setIssuer("pkfx")
    .setAudience("admin")
    .setExpirationTime("7d")
    .sign(secretKey());
}

export async function verifyAdminSession(token: string): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), { issuer: "pkfx", audience: "admin" });
    if (payload.role !== "admin" || typeof payload.sub !== "string") return null;
    return { email: payload.sub };
  } catch {
    return null;
  }
}

export async function signBookingToken(data: { leadId: string; name: string; email: string }) {
  return new SignJWT({ name: data.name, email: data.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(data.leadId)
    .setIssuedAt()
    .setIssuer("pkfx")
    .setAudience("booking")
    .setExpirationTime("7d")
    .sign(secretKey());
}

export async function verifyBookingToken(token: string): Promise<{ leadId: string; name: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), { issuer: "pkfx", audience: "booking" });
    if (typeof payload.sub !== "string") return null;
    return {
      leadId: payload.sub,
      name: typeof payload.name === "string" ? payload.name : "",
      email: typeof payload.email === "string" ? payload.email : "",
    };
  } catch {
    return null;
  }
}
