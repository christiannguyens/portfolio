"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PortraitPalette } from "@/data/site";
import { isDev } from "@/data/site";
import { cn } from "@/lib/utils";

/**
 * PixelPortrait
 * ------------------------------------------------------------
 * Renders an image as a grid of crisp, palette-mapped, ordered-dithered
 * pixels on a <canvas>. On hover / tap / Enter it "develops": the pixel
 * size steps down until the original photo is revealed.
 *
 * Pass `src` to use a real photo; without it, a generated silhouette is
 * used as a placeholder (see `src/data/site.ts → portrait`).
 */

type Props = {
  src?: string | null;
  alt: string;
  palette?: PortraitPalette;
  className?: string;
  /** Show the caption bar under the frame. */
  caption?: boolean;
};

// Pixel size (in CSS px) for each "level". 0 = full-resolution image.
const LEVELS = [56, 40, 28, 20, 14, 10, 7, 5, 4, 3, 2, 0];
const BASE = 6; // resting level (7px blocks)
const ORIGINAL_COLOURS_AT = 9; // from this level on, use real colours

const RAMPS: Record<Exclude<PortraitPalette, "original">, string[]> = {
  tint: ["#0b0b0a", "#1f1219", "#38202f", "#553047", "#764262", "#9b5884", "#c47bb0", "#f5abed"],
  mono: ["#0b0b0a", "#1a1a18", "#2b2a27", "#3f3e3a", "#585650", "#77746d", "#9b988f", "#c3c0b7", "#ece9e1"],
};

// 4x4 Bayer matrix, normalised to [-0.5, 0.5)
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => v / 16 - 0.5);

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
}

/** Draw `img` into a w×h box with object-fit: cover, biased toward the top (faces). */
function drawCover(ctx: CanvasRenderingContext2D, img: CanvasImageSource, iw: number, ih: number, w: number, h: number) {
  const scale = Math.max(w / iw, h / ih);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (iw - sw) / 2;
  const sy = Math.max(0, Math.min(ih - sh, (ih - sh) * 0.3));
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
}

/** Procedural placeholder: a lit head-and-shoulders silhouette. */
function makePlaceholder() {
  const w = 600;
  const h = 750;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;

  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#121211");
  bg.addColorStop(1, "#070706");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w * 0.62, h * 0.36, 10, w * 0.62, h * 0.36, w * 0.62);
  glow.addColorStop(0, "rgba(245,171,237,0.16)");
  glow.addColorStop(1, "rgba(245,171,237,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  const body = ctx.createLinearGradient(w * 0.15, 0, w * 0.85, 0);
  body.addColorStop(0, "#d6d3ca");
  body.addColorStop(0.5, "#9a978e");
  body.addColorStop(1, "#4a4843");
  ctx.fillStyle = body;

  // shoulders
  ctx.beginPath();
  ctx.moveTo(w * 0.02, h);
  ctx.bezierCurveTo(w * 0.04, h * 0.78, w * 0.22, h * 0.71, w * 0.4, h * 0.68);
  ctx.lineTo(w * 0.6, h * 0.68);
  ctx.bezierCurveTo(w * 0.78, h * 0.71, w * 0.96, h * 0.78, w * 0.98, h);
  ctx.closePath();
  ctx.fill();
  // neck
  ctx.fillRect(w * 0.41, h * 0.5, w * 0.18, h * 0.2);
  // head
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.36, w * 0.19, h * 0.19, 0, 0, Math.PI * 2);
  ctx.fill();
  // hair
  ctx.fillStyle = "#5b5953";
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.27, w * 0.205, h * 0.12, 0, Math.PI, Math.PI * 2);
  ctx.ellipse(w * 0.5, h * 0.27, w * 0.205, h * 0.05, 0, 0, Math.PI);
  ctx.fill();
  // collar shadow
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.69, w * 0.13, h * 0.035, 0, 0, Math.PI * 2);
  ctx.fill();
  return { el: c as CanvasImageSource, w, h };
}

