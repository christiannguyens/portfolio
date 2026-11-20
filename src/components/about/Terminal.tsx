"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { foundingPolaroids } from "@/data/wall";
import { site } from "@/data/site";
import { MONOGRAM } from "@/lib/pixel";
import { cn } from "@/lib/utils";
import { Snake } from "./Snake";

/**
 * A small interactive terminal. Deliberately *not* a résumé recap: it's a
 * playground (neofetch, live stocks, clocks, a snake game, a few toys).
 */

type Line = { kind: "in" | "out" | "accent" | "dim" | "node"; text?: string; node?: ReactNode };
type Result = Line[] | "clear" | "snake";

const PROMPT = "christian@stl ~ %";
const LAUNCHED = new Date("2026-11-18T00:00:00-06:00");
const PAGES = ["about", "work", "experience", "stack", "contact", "wall"];

const HELP: [string, string][] = [
  ["neofetch", "about this site"],
  ["stocks", "today's biggest movers"],
  ["time", "st. louis + charlotte"],
  ["snake", "play snake"],
  ["flip", "flip a coin"],
  ["roll [sides]", "roll a die"],
  ["cowsay <text>", "you know"],
  ["ls / open <page>", "get around the site"],
  ["clear", "clear the screen"],
];

const out = (text: string): Line => ({ kind: "out", text });
const dim = (text: string): Line => ({ kind: "dim", text });

function clockLines() {
  const now = new Date();
  return site.clocks.map((c) =>
    out(
      `${c.label.padEnd(5)}${new Intl.DateTimeFormat("en-US", { timeZone: c.timeZone, hour: "numeric", minute: "2-digit", second: "2-digit" }).format(now)}`,
    ),
  );
}

async function neofetch(): Promise<Line[]> {
  let polaroids = foundingPolaroids.length;
  try {
    const r = await fetch("/api/wall");
    polaroids += ((await r.json()).entries ?? []).length;
  } catch {}
  const days = Math.max(0, Math.floor((Date.now() - LAUNCHED.getTime()) / 86_400_000));
  const now = new Date();
  const fmt = (tz: string) => new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" }).format(now);
  const logo = MONOGRAM.map((r) => [...r].map((c) => (c === "#" ? "██" : "  ")).join(""));
  const info: [string, string][] = [
    ["os", "next.js 16 on vercel"],
    ["shell", "zsh (basically)"],
    ["theme", "#f5abed"],
    ["fonts", "schibsted grotesk, plex mono"],
    ["uptime", days === 0 ? "launched today" : `${days} day${days === 1 ? "" : "s"}`],
    ["res", `${window.innerWidth}×${window.innerHeight}`],
    ["polaroids", `${polaroids} on the wall`],
    ["local", site.clocks.map((c) => `${c.label} ${fmt(c.timeZone)}`).join(" · ")],
  ];
  return [
    {
      kind: "node",
      node: (
        <div className="flex flex-col gap-3 py-1 sm:flex-row sm:items-start sm:gap-6">
          <pre className="hidden shrink-0 text-[8px] leading-[8px] text-accent sm:block" aria-hidden>
            {logo.join("\n")}
          </pre>
          <div>
            <p className="text-accent">christian@stl</p>
            <p className="text-faint">-------------</p>
            {info.map(([k, v]) => (
              <p key={k}>
                <span className="inline-block w-[5.5rem] text-accent-dim">{k}</span>
                <span className="text-muted">{v}</span>
              </p>
            ))}
            <p className="mt-1.5 flex gap-1" aria-hidden>
              {["#0b0b0a", "#4a4844", "#9b988f", "#ece9e1", "#b06ea7", "#f5abed"].map((c) => (
                <span key={c} className="inline-block h-3 w-5" style={{ background: c }} />
              ))}
            </p>
          </div>
        </div>
      ),
    },
  ];
}

