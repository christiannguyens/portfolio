import { MONOGRAM } from "./pixel";

/** Pixel monogram as an SVG data URI (for ImageResponse images). */
export function monogramDataUri(color = "#f5abed") {
  const rects = MONOGRAM.flatMap((row, y) =>
    [...row].map((c, x) => (c === "#" ? `<rect x="${x}" y="${y}" width="1.02" height="1.02"/>` : "")),
  ).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 7" shape-rendering="crispEdges" fill="${color}">${rects}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
