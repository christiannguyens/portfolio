/** Canvas helpers for the wall: square capture, filters, and final polaroid composition. */

export type FilterName = "natural" | "bw" | "faded" | "warm";

export const FILTERS: { id: FilterName; label: string; css: string }[] = [
  { id: "natural", label: "Natural", css: "none" },
  { id: "bw", label: "B&W", css: "grayscale(1) contrast(1.12)" },
  { id: "faded", label: "Faded", css: "contrast(0.86) brightness(1.08) saturate(0.7) sepia(0.12)" },
  { id: "warm", label: "Warm", css: "sepia(0.22) saturate(1.25) brightness(1.03)" },
];

// Polaroid geometry (px), roughly an instant-film card.
export const CARD = { w: 900, h: 1080, pad: 40, photo: 820 };
export const STRIP = { x: 60, y: CARD.pad + CARD.photo + 18, w: 780, h: 150 };

/** Draws a centre-cropped square of `src` into a new canvas, optionally mirrored. */
export function squareCrop(src: CanvasImageSource, sw: number, sh: number, size = CARD.photo, mirror = false) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  const side = Math.min(sw, sh);
  const sx = (sw - side) / 2;
  const sy = (sh - side) / 2;
  if (mirror) {
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(src, sx, sy, side, side, 0, 0, size, size);
  return c;
}

/** Pixel-level filters (canvas `filter` isn't supported everywhere). */
export function applyFilter(canvas: HTMLCanvasElement, filter: FilterName) {
  if (filter === "natural") return canvas;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i];
    let g = d[i + 1];
    let b = d[i + 2];
    if (filter === "bw") {
      const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const c = (l - 128) * 1.12 + 128;
      r = g = b = c;
    } else if (filter === "faded") {
      const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      r = l + (r - l) * 0.7;
      g = l + (g - l) * 0.7;
      b = l + (b - l) * 0.7;
      r = (r - 128) * 0.86 + 128 + 14;
      g = (g - 128) * 0.86 + 128 + 10;
      b = (b - 128) * 0.86 + 128 + 4;
    } else if (filter === "warm") {
      r = r * 1.08 + 10;
      g = g * 1.02 + 4;
      b = b * 0.88;
    }
    d[i] = Math.max(0, Math.min(255, r));
    d[i + 1] = Math.max(0, Math.min(255, g));
    d[i + 2] = Math.max(0, Math.min(255, b));
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

export type Signature =
  | { kind: "draw"; canvas: HTMLCanvasElement }
  | { kind: "type"; text: string; fontFamily: string; color: string; scale: number };

/** Composes the final polaroid as a JPEG data URL. */
export async function composePolaroid(photo: HTMLCanvasElement, sig: Signature | null) {
  const c = document.createElement("canvas");
  c.width = CARD.w;
  c.height = CARD.h;
  const ctx = c.getContext("2d")!;

  // card
  const g = ctx.createLinearGradient(0, 0, 0, CARD.h);
  g.addColorStop(0, "#f6f3ec");
  g.addColorStop(1, "#ece8de");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CARD.w, CARD.h);

  // photo + a hairline inner shadow
  ctx.drawImage(photo, CARD.pad, CARD.pad, CARD.photo, CARD.photo);
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 2;
  ctx.strokeRect(CARD.pad + 1, CARD.pad + 1, CARD.photo - 2, CARD.photo - 2);

  // signature
  if (sig?.kind === "draw") {
    const s = sig.canvas;
    const scale = Math.min(STRIP.w / s.width, STRIP.h / s.height);
    const w = s.width * scale;
    const h = s.height * scale;
    ctx.drawImage(s, STRIP.x + (STRIP.w - w) / 2, STRIP.y + (STRIP.h - h) / 2, w, h);
  } else if (sig?.kind === "type" && sig.text.trim()) {
    const base = 92 * sig.scale;
    await document.fonts.load(`${base}px ${sig.fontFamily}`).catch(() => undefined);
    let size = base;
    ctx.font = `${size}px ${sig.fontFamily}`;
    while (ctx.measureText(sig.text).width > STRIP.w - 40 && size > 24) {
      size -= 4;
      ctx.font = `${size}px ${sig.fontFamily}`;
    }
    ctx.fillStyle = sig.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(sig.text, CARD.w / 2, STRIP.y + STRIP.h / 2 + 4);
  }

  // date stamp
  const d = new Date();
  const stamp = `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}.${String(d.getFullYear()).slice(2)}`;
  ctx.font = "22px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillStyle = "rgba(27,27,25,0.38)";
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(stamp, CARD.w - CARD.pad - 4, CARD.h - 26);

  // compress until it fits comfortably under the upload limit
  for (const q of [0.86, 0.78, 0.7]) {
    const url = c.toDataURL("image/jpeg", q);
    if (url.length * 0.75 < 1_200_000) return url;
  }
  return c.toDataURL("image/jpeg", 0.6);
}
