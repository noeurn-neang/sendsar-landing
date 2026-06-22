import { ImageResponse } from "next/og";

export const alt = "Sendsar — Headless Chat API";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: 80,
          background: "#0f172a",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: "-2px",
          }}
        >
          <span>Send</span>
          <span style={{ color: "#0096c8" }}>sar</span>
        </div>
        <div style={{ fontSize: 32, color: "#94a3b8", marginTop: 20 }}>
          Headless Chat API · Connect any two parties. Instantly.
        </div>
      </div>
    ),
    { ...size },
  );
}
