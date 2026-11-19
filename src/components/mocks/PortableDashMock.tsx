"use client";

import { EyeOff, Lock, Monitor, Smartphone } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Interactive HTML recreation of PortableDash for illustration.
 * Demonstrates the documented features: drag-to-resize panels, 7 layout
 * presets, 8 themes, portrait layouts, a photo gallery and privacy mode.
 * Panel contents are placeholders, not real data.
 */

type PanelId = "msgs" | "music" | "cal" | "claude" | "web" | "ticker" | "photos";
type Preset = { cols: number[]; rows: string; areas: string[] };

const LANDSCAPE: Preset[] = [
  { cols: [1.05, 1.45, 1], rows: "1fr 1fr 30px", areas: ["msgs web cal", "music claude photos", "ticker ticker ticker"] },
  { cols: [1, 2], rows: "1fr 1fr 1fr 30px", areas: ["msgs web", "cal web", "music web", "ticker ticker"] },
  { cols: [1.3, 1], rows: "1fr 1fr 30px", areas: ["claude msgs", "claude cal", "ticker ticker"] },
  { cols: [1, 1, 1, 1], rows: "1.1fr 1fr 30px", areas: ["msgs msgs cal cal", "music photos claude web", "ticker ticker ticker ticker"] },
  { cols: [1.7, 1], rows: "30px 1fr 1fr", areas: ["ticker ticker", "web msgs", "web music"] },
  { cols: [1, 1, 1], rows: "1.4fr 1fr 30px", areas: ["photos photos msgs", "music cal claude", "ticker ticker ticker"] },
  { cols: [1, 1], rows: "1fr 1fr", areas: ["cal msgs", "music claude"] },
];

const PORTRAIT: Preset[] = [
  { cols: [1, 1], rows: "30px 1.3fr 1fr 1fr", areas: ["ticker ticker", "web web", "msgs cal", "music claude"] },
  { cols: [1], rows: "30px 1fr 1fr 0.8fr", areas: ["ticker", "msgs", "cal", "music"] },
  { cols: [1, 1], rows: "1.2fr 1fr 1fr", areas: ["claude claude", "msgs photos", "music cal"] },
];

type Theme = { bg: string; panel: string; line: string; text: string; sub: string; accent: string; light?: boolean };
const THEMES: Theme[] = [
  { bg: "#0d0d0c", panel: "#161615", line: "#262624", text: "#ece9e1", sub: "#8d8a82", accent: "#f5abed" },
  { bg: "#e6e3db", panel: "#f4f2ec", line: "#d6d2c8", text: "#1b1b19", sub: "#77746c", accent: "#2f7a43", light: true },
  { bg: "#0a0f1d", panel: "#111a2e", line: "#1e2a44", text: "#e3e9f7", sub: "#7f8bab", accent: "#7aa2ff" },
  { bg: "#140c09", panel: "#20140f", line: "#33221a", text: "#f3e6dc", sub: "#a08877", accent: "#ff9a5a" },
  { bg: "#100e17", panel: "#1a1724", line: "#2a2638", text: "#ebe6f7", sub: "#8e86a6", accent: "#b9a6ff" },
  { bg: "#061312", panel: "#0d1f1d", line: "#183230", text: "#dcf1ed", sub: "#78a19a", accent: "#5fe0c8" },
  { bg: "#150b0f", panel: "#22131a", line: "#36202a", text: "#f6e4ea", sub: "#a8848f", accent: "#ff7aa8" },
  { bg: "#000000", panel: "#0b0b0b", line: "#262626", text: "#ffffff", sub: "#8a8a8a", accent: "#ffffff" },
];

const PRIVATE: PanelId[] = ["msgs", "claude", "photos", "cal"];
const LABELS: Record<PanelId, string> = {
  msgs: "Messages",
  music: "Spotify",
  cal: "Calendar",
  claude: "Claude",
  web: "Web",
  ticker: "Ticker",
  photos: "Photos",
};

const DESIGN_W = 1000;
const LAND_H = 625;
const PORT_W = 600;
const PORT_H = 900;
const PAD = 10;
const GAP = 8;

