import Link from "next/link";
import { notFound } from "next/navigation";
import { statusLabel } from "@/config/statuses";
import { NotesForm } from "@/components/admin/notes-form";
import { StatusSelect } from "@/components/admin/status-select";
import { getLead } from "@/lib/leads";
import { getPublicConfig } from "@/lib/public-config";
import { formatDateTime, safeTimeZone } from "@/lib/time";
import { formatPhone } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = getLead(id);
  return { title: lead ? lead.fullName : "Lead" };
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = getLead(id);
  if (!lead) notFound();
  const timeZone = safeTimeZone(getPublicConfig().businessTimezone);
  return (
    <div>
      <Link href="/admin" className="note">← All leads</Link>
      <div className="admin-top">
        <h1>{lead.fullName}</h1>
        <StatusSelect id={lead.id} status={lead.status} />
      </div>
      <div className="lead-layout">
        <section className="panel">
          <h2>Contact Information</h2>
          <dl className="kv">
            <div><dt>Full name</dt><dd>{lead.fullName}</dd></div>
            <div><dt>Email</dt><dd><a href={`mailto:${lead.email}`}>{lead.email}</a></dd></div>
            <div><dt>Phone</dt><dd><a href={`tel:${lead.phone}`}>{formatPhone(lead.phone)}</a></dd></div>
            {lead.whatsapp ? <div><dt>WhatsApp</dt><dd><a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`}>{formatPhone(lead.whatsapp)}</a></dd></div> : null}
            <div><dt>Country</dt><dd>{lead.country}</dd></div>
          </dl>
          <h2 style={{ marginTop: "1.4rem" }}>Trading Profile</h2>
          <dl className="kv">
            <div><dt>Experience</dt><dd>{lead.tradingExperience}</dd></div>
            <div><dt>Previously purchased trading products</dt><dd>{lead.previouslyPurchased ? "Yes" : "No"}</dd></div>
            <div>
              <dt>Products purchased</dt>
              <dd>
                {lead.previousProducts.length ? (
                  <ul className="product-list">{lead.previousProducts.map((item) => <li className="pill" key={item}>{item}</li>)}</ul>
                ) : "None listed"}
              </dd>
            </div>
            <div><dt>Typical minimum deposit</dt><dd>{lead.depositRange}</dd></div>
          </dl>
        </section>
        <section className="panel">
          <h2>Lead Information</h2>
          <dl className="kv">
            <div><dt>Date submitted</dt><dd>{formatDateTime(lead.createdAt, timeZone)}</dd></div>
            <div><dt>Current status</dt><dd>{statusLabel(lead.status)}</dd></div>
            <div><dt>Call booked</dt><dd>{lead.callBookedAt ? formatDateTime(lead.callBookedAt, timeZone) : "Not booked yet"}</dd></div>
            <div><dt>Last updated</dt><dd>{formatDateTime(lead.updatedAt, timeZone)}</dd></div>
          </dl>
          <NotesForm id={lead.id} notes={lead.notes} />
        </section>
      </div>
    </div>
  );
}
