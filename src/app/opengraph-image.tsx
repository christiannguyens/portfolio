import { ImageResponse } from "next/og";
import { site } from "@/data/site";
import { monogramDataUri } from "@/lib/og";

export const alt = site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#0b0b0a",
          backgroundImage: "radial-gradient(rgba(236,233,225,0.08) 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
          color: "#ece9e1",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={monogramDataUri()} width={110} height={70} alt="" />
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, color: "#9b988f" }}>
            <div style={{ width: 12, height: 12, borderRadius: 999, background: "#f5abed" }} />
            {site.status}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 }}>{site.name}</div>
          <div style={{ marginTop: 28, fontSize: 34, color: "#9b988f", letterSpacing: "-0.01em" }}>
            Business + Computer Science at WashU
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#7a776f", borderTop: "1px solid rgba(236,233,225,0.17)", paddingTop: 24 }}>
          <span>Class of {site.education.classOf} · {site.education.honors[0]}</span>
          <span>{site.url.replace("https://", "")}</span>
        </div>
      </div>
    ),
    size,
  );
}
