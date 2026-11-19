import { ImageResponse } from "next/og";
import { monogramDataUri } from "@/lib/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b0b0a" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={monogramDataUri()} width={121} height={77} alt="" />
      </div>
    ),
    size,
  );
}
