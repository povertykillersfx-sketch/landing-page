export default function LoadingDashboard() {
  return (
    <div aria-busy="true" aria-live="polite">
      <p className="muted">Loading leads…</p>
      <div className="stat-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="stat-card" key={index} style={{ minHeight: 92 }} />
        ))}
      </div>
    </div>
  );
}
