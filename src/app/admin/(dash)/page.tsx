import Link from "next/link";
import { depositOptions, experienceOptions } from "@/config/form-options";
import { LEAD_STATUSES } from "@/config/statuses";
import { StatusSelect } from "@/components/admin/status-select";
import { leadFiltersActive, leadStats, listLeadFacets, parseLeadQuery, queryLeads, type Lead, type LeadQuery } from "@/lib/leads";
import { getPublicConfig } from "@/lib/public-config";
import { formatDateTime, safeTimeZone } from "@/lib/time";
import { formatPhone } from "@/lib/validation";

export const metadata = { title: "Leads" };
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function queryString(query: LeadQuery, page?: number) {
  const params = new URLSearchParams();
  const entries: Array<[string, string | undefined]> = [
    ["q", query.q],
    ["country", query.country],
    ["experience", query.experience],
    ["purchased", query.purchased],
    ["deposit", query.deposit],
    ["status", query.status],
    ["from", query.from],
    ["to", query.to],
    ["sort", query.sort && query.sort !== "newest" ? query.sort : ""],
    ["page", page && page > 1 ? String(page) : ""],
  ];
  for (const [key, value] of entries) {
    if (value) params.set(key, value);
  }
  return params.toString();
}

function purchaseLabel(lead: Lead) {
  if (!lead.previouslyPurchased) return "No";
  return lead.previousProducts.length ? `Yes · ${lead.previousProducts.join(", ")}` : "Yes";
}

export default async function AdminHome({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const query = parseLeadQuery(params);
  const timeZone = safeTimeZone(getPublicConfig().businessTimezone);
  const stats = await leadStats(new Date(), timeZone);
  const result = await queryLeads(query, timeZone);
  const facets = await listLeadFacets();
  const experiences = [...new Set([...experienceOptions, ...facets.experiences])];
  const active = leadFiltersActive(query);
  const exportHref = `/api/admin/export${queryString(query) ? `?${queryString(query)}` : ""}`;
  const start = result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const end = Math.min(result.page * result.pageSize, result.total);
  const cards = [
    ["Total Leads", stats.total],
    ["Leads Today", stats.today],
    ["Leads This Week", stats.week],
    ["Leads This Month", stats.month],
    ["Calls Booked", stats.callsBooked],
    ["New / Uncontacted", stats.uncontacted],
  ] as const;

  return (
    <div>
      <div className="admin-top">
        <div>
          <h1>Leads</h1>
          <p className="note">Every reserve-spot form submission is stored here. Counts use {timeZone}.</p>
        </div>
        <a className="btn btn-primary" href={exportHref} data-testid="export-csv">
          {active ? "Export filtered CSV" : "Export CSV"}
        </a>
      </div>
      <section className="stat-grid" aria-label="Lead summary">
        {cards.map(([label, value]) => (
          <article className="stat-card" key={label}>
            <b>{value}</b>
            <span>{label}</span>
          </article>
        ))}
      </section>
      <form className="filters panel" method="get" data-testid="lead-filters" key={queryString(query) || "all"}>
        <div className="filter-grid">
          <label className="field">
            <span>Search name, email, phone or WhatsApp</span>
            <input className="input" name="q" defaultValue={query.q || ""} placeholder="Search leads" />
          </label>
          <label className="field">
            <span>Country</span>
            <select className="input" name="country" defaultValue={query.country || ""}>
              <option value="">Any</option>
              {facets.countries.map((country) => <option key={country}>{country}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Trading experience</span>
            <select className="input" name="experience" defaultValue={query.experience || ""}>
              <option value="">Any</option>
              {experiences.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Previous purchase</span>
            <select className="input" name="purchased" defaultValue={query.purchased || ""}>
              <option value="">Any</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          <label className="field">
            <span>Deposit range</span>
            <select className="input" name="deposit" defaultValue={query.deposit || ""}>
              <option value="">Any</option>
              {depositOptions.map((option) => <option key={option.value}>{option.value}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Status</span>
            <select className="input" name="status" defaultValue={query.status || ""}>
              <option value="">Any</option>
              {LEAD_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Submitted from</span>
            <input className="input" type="date" name="from" defaultValue={query.from || ""} />
          </label>
          <label className="field">
            <span>Submitted to</span>
            <input className="input" type="date" name="to" defaultValue={query.to || ""} />
          </label>
          <label className="field">
            <span>Sort</span>
            <select className="input" name="sort" defaultValue={query.sort || "newest"}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="deposit">Highest deposit range</option>
              <option value="status">Status</option>
            </select>
          </label>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" type="submit">Apply filters</button>
          {active ? <Link className="btn btn-ghost" href="/admin">Clear</Link> : null}
        </div>
      </form>
      <p className="note" data-testid="result-count">
        {result.total === 0 ? "No matching leads" : `Showing ${start}–${end} of ${result.total}`}
      </p>
      {result.leads.length === 0 ? (
        <div className="empty panel" data-testid="empty-leads">
          {stats.total === 0
            ? "No leads yet. When someone submits the Get Free Access form, their details appear here."
            : "No leads match these filters."}
        </div>
      ) : (
        <>
          <div className="lead-cards mobile-only" data-testid="leads-cards">
            {result.leads.map((lead) => (
              <article className="lead-card panel" key={lead.id}>
                <header>
                  <div>
                    <strong>{lead.fullName}</strong>
                    <div className="faint">{formatDateTime(lead.createdAt, timeZone)}</div>
                  </div>
                  <StatusSelect id={lead.id} status={lead.status} />
                </header>
                <a href={`mailto:${lead.email}`}>{lead.email}</a>
                <div><a href={`tel:${lead.phone}`}>{formatPhone(lead.phone)}</a></div>
                <div>{lead.country} · {lead.tradingExperience}</div>
                <div>{purchaseLabel(lead)}</div>
                <div>{lead.depositRange}</div>
                <Link className="btn btn-ghost" href={`/admin/leads/${lead.id}`}>View</Link>
              </article>
            ))}
          </div>
          <div className="table-wrap desktop-only" data-testid="leads-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Country</th>
                  <th>Experience</th>
                  <th>Previous purchase</th>
                  <th>Min deposit</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {result.leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>{lead.fullName}</td>
                    <td><a href={`mailto:${lead.email}`}>{lead.email}</a></td>
                    <td><a href={`tel:${lead.phone}`}>{formatPhone(lead.phone)}</a></td>
                    <td>{lead.country}</td>
                    <td>{lead.tradingExperience}</td>
                    <td>{purchaseLabel(lead)}</td>
                    <td>{lead.depositRange}</td>
                    <td>{formatDateTime(lead.createdAt, timeZone)}</td>
                    <td><StatusSelect id={lead.id} status={lead.status} /></td>
                    <td><Link href={`/admin/leads/${lead.id}`}>Open</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.total > result.pageSize ? (
            <div className="pager">
              {result.page > 1 ? <Link className="btn btn-ghost" href={`/admin?${queryString(query, result.page - 1)}`}>Previous</Link> : <span />}
              <span className="faint">Page {result.page}</span>
              {end < result.total ? <Link className="btn btn-ghost" href={`/admin?${queryString(query, result.page + 1)}`}>Next</Link> : <span />}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
