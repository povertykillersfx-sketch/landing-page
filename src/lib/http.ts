import "server-only";

export class RequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const ip = forwarded.split(",")[0]?.trim();
    if (ip) return ip.slice(0, 80);
  }
  return (req.headers.get("x-real-ip") || "unknown").slice(0, 80);
}

export function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!origin || !host) {
    throw new RequestError("Invalid request.", 403);
  }
  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new RequestError("Invalid request.", 403);
  }
  const allowedHost = host.split(",")[0]?.trim();
  if (!allowedHost || originHost !== allowedHost) {
    throw new RequestError("Invalid request.", 403);
  }
}

export async function readJson(req: Request, maxBytes = 20_000): Promise<unknown> {
  const type = req.headers.get("content-type") || "";
  if (!type.toLowerCase().includes("application/json")) {
    throw new RequestError("Invalid request.", 415);
  }
  const text = await req.text();
  if (text.length > maxBytes) {
    throw new RequestError("Invalid request.", 413);
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new RequestError("Invalid request.", 400);
  }
}
