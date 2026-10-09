import { NextResponse } from "next/server";
import { leadsToCsv } from "@/lib/csv";
import { getAdminSession } from "@/lib/admin";
import { listLeadsForExport, parseLeadQuery } from "@/lib/leads";
import { getPublicConfig } from "@/lib/public-config";
import { safeTimeZone } from "@/lib/time";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const query = parseLeadQuery(url.searchParams);
  const timeZone = safeTimeZone(getPublicConfig().businessTimezone);
  const csv = leadsToCsv(await listLeadsForExport(query, timeZone));
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pkfx-leads-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
