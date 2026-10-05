const rows = [
  ["EUR/USD", "London", "Range", "Awaiting structure"],
  ["GBP/USD", "London", "Active", "Watch key levels"],
  ["USD/JPY", "Tokyo", "Quiet", "Lower volatility"],
  ["XAU/USD", "Overlap", "Active", "Elevated movement"],
  ["US100", "New York", "Pre-session", "Scheduled data"],
];

export function ScannerMock() {
  return (
    <figure className="scanner" aria-label="Illustrative PKFX Market Scanner preview">
      <div className="scan-line" aria-hidden="true" />
      <div className="scanner-top">
        <div className="dots" aria-hidden="true">
          <i /><i /><i />
        </div>
        <p className="scanner-title">PKFX Market Scanner</p>
        <span className="preview-pill">Preview</span>
      </div>
      <div className="scan-head" aria-hidden="true">
        <span>Market</span><span>Session</span><span>Condition</span><span>Note</span>
      </div>
      <div>
        {rows.map((row) => (
          <div className="scan-row" key={row[0]}>
            <strong>{row[0]}</strong>
            <span>{row[1]}</span>
            <span className={row[2] === "Quiet" ? "tag quiet" : "tag"}>{row[2]}</span>
            <span>{row[3]}</span>
          </div>
        ))}
      </div>
      <figcaption className="scanner-foot">Illustrative interface. Not a live trading signal or a performance claim.</figcaption>
    </figure>
  );
}
