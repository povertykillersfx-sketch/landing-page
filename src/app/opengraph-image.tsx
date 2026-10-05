import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#07090e",
          color: "#f5f7fb",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 4, color: "#c5d6ff" }}>PKFX</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 700, lineHeight: 1.05, maxWidth: 920 }}>
            AI Market Scanner + Free Trading Course
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#9aa3b5", marginTop: 18 }}>
            Tools, education and community for a clearer trading process.
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#d5deee" }}>Poverty Killers FX</div>
      </div>
    ),
    { ...size },
  );
}
