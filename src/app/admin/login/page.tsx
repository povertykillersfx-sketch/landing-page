import { BRAND_SHORT } from "@/config/content";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/landing/logo";
import { getPublicConfig } from "@/lib/public-config";
import { safeInternalPath } from "@/lib/urls";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const config = getPublicConfig();
  return (
    <div className="center-page">
      <div className="login-card panel">
        <Logo url={config.logoUrl} />
        <p className="eyebrow">{BRAND_SHORT} Lead Portal</p>
        <h1>Sign in</h1>
        <p className="note">View and manage people who submitted the reserve-spot form.</p>
        <LoginForm nextPath={safeInternalPath(params.next)} />
      </div>
    </div>
  );
}
