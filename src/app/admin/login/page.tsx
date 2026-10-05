import { BRAND_SHORT } from "@/config/content";
import { LoginForm } from "@/components/admin/login-form";
import { safeInternalPath } from "@/lib/urls";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  return (
    <div className="center-page">
      <div className="login-card panel">
        <p className="eyebrow">{BRAND_SHORT} Admin</p>
        <h1>Sign in</h1>
        <p className="note">Authorized PKFX staff only.</p>
        <LoginForm nextPath={safeInternalPath(params.next)} />
      </div>
    </div>
  );
}