async function stocks(): Promise<Line[]> {
  try {
    const r = await fetch("/api/quotes");
    const { quotes } = (await r.json()) as { quotes: { symbol: string; price?: number; change?: number }[] };
    const live = quotes.filter((q) => q.price !== undefined && q.change !== undefined).slice(0, 6);
    if (!live.length) return [dim("market data's taking a break. try again later.")];
    return [
      dim("biggest movers today"),
      ...live.map((q) => ({
        kind: "node" as const,
        node: (
          <p className="whitespace-pre">
            <span className="text-paper">{q.symbol.padEnd(7)}</span>
            <span className="text-muted">{q.price!.toFixed(2).padStart(9)}</span>
            <span className={q.change! >= 0 ? "text-accent" : "text-dim"}>
              {"   "}
              {q.change! >= 0 ? "▲" : "▼"} {Math.abs(q.change!).toFixed(2)}%
            </span>
          </p>
        ),
      })),
    ];
  } catch {
    return [dim("couldn't reach the market. try again later.")];
  }
}

function cowsay(text: string): Line[] {
  const t = text.trim() || "moo";
  const msg = t.length > 40 ? t.slice(0, 39) + "…" : t;
  const art = [
    ` ${"_".repeat(msg.length + 2)}`,
    `< ${msg} >`,
    ` ${"-".repeat(msg.length + 2)}`,
    "        \\   ^__^",
    "         \\  (oo)\\_______",
    "            (__)\\       )\\/\\",
    "                ||----w |",
    "                ||     ||",
  ];
  return [{ kind: "node", node: <pre className="leading-[1.35] text-muted">{art.join("\n")}</pre> }];
}

