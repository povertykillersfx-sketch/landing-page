import Link from "next/link";

export default function NotFound() {
  return (
    <main className="center-page">
      <div className="panel login-card">
        <p className="eyebrow">404</p>
        <h1>This page is not available.</h1>
        <p className="lede">The link may be incorrect, or the page may have moved.</p>
        <Link className="btn btn-primary" href="/">Back to PKFX</Link>
      </div>
    </main>
  );
}
