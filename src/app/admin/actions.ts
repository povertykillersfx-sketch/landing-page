"use server";

import { revalidatePath } from "next/cache";
import { isLeadStatus } from "@/config/statuses";
import { requireAdmin } from "@/lib/admin";
import { getLead, updateLead } from "@/lib/leads";
import { sanitizeText } from "@/lib/validation";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function updateLeadAction(id: string, patch: { status?: string; notes?: string }) {
  await requireAdmin();
  if (!UUID.test(id) || !(await getLead(id))) {
    return { ok: false as const, error: "Lead not found." };
  }
  if (patch.status !== undefined && !isLeadStatus(patch.status)) {
    return { ok: false as const, error: "Choose a valid status." };
  }
  if (patch.notes !== undefined && patch.notes.length > 5000) {
    return { ok: false as const, error: "Notes must be 5,000 characters or fewer." };
  }
  const lead = await updateLead(id, {
    status: patch.status && isLeadStatus(patch.status) ? patch.status : undefined,
    notes: patch.notes !== undefined ? sanitizeText(patch.notes, 5000) : undefined,
  });
  if (!lead) return { ok: false as const, error: "Lead not found." };
  revalidatePath("/admin");
  revalidatePath(`/admin/leads/${id}`);
  return { ok: true as const, notes: lead.notes, status: lead.status };
}
