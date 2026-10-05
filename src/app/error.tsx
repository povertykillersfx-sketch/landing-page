"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="center-page">
      <div className="panel login-card">
        <h1>Something went wrong.</h1>
        <p className="lede">Please try again. If this keeps happening, refresh the page.</p>
        <button className="btn btn-primary" type="button" onClick={() => reset()}>Try again</button>
      </div>
    </main>
  );
}
