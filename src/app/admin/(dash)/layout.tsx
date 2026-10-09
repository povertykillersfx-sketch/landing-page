import Link from "next/link";
import { LogoutButton } from "@/components/admin/logout-button";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return (
    <div className="admin-shell">
      <header className="admin-top">
        <div>
          <p className="eyebrow">PKFX Lead Portal</p>
          <Link href="/admin"><strong>Submitted leads</strong></Link>
        </div>
        <div className="admin-actions">
          <span className="faint">{session.email}</span>
          <Link className="btn btn-ghost" href="/">View site</Link>
          <LogoutButton />
        </div>
      </header>
      {children}
      <p className="disclaimer">Lead data is confidential. Do not share exports outside PKFX.</p>
    </div>
  );
}
