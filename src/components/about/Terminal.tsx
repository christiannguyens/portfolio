"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { currentlyExploring } from "@/data/about";
import { experience } from "@/data/experience";
import { projects } from "@/data/projects";
import { site } from "@/data/site";
import { stack } from "@/data/stack";

type Line = { kind: "in" | "out" | "accent" | "dim"; text: string };

const PROMPT = "christian@stl ~ %";

const COMMANDS: Record<string, string> = {
  help: "list commands",
  whoami: "the short version",
  "ls projects": "things I've built",
  "open <project>": "jump to a case study",
  now: "what I'm exploring",
  experience: "where I've worked",
  stack: "tools I use",
  contact: "how to reach me",
  clear: "clear the screen",
};

function run(raw: string, nav: (href: string) => void): Line[] | "clear" {
  const cmd = raw.trim().replace(/\s+/g, " ");
  const lower = cmd.toLowerCase();
  if (!cmd) return [];
  if (lower === "clear") return "clear";
  if (lower === "help")
    return [
      ...Object.entries(COMMANDS).map(([k, v]) => ({ kind: "out" as const, text: `${k.padEnd(16)} ${v}` })),
    ];
  if (lower === "whoami")
    return [
      { kind: "accent", text: site.name },
      { kind: "out", text: `${site.education.program} @ ${site.education.schoolShort}, class of ${site.education.classOf}` },
      { kind: "out", text: `${site.education.honors.join(", ")} · ${site.location}` },
    ];
  if (lower === "ls" || lower === "ls projects")
    return projects.map((p) => ({ kind: "out", text: `${p.slug.padEnd(16)} ${p.category}` }));
  if (lower.startsWith("open ") || lower.startsWith("cd ")) {
    const q = lower.split(" ")[1]?.replace(/\/$/, "") ?? "";
    const p = projects.find((x) => x.slug === q || x.title.toLowerCase().replace(/\s+/g, "") === q.replace(/[-\s]/g, ""));
    if (!p) return [{ kind: "dim", text: `no such project: ${q}. try "ls projects"` }];
    window.setTimeout(() => nav(`/projects/${p.slug}`), 350);
    return [{ kind: "accent", text: `opening ${p.title}…` }];
  }
  if (lower === "now" || lower === "cat now.txt")
    return currentlyExploring.map((c) => ({ kind: "out", text: `→ ${c.label}  (${c.note})` }));
  if (lower === "experience")
    return experience.map((e) => ({ kind: "out", text: `${e.role}, ${e.org}` }));
  if (lower === "stack")
    return stack.map((g) => ({ kind: "out", text: `${g.category.toLowerCase()}: ${g.items.map((i) => i.name).join(", ")}` }));
  if (lower === "contact")
    return [
      ...site.emails.map((e) => ({ kind: "out" as const, text: `${e.label.toLowerCase().padEnd(9)} ${e.address}` })),
      { kind: "out", text: `github    ${site.socials.github.href.replace("https://", "")}` },
      { kind: "out", text: `linkedin  ${site.socials.linkedin.href.replace("https://", "")}` },
    ];
  if (lower.startsWith("sudo"))
    return [{ kind: "dim", text: "nice try. but you could just email me: type \"contact\"" }];
  if (lower === "ls -la" || lower === "pwd") return [{ kind: "out", text: "/Users/christian/stl" }];
  return [{ kind: "dim", text: `command not found: ${cmd}. type "help"` }];
}

export function Terminal() {
  const router = useRouter();
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const [booted, setBooted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // auto-type "whoami" once when scrolled into view
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timer: number;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const cmd = "whoami";
        if (reduced) {
          setLines([{ kind: "in", text: cmd }, ...(run(cmd, () => {}) as Line[])]);
          setBooted(true);
          return;
        }
        let i = 0;
        const type = () => {
          i++;
          setValue(cmd.slice(0, i));
          if (i < cmd.length) timer = window.setTimeout(type, 70 + Math.random() * 60);
          else
            timer = window.setTimeout(() => {
              setLines([{ kind: "in", text: cmd }, ...(run(cmd, () => {}) as Line[])]);
              setValue("");
              setBooted(true);
            }, 320);
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
  }, []);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [lines]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = run(value, (href) => router.push(href));
    if (res === "clear") setLines([]);
    else setLines((l) => [...l, { kind: "in", text: value }, ...res]);
    if (value.trim()) setHistory((h) => [value, ...h].slice(0, 30));
    setHIdx(-1);
    setValue("");
  };

  return (
    <div
      ref={rootRef}
      className="flex h-[380px] flex-col overflow-hidden border border-line bg-ink-2 md:h-[420px]"
      onClick={() => inputRef.current?.focus({ preventScroll: true })}
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-faint" />
          <span className="h-2 w-2 rounded-full bg-faint" />
          <span className="h-2 w-2 rounded-full bg-faint" />
        </div>
        <span className="font-mono text-[11px] text-dim">zsh: christian</span>
        <span className="font-mono text-[11px] text-faint">80×24</span>
      </div>

      <div
        ref={bodyRef}
        className="flex-1 overflow-y-auto px-4 py-4 font-mono text-[12.5px] leading-[1.7]"
        role="log"
        aria-live="polite"
        aria-label="Terminal output"
      >
        <p className="text-dim">Last login: from {site.locationShort}. Type &quot;help&quot; to look around.</p>
        {lines.map((l, i) => (
          <p
            key={i}
            className={
              l.kind === "in"
                ? "mt-2 text-paper"
                : l.kind === "accent"
                  ? "text-accent"
                  : l.kind === "dim"
                    ? "text-dim"
                    : "whitespace-pre-wrap text-muted"
            }
          >
            {l.kind === "in" && <span className="mr-2 text-accent-dim">{PROMPT}</span>}
            {l.text}
          </p>
        ))}
        <form onSubmit={submit} className="mt-2 flex items-center">
          <label htmlFor="term-input" className="mr-2 shrink-0 text-accent-dim">
            {PROMPT}
          </label>
          <div className="relative flex-1">
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
              className="peer w-full bg-transparent text-paper caret-accent outline-none"
            />
          </div>
        </form>
      </div>

      <div className="flex flex-wrap gap-1.5 border-t border-line px-3 py-2.5">
        {["help", "ls projects", "now", "contact"].map((c) => (
          <button
            key={c}
            type="button"
            disabled={!booted}
            onClick={(e) => {
              e.stopPropagation();
              const res = run(c, (href) => router.push(href));
              if (res !== "clear") setLines((l) => [...l, { kind: "in", text: c }, ...res]);
            }}
            className="border border-line px-2 py-1 font-mono text-[11px] text-muted transition-colors hover:border-accent/50 hover:text-accent disabled:opacity-40"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