/* ---------------- panel contents ---------------- */

function Skel({ w, h = 6, className }: { w: string | number; h?: number; className?: string }) {
  return <span className={cn("skel block", className)} style={{ width: w, height: h }} />;
}

function Messages() {
  return (
    <div className="flex h-full gap-2.5">
      <ul className="flex w-[38%] min-w-[90px] flex-col gap-2 border-r border-[var(--pd-line)] pr-2.5">
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className={cn("flex items-center gap-2 rounded-[4px] p-1", i === 0 && "bg-[var(--pd-line)]")}>
            <span className="h-5 w-5 shrink-0 rounded-full" style={{ background: "var(--pd-sub)", opacity: 0.3 }} />
            <span className="flex flex-1 flex-col gap-1">
              <Skel w="70%" h={5} />
              <Skel w="90%" h={4} />
            </span>
            {i === 1 && <span className="h-1.5 w-1.5 rounded-full bg-[var(--pd-accent)]" />}
          </li>
        ))}
      </ul>
      <div className="flex flex-1 flex-col justify-end gap-1.5 overflow-hidden">
        <span className="max-w-[70%] self-start rounded-[10px] bg-[var(--pd-line)] px-2.5 py-1.5 text-[10px]">
          running 5 min late
        </span>
        <span className="max-w-[70%] self-end rounded-[10px] bg-[var(--pd-accent)] px-2.5 py-1.5 text-[10px] text-[var(--pd-bg)]">
          no worries, see you there
        </span>
        <span className="max-w-[60%] self-start rounded-[10px] bg-[var(--pd-line)] px-2.5 py-1.5">
          <Skel w={60} h={5} />
        </span>
        <span className="mt-1 rounded-full border border-[var(--pd-line)] px-2.5 py-1 text-[9px] text-[var(--pd-sub)]">iMessage</span>
      </div>
    </div>
  );
}