export function PixelPortrait({ src, alt, palette = "tint", className, caption = true }: Props) {
  const wrapRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<{ el: CanvasImageSource; w: number; h: number } | null>(null);
  const levelRef = useRef(0);
  const targetRef = useRef(BASE);
  const timerRef = useRef<number | null>(null);
  const smallRef = useRef<HTMLCanvasElement | null>(null);

  const [level, setLevel] = useState(0);
  const [grid, setGrid] = useState<[number, number]>([0, 0]);
  const [developed, setDeveloped] = useState(false);
  const [ready, setReady] = useState(false);

  const render = useCallback(
    (lvlIdx: number) => {
      const canvas = canvasRef.current;
      const source = sourceRef.current;
      if (!canvas || !source || !canvas.width) return;
      const ctx = canvas.getContext("2d")!;
      const W = canvas.width;
      const H = canvas.height;
      const dpr = W / canvas.clientWidth || 1;
      const px = LEVELS[lvlIdx];

      if (px === 0) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        drawCover(ctx, source.el, source.w, source.h, W, H);
        setGrid([Math.round(W / dpr), Math.round(H / dpr)]);
        return;
      }

      const block = Math.max(1, Math.round(px * dpr));
      const cols = Math.ceil(W / block);
      const rows = Math.ceil(H / block);
      const small = (smallRef.current ??= document.createElement("canvas"));
      small.width = cols;
      small.height = rows;
      const sctx = small.getContext("2d", { willReadFrequently: true })!;
      sctx.imageSmoothingEnabled = true;
      sctx.imageSmoothingQuality = "high";
      drawCover(sctx, source.el, source.w, source.h, cols, rows);
      const data = sctx.getImageData(0, 0, cols, rows).data;

      const useOriginal = palette === "original" || lvlIdx >= ORIGINAL_COLOURS_AT;
      const ramp = palette === "original" ? null : RAMPS[palette];
      const gap = px >= 7 ? Math.max(1, Math.round(dpr)) : 0;

      ctx.fillStyle = "#0b0b0a";
      ctx.fillRect(0, 0, W, H);

      // tone prep for palette mode: unsharp mask (local contrast) + auto-levels
      let lums: Float32Array | null = null;
      let lo = 0;
      let hi = 1;
      if (ramp && !useOriginal) {
        const n = cols * rows;
        const base = new Float32Array(n);
        for (let i = 0; i < n; i++)
          base[i] = (0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]) / 255;
        // separable box blur, radius scales with grid density
        const rad = Math.max(1, Math.round(cols / 30));
        const tmp = new Float32Array(n);
        const blur = new Float32Array(n);
        for (let y = 0; y < rows; y++)
          for (let x = 0; x < cols; x++) {
            let sum = 0;
            let c = 0;
            for (let k = -rad; k <= rad; k++) {
              const xx = x + k;
              if (xx >= 0 && xx < cols) {
                sum += base[y * cols + xx];
                c++;
              }
            }
            tmp[y * cols + x] = sum / c;
          }
        for (let y = 0; y < rows; y++)
          for (let x = 0; x < cols; x++) {
            let sum = 0;
            let c = 0;
            for (let k = -rad; k <= rad; k++) {
              const yy = y + k;
              if (yy >= 0 && yy < rows) {
                sum += tmp[yy * cols + x];
                c++;
              }
            }
            blur[y * cols + x] = sum / c;
          }
        lums = new Float32Array(n);
        for (let i = 0; i < n; i++) lums[i] = base[i] + 1.4 * (base[i] - blur[i]);
        const sorted = Array.from(lums).sort((a, b) => a - b);
        lo = sorted[Math.floor(n * 0.04)];
        hi = sorted[Math.floor(n * 0.85)];
        if (hi - lo < 0.1) hi = lo + 0.1;
      }

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          let fill: string;
          if (useOriginal || !ramp) {
            // light posterise keeps the pixels feeling deliberate
            const q = (v: number) => Math.round(v / 24) * 24;
            fill = `rgb(${q(r)},${q(g)},${q(b)})`;
          } else {
            const raw = lums ? lums[y * cols + x] : (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
            const lum = Math.min(1, Math.max(0, (raw - lo) / (hi - lo)));
            // slight mid-tone lift, then a soft ordered dither
            const t = Math.pow(lum, 0.7) + (BAYER[(y % 4) * 4 + (x % 4)] * 0.45) / (ramp.length - 1);
            const idx = Math.min(ramp.length - 1, Math.max(0, Math.round(t * (ramp.length - 1))));
            fill = ramp[idx];
          }
          ctx.fillStyle = fill;
          ctx.fillRect(x * block, y * block, block - gap, block - gap);
        }
      }
      setGrid([cols, rows]);
    },
    [palette],
  );

  // step levelRef toward targetRef, one level per frame-ish
  const step = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tick = () => {
      const cur = levelRef.current;
      const target = targetRef.current;
      if (cur === target) return;
      const next = reduced ? target : cur + Math.sign(target - cur);
      levelRef.current = next;
      setLevel(next);
      render(next);
      if (next !== target) timerRef.current = window.setTimeout(tick, next < BASE ? 80 : 55);
    };
    tick();
  }, [render]);

  // load source
  useEffect(() => {
    let cancelled = false;
    if (!src) {
      sourceRef.current = makePlaceholder();
      setReady(true);
      return;
    }
    const img = new Image();
    img.decoding = "async";
    // Route through Next's optimizer for a right-sized, compressed source.
    img.src = `/_next/image?url=${encodeURIComponent(src)}&w=1080&q=75`;
    img.onload = () => {
      if (cancelled) return;
      sourceRef.current = { el: img, w: img.naturalWidth, h: img.naturalHeight };
      setReady(true);
    };
    img.onerror = () => {
      if (cancelled || img.src.endsWith(src)) return;
      img.src = src;
    };
    return () => {
      cancelled = true;
    };
  }, [src]);

  // size canvas + start entrance when visible
  useEffect(() => {
    if (!ready) return;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = wrap.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      render(levelRef.current);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          step();
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(wrap);

    return () => {
      ro.disconnect();
      io.disconnect();
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [ready, render, step]);

  const setDev = (v: boolean) => {
    setDeveloped(v);
    targetRef.current = v ? LEVELS.length - 1 : BASE;
    step();
  };

  const px = LEVELS[level];
  const res = px === 0 ? "full res" : `${grid[0]}×${grid[1]} px`;

  return (
    <figure className={cn("relative", className)}>
      <div className="crop-marks">
        <button
          type="button"
          ref={wrapRef}
          aria-pressed={developed}
          aria-label={`${alt}. ${developed ? "Showing original photo" : "Pixelated"}; press to toggle.`}
          onPointerEnter={(e) => e.pointerType === "mouse" && setDev(true)}
          onPointerLeave={(e) => e.pointerType === "mouse" && setDev(false)}
          onClick={(e) => {
            // mouse users already toggled via hover
            if ((e.nativeEvent as PointerEvent).pointerType === "mouse") return;
            setDev(!developed);
          }}
          className="group relative block aspect-[4/5] w-full overflow-hidden bg-ink-2 outline-offset-4"
        >
          <canvas ref={canvasRef} role="img" aria-label={alt} className="absolute inset-0 h-full w-full" />
          {/* scanline sheen */}
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 mix-blend-overlay transition-opacity duration-500",
              developed ? "opacity-0" : "opacity-30",
            )}
            style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,.35) 0 1px, transparent 1px 3px)" }}
          />
          {!src && isDev && (
            <span className="absolute inset-x-3 bottom-3 border border-dashed border-accent/40 bg-ink/80 px-2 py-1.5 text-left font-mono text-[10px] leading-tight text-accent">
              placeholder · add /public/images/portrait.jpg and set site.portrait.src
            </span>
          )}
        </button>
      </div>
      {caption && (
        <figcaption className="mt-5 flex items-center justify-between gap-4 font-mono text-[11px] text-dim">
          <span>
            <span className="whitespace-nowrap"><span className="text-muted">fig. 01</span> christian.png</span>
          </span>
          <span className="flex items-center gap-3">
            <span className="whitespace-nowrap tabular-nums text-muted">{res}</span>
            <span className="hidden whitespace-nowrap text-faint xl:inline">{developed ? "developed" : "hover / tap to develop"}</span>
          </span>
        </figcaption>
      )}
    </figure>
  );
}
