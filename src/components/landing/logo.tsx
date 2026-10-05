import { BRAND_NAME, BRAND_SHORT } from "@/config/content";
import { isConfiguredUrl } from "@/lib/urls";

export function Logo({ url }: { url: string }) {
  if (isConfiguredUrl(url)) {
    return <img className="logo-img" src={url} alt={BRAND_NAME} />;
  }
  return (
    <>
      <span className="logo-badge">{BRAND_SHORT.slice(0, 2)}</span>
      <span className="logo-name">{BRAND_NAME}</span>
    </>
  );
}
