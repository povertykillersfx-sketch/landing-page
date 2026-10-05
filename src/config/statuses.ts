export const LEAD_STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "call_booked", label: "Call Booked" },
  { value: "qualified", label: "Qualified" },
  { value: "not_qualified", label: "Not Qualified" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number]["value"];

export function isLeadStatus(value: string): value is LeadStatus {
  return LEAD_STATUSES.some((status) => status.value === value);
}

export function statusLabel(value: string): string {
  return LEAD_STATUSES.find((status) => status.value === value)?.label ?? value;
}
