import { statusLabel } from "@/config/statuses";
import type { Lead } from "@/lib/leads";

const COLUMNS = [
  "Name",
  "Email",
  "Phone",
  "WhatsApp",
  "Country",
  "Trading Experience",
  "Previously Purchased",
  "Products Purchased",
  "Typical Deposit",
  "Status",
  "Notes",
  "Date Submitted",
] as const;

function csvCell(value: string) {
  let safe = value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (/^[=+\-@\t]/.test(safe)) safe = `'${safe}`;
  if (/[",\n]/.test(safe)) return `"${safe.replace(/"/g, '""')}"`;
  return safe;
}

export function leadsToCsv(leads: Lead[]): string {
  const lines = [COLUMNS.join(",")];
  for (const lead of leads) {
    const row = [
      lead.fullName,
      lead.email,
      lead.phone,
      lead.whatsapp,
      lead.country,
      lead.tradingExperience,
      lead.previouslyPurchased ? "Yes" : "No",
      lead.previousProducts.join("; "),
      lead.depositRange,
      statusLabel(lead.status),
      lead.notes,
      lead.createdAt,
    ];
    lines.push(row.map(csvCell).join(","));
  }
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}