export function Terminal() {
  const router = useRouter();
  const pathname = usePathname();
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const [booted, setBooted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [playing, setPlaying] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const go = useCallback(
    (page: string) => {
      if (page === "wall") return router.push("/wall");
      if (pathname === "/") document.getElementById(page)?.scrollIntoView({ behavior: "smooth" });
      else router.push(`/#${page}`);
    },
    [pathname, router],
  );

  const run = useCallback(
    async (raw: string): Promise<Result> => {
      const cmd = raw.trim().replace(/\s+/g, " ");
      const [name, ...args] = cmd.split(" ");
      const lower = name?.toLowerCase() ?? "";
      const arg = args.join(" ");
      switch (lower) {
        case "":
          return [];
        case "help":
          return HELP.map(([k, v]) => ({
            kind: "node" as const,
            node: (
              <p className="whitespace-pre">
                <span className="text-paper">{k.padEnd(18)}</span>
                <span className="text-dim">{v}</span>
              </p>
            ),
          }));
        case "neofetch":
          return neofetch();
        case "stocks":
        case "stonks":
          return stocks();
        case "time":
        case "date":
          return clockLines();
        case "snake":
          return "snake";
        case "flip":
          return [out(Math.random() < 0.5 ? "heads" : "tails")];
        case "roll": {
          const sides = Math.min(1000, Math.max(2, parseInt(arg) || 6));
          return [out(`🎲 ${1 + Math.floor(Math.random() * sides)}  (d${sides})`)];
        }
        case "cowsay":
          return cowsay(arg);
        case "ls":
          return [out(PAGES.join("   "))];
        case "open":
        case "cd": {
          const page = arg.toLowerCase().replace(/^\/|\/$/g, "");
          if (!PAGES.includes(page)) return [dim(`no such page: ${page || "(nothing)"}. try "ls"`)];
          window.setTimeout(() => go(page), 250);
          return [{ kind: "accent", text: `→ ${page}` }];
        }
        case "clear":
          return "clear";
        case "history":
          return history.length ? history.slice().reverse().map((h, i) => out(`${String(i + 1).padStart(3)}  ${h}`)) : [dim("nothing yet")];
        case "gg":
          return [out("gg go next")];
        case "ff":
          return [dim("surrender vote failed (1/5)")];
        case "sudo":
          return [dim("nice try.")];
        case "exit":
          return [dim("there's no leaving. try \"clear\"")];
        case "whoami":
          return [out("you're a visitor. hi."), dim("(scroll up for me)")];
        default:
          return [dim(`command not found: ${name}. type "help"`)];
      }
    },
    [go, history],
  );

  const exec = useCallback(
    async (cmd: string) => {
      setLines((l) => [...l, { kind: "in", text: cmd }]);
      if (cmd.trim()) setHistory((h) => [cmd, ...h].slice(0, 50));
      setBusy(true);
      const res = await run(cmd);
      setBusy(false);
      if (res === "clear") setLines([]);
      else if (res === "snake") setPlaying(true);
      else setLines((l) => [...l, ...res]);
    },
    [run],
  );

  // auto-type "neofetch" once when scrolled into view
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timer: number;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const cmd = "neofetch";
        const finish = async () => {
          setValue("");
          await exec(cmd);
          setBooted(true);
        };
        if (reduced) return void finish();
        let i = 0;
        const type = () => {
          i++;
          setValue(cmd.slice(0, i));
          if (i < cmd.length) timer = window.setTimeout(type, 70 + Math.random() * 60);
          else timer = window.setTimeout(finish, 300);
        };
        timer = window.setTimeout(type, 500);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [lines, playing]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!booted || busy) return;
    const cmd = value;
    setValue("");
    setHIdx(-1);
    exec(cmd);
  };

  const onGameExit = (score: number, best: number) => {
    setPlaying(false);
    setLines((l) => [...l, { kind: "accent", text: `snake · score ${score} · best ${best}` }]);
    window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 50);
  };

  return (
    <div
      ref={rootRef}
      className="flex h-[400px] flex-col overflow-hidden border border-line bg-ink-2 md:h-[440px]"
      onClick={() => !playing && inputRef.current?.focus({ preventScroll: true })}
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-faint" />
          <span className="h-2 w-2 rounded-full bg-faint" />
          <span className="h-2 w-2 rounded-full bg-faint" />
        </div>
        <span className="font-mono text-[11px] text-dim">{playing ? "snake" : "zsh: christian"}</span>
        <span className="font-mono text-[11px] text-faint">80×24</span>
      </div>

      <div
        ref={bodyRef}
        className="flex-1 overflow-y-auto px-4 py-4 font-mono text-[12.5px] leading-[1.7]"
        role="log"
        aria-live="polite"
        aria-label="Terminal output"
      >
        {!playing && (
          <>
            <p className="text-dim">Last login on ttys001. Type &quot;help&quot; to see what this thing can do.</p>
            {lines.map((l, i) =>
              l.kind === "node" ? (
                <div key={i}>{l.node}</div>
              ) : (
                <p
                  key={i}
                  className={cn(
                    l.kind === "in" && "mt-2 text-paper",
                    l.kind === "accent" && "text-accent",
                    l.kind === "dim" && "text-dim",
                    l.kind === "out" && "whitespace-pre-wrap text-muted",
                  )}
                >
                  {l.kind === "in" && <span className="mr-2 text-accent-dim">{PROMPT}</span>}
                  {l.text}
                </p>
              ),
            )}
            <form onSubmit={submit} className="mt-2 flex items-center">
              <label htmlFor="term-input" className="mr-2 shrink-0 text-accent-dim">
                {PROMPT}
              </label>
              <input
                ref={inputRef}
                id="term-input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" && history.length) {
                    e.preventDefault();
                    const n = Math.min(hIdx + 1, history.length - 1);
                    setHIdx(n);
                    setValue(history[n]);
                  } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    const n = hIdx - 1;
                    setHIdx(Math.max(n, -1));
                    setValue(n < 0 ? "" : history[n]);
                  }
                }}
                readOnly={!booted}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-label="Terminal command"
                className="w-full flex-1 bg-transparent text-paper caret-accent outline-none"
              />
            </form>
          </>
        )}
        {playing && <Snake onExit={onGameExit} />}
      </div>

      {!playing && (
        <div className="flex flex-wrap gap-1.5 border-t border-line px-3 py-2.5">
          {["help", "stocks", "snake", "neofetch"].map((c) => (
            <button
              key={c}
              type="button"
              disabled={!booted || busy}
              onClick={(e) => {
                e.stopPropagation();
                exec(c);
              }}
              className="border border-line px-2 py-1 font-mono text-[11px] text-muted transition-colors hover:border-accent/50 hover:text-accent disabled:opacity-40"
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
