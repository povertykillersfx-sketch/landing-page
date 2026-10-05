"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#07090e", color: "#f4f6f8", fontFamily: "sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem" }}>
          <div>
            <h1>Something went wrong.</h1>
            <button type="button" onClick={() => reset()} style={{ minHeight: 48, padding: "0.8rem 1.2rem", borderRadius: 999 }}>
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