const ART = Array.from({ length: 36 }, (_, i) => ((i * 37 + (i % 5) * 11) % 9) / 9);
function Music() {
  return (
    <div className="flex h-full items-center gap-3">
      <div className="grid aspect-square h-full max-h-[110px] shrink-0 grid-cols-6 overflow-hidden rounded-[4px]">
        {ART.map((v, i) => (
          <span key={i} style={{ background: "var(--pd-accent)", opacity: 0.15 + v * 0.75 }} />
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-end gap-[2px]" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="h-3 w-[3px] origin-bottom animate-eq bg-[var(--pd-accent)]"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
          <span className="ml-1.5 text-[9px] uppercase tracking-wider text-[var(--pd-sub)]">Now playing</span>
        </div>
        <Skel w="80%" h={7} className="!opacity-40" />
        <Skel w="50%" h={5} />
        <div className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-[var(--pd-line)]">
          <div className="h-full animate-progress bg-[var(--pd-text)]" />
        </div>
        <div className="flex items-center gap-3 text-[var(--pd-text)]">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M2 1h1v8H2zM9 1v8L3.5 5z" /></svg>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M3 1h2v10H3zM7 1h2v10H7z" /></svg>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M7 1h1v8H7zM1 1v8l5.5-4z" /></svg>
        </div>
      </div>
    </div>
  );
}

function Calendar() {
  const hours = [9, 10, 11, 12, 1, 2];
  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-baseline gap-2">
        <span className="text-[18px] font-semibold leading-none">18</span>
        <span className="text-[9px] uppercase tracking-wider text-[var(--pd-sub)]">Today</span>
      </div>
      <div className="relative flex-1 overflow-hidden">
        {hours.map((h, i) => (
          <div key={h} className="absolute inset-x-0 flex items-start gap-2" style={{ top: `${(i / hours.length) * 100}%` }}>
            <span className="w-5 text-right text-[8px] text-[var(--pd-sub)]">{h}</span>
            <span className="mt-[5px] h-px flex-1 bg-[var(--pd-line)]" />
          </div>
        ))}
        {[
          { top: 4, h: 22 },
          { top: 40, h: 16 },
          { top: 66, h: 24 },
        ].map((e, i) => (
          <div
            key={i}
            className="absolute left-7 right-0 flex flex-col gap-1 rounded-[3px] border-l-2 border-[var(--pd-accent)] px-1.5 py-1"
            style={{ top: `${e.top}%`, height: `${e.h}%`, background: "color-mix(in srgb, var(--pd-accent) 16%, transparent)" }}
          >
            <Skel w="60%" h={5} className="!opacity-40" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Claude() {
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex flex-1 flex-col gap-2 overflow-hidden">
        <span className="self-end rounded-[8px] bg-[var(--pd-line)] px-2.5 py-1.5">
          <Skel w={90} h={5} />
        </span>
        <div className="flex gap-2">
          <span className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-[3px] bg-[var(--pd-accent)] opacity-80" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skel w="95%" h={5} />
            <Skel w="88%" h={5} />
            <Skel w="92%" h={5} />
            <Skel w="60%" h={5} />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-[6px] border border-[var(--pd-line)] px-2 py-1.5 text-[9px] text-[var(--pd-sub)]">
        Reply…
        <span className="h-3.5 w-3.5 rounded-[3px] bg-[var(--pd-text)] opacity-80" />
      </div>
    </div>
  );
}

function Web() {
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center gap-2 rounded-[5px] bg-[var(--pd-line)] px-2 py-1 text-[9px] text-[var(--pd-sub)]">
        <Lock size={8} /> github.com/christiannguyens
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-hidden p-1">
        <Skel w="45%" h={10} className="!opacity-40" />
        <Skel w="80%" h={5} />
        <Skel w="70%" h={5} />
        <div className="mt-1 grid flex-1 grid-cols-3 gap-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="rounded-[4px] border border-[var(--pd-line)]" />
          ))}
        </div>
      </div>
    </div>
  );
}

const TICKS = [
  ["AAPL", "+0.8%"],
  ["MSFT", "+0.4%"],
  ["NVDA", "−1.1%"],
  ["GOOGL", "+0.6%"],
  ["AMZN", "−0.3%"],
  ["TSLA", "+2.0%"],
  ["META", "+0.2%"],
];
function Ticker() {
  const row = (
    <div className="flex shrink-0 items-center gap-6 pr-6">
      {TICKS.map(([s, c]) => (
        <span key={s} className="flex items-center gap-1.5 whitespace-nowrap text-[10px]">
          <span className="font-semibold">{s}</span>
          <span style={{ color: c.startsWith("+") ? "var(--pd-accent)" : "var(--pd-sub)" }}>{c}</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="flex h-full items-center overflow-hidden">
      <div className="flex animate-marquee">
        {row}
        {row}
      </div>
    </div>
  );
}

function Photos() {
  return (
    <div className="grid h-full grid-cols-3 grid-rows-2 gap-1.5">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="rounded-[3px]"
          style={{
            background: `linear-gradient(${140 + i * 30}deg, color-mix(in srgb, var(--pd-accent) ${20 + (i % 3) * 18}%, var(--pd-panel)), var(--pd-line))`,
          }}
        />
      ))}
    </div>
  );
}

const CONTENT: Record<PanelId, () => React.ReactElement> = {
  msgs: Messages,
  music: Music,
  cal: Calendar,
  claude: Claude,
  web: Web,
  ticker: Ticker,
  photos: Photos,
};

/* ---------------- main ---------------- */

export function PortableDashMock({ controls = true, className }: { controls?: boolean; className?: string }) {
  const [presetIdx, setPresetIdx] = useState(0);
  const [themeIdx, setThemeIdx] = useState(0);
  const [portrait, setPortrait] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [colsOverride, setColsOverride] = useState<number[] | null>(null);
  const [scale, setScale] = useState(0);

  const stageRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const presets = portrait ? PORTRAIT : LANDSCAPE;
  const preset = presets[presetIdx % presets.length];
  const cols = colsOverride ?? preset.cols;
  const theme = THEMES[themeIdx];

  const panels = useMemo(() => {
    const seen = new Set<PanelId>();
    preset.areas.forEach((r) => r.split(" ").forEach((a) => seen.add(a as PanelId)));
    return [...seen];
  }, [preset]);

  useEffect(() => setColsOverride(null), [presetIdx, portrait]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / DESIGN_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const winW = portrait ? PORT_W : DESIGN_W;
  const winH = portrait ? PORT_H : LAND_H;
  const sum = cols.reduce((a, b) => a + b, 0);
  const f0 = cols[0] / sum;

  const setFraction = (f: number) => {
    const clamped = Math.min(0.72, Math.max(0.2, f));
    const rest = cols.slice(1).reduce((a, b) => a + b, 0);
    setColsOverride([(clamped * rest) / (1 - clamped), ...cols.slice(1)]);
  };

  const onDrag = (e: React.PointerEvent) => {
    if (!(e.buttons & 1)) return;
    const rect = gridRef.current!.getBoundingClientRect();
    setFraction((e.clientX - rect.left) / rect.width);
  };

  const cssVars = {
    "--pd-bg": theme.bg,
    "--pd-panel": theme.panel,
    "--pd-line": theme.line,
    "--pd-text": theme.text,
    "--pd-sub": theme.sub,
    "--pd-accent": theme.accent,
  } as React.CSSProperties;

  return (
    <div className={className}>
      {/* stage */}
      <div ref={stageRef} className="relative w-full">
        <motion.div
          className="relative w-full"
          animate={{ height: scale ? winH * scale : undefined }}
          initial={false}
          transition={{ type: "spring", stiffness: 160, damping: 24 }}
          style={{ height: scale ? winH * scale : undefined, aspectRatio: scale ? undefined : `${DESIGN_W}/${LAND_H}` }}
        >
          {scale > 0 && (
            <motion.div
              className="absolute left-1/2 top-0 origin-top overflow-hidden rounded-[10px] border font-sans text-[var(--pd-text)] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] transition-colors duration-500"
              style={{
                ...cssVars,
                background: theme.bg,
                borderColor: theme.line,
                x: "-50%",
                scale,
              }}
              initial={false}
              animate={{ width: winW, height: winH }}
              transition={{ type: "spring", stiffness: 160, damping: 24 }}
            >
              {/* title bar */}
              <div className="flex h-7 items-center justify-between border-b border-[var(--pd-line)] px-3 transition-colors duration-500">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                </div>
                <span className="text-[10px] font-medium text-[var(--pd-sub)]">PortableDash</span>
                <span className="flex items-center gap-1 text-[9px] text-[var(--pd-sub)]">
                  {privacy && <EyeOff size={9} />}
                  {portrait ? "Portrait" : "Landscape"} · {presetIdx + 1}
                </span>
              </div>

              {/* grid */}
              <div className="relative" style={{ height: winH - 28 }}>
                <div
                  ref={gridRef}
                  className="grid h-full"
                  style={{
                    padding: PAD,
                    gap: GAP,
                    gridTemplateColumns: cols.map((c) => `minmax(0, ${c}fr)`).join(" "),
                    gridTemplateRows: preset.rows,
                    gridTemplateAreas: preset.areas.map((a) => `"${a}"`).join(" "),
                  }}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {panels.map((id) => {
                      const Body = CONTENT[id];
                      const hidden = privacy && PRIVATE.includes(id);
                      const isTicker = id === "ticker";
                      return (
                        <motion.section
                          key={id}
                          layout
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{ type: "spring", stiffness: 260, damping: 30 }}
                          style={{ gridArea: id }}
                          className="relative flex min-h-0 flex-col overflow-hidden rounded-[7px] border border-[var(--pd-line)] bg-[var(--pd-panel)] transition-colors duration-500"
                        >
                          {!isTicker && (
                            <header className="flex items-center gap-1.5 px-2.5 pt-2 text-[9px] font-medium uppercase tracking-[0.08em] text-[var(--pd-sub)]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[var(--pd-accent)]" />
                              {LABELS[id]}
                            </header>
                          )}
                          <div
                            className={cn(
                              "min-h-0 flex-1 transition-[filter] duration-500",
                              isTicker ? "px-3" : "p-2.5",
                              hidden && "blur-[7px]",
                            )}
                          >
                            <Body />
                          </div>
                          <AnimatePresence>
                            {hidden && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center gap-1.5 text-[10px] font-medium text-[var(--pd-text)]"
                              >
                                <EyeOff size={11} /> Private
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.section>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* resize handle between column 1 and 2 */}
                {cols.length > 1 && (
                  <div
                    role="separator"
                    aria-orientation="vertical"
                    aria-label="Resize first column"
                    aria-valuemin={20}
                    aria-valuemax={72}
                    aria-valuenow={Math.round(f0 * 100)}
                    tabIndex={0}
                    data-cursor="drag"
                    onPointerDown={(e) => (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)}
                    onPointerMove={onDrag}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowLeft") setFraction(f0 - 0.03);
                      if (e.key === "ArrowRight") setFraction(f0 + 0.03);
                    }}
                    className="group/handle absolute bottom-0 top-0 z-10 flex w-4 -translate-x-1/2 touch-none cursor-col-resize items-center justify-center"
                    style={{
                      left: `calc(${PAD}px + (100% - ${2 * PAD}px - ${(cols.length - 1) * GAP}px) * ${f0} + ${GAP / 2}px)`,
                    }}
                  >
                    <span className="h-12 w-[3px] rounded-full bg-[var(--pd-accent)] opacity-40 transition-all group-hover/handle:h-20 group-hover/handle:opacity-100 group-focus-visible/handle:opacity-100" />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* controls */}
      {controls && (
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-line pt-5 font-mono text-[11px]">
          <fieldset className="flex items-center gap-2">
            <legend className="sr-only">Layout preset</legend>
            <span className="label mr-1 text-dim" aria-hidden>
              Layout
            </span>
            <div className="flex">
              {presets.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-pressed={presetIdx % presets.length === i}
                  aria-label={`Layout preset ${i + 1}`}
                  onClick={() => setPresetIdx(i)}
                  className={cn(
                    "-ml-px h-7 w-7 border border-line first:ml-0 transition-colors",
                    presetIdx % presets.length === i
                      ? "relative z-10 border-accent/60 bg-accent/10 text-accent"
                      : "text-muted hover:text-paper",
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex items-center gap-2">
            <legend className="sr-only">Theme</legend>
            <span className="label mr-1 text-dim" aria-hidden>
              Theme
            </span>
            <div className="flex gap-1.5">
              {THEMES.map((t, i) => (
                <button
                  key={i}
                  type="button"
                  aria-pressed={themeIdx === i}
                  aria-label={`Theme ${i + 1}`}
                  onClick={() => setThemeIdx(i)}
                  className={cn(
                    "relative h-6 w-6 overflow-hidden border transition-transform hover:-translate-y-0.5",
                    themeIdx === i ? "border-paper" : "border-line-strong",
                  )}
                  style={{ background: t.bg }}
                >
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5" style={{ background: t.accent }} />
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex items-center gap-2 sm:ml-auto">
            <button
              type="button"
              aria-pressed={portrait}
              onClick={() => setPortrait((v) => !v)}
              className={cn(
                "inline-flex h-8 items-center gap-2 border px-3 transition-colors",
                portrait ? "border-accent/60 bg-accent/10 text-accent" : "border-line text-muted hover:text-paper",
              )}
            >
              {portrait ? <Smartphone size={12} /> : <Monitor size={12} />}
              Portrait
            </button>
            <button
              type="button"
              aria-pressed={privacy}
              onClick={() => setPrivacy((v) => !v)}
              className={cn(
                "inline-flex h-8 items-center gap-2 border px-3 transition-colors",
                privacy ? "border-accent/60 bg-accent/10 text-accent" : "border-line text-muted hover:text-paper",
              )}
            >
              <EyeOff size={12} />
              Privacy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
