"use client";

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** A tiny pixel snake game that runs inside the terminal. */

const W = 20;
const H = 12;
const TICK = 115;
const BEST_KEY = "term:snake:best";

type P = { x: number; y: number };
const DIRS: Record<string, P> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
const KEYMAP: Record<string, keyof typeof DIRS> = {
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
  w: "up", s: "down", a: "left", d: "right", W: "up", S: "down", A: "left", D: "right",
};

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function freeCell(snake: P[]): P {
  while (true) {
    const p = { x: Math.floor(Math.random() * W), y: Math.floor(Math.random() * H) };
    if (!snake.some((s) => s.x === p.x && s.y === p.y)) return p;
  }
}

export function Snake({ onExit }: { onExit: (score: number, best: number) => void }) {
  const start = (): P[] => [{ x: 6, y: 6 }, { x: 5, y: 6 }, { x: 4, y: 6 }];
  const [snake, setSnake] = useState<P[]>(start);
  const [food, setFood] = useState<P>(() => ({ x: 13, y: 6 }));
  const [state, setState] = useState<"ready" | "running" | "over">("ready");
  const [best, setBest] = useState(0);
  const dir = useRef<P>(DIRS.right);
  const queued = useRef<P[]>([]);
  const touch = useRef<P | null>(null);
  const score = snake.length - 3;

  useEffect(() => setBest(readBest()), []);

  const restart = useCallback(() => {
    const s = start();
    setSnake(s);
    setFood(freeCell(s));
    dir.current = DIRS.right;
    queued.current = [];
    setState("ready");
  }, []);

  const steer = useCallback(
    (name: keyof typeof DIRS) => {
      const next = DIRS[name];
      const last = queued.current[queued.current.length - 1] ?? dir.current;
      if (next.x === -last.x && next.y === -last.y) return; // no reversing
      if (next.x === last.x && next.y === last.y) return;
      if (queued.current.length < 3) queued.current.push(next);
      if (state === "ready") setState("running");
    },
    [state],
  );

  const quit = useCallback(() => {
    const b = Math.max(best, score);
    onExit(score, b);
  }, [best, onExit, score]);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (KEYMAP[e.key]) {
        e.preventDefault();
        if (state === "over") return;
        steer(KEYMAP[e.key]);
      } else if (e.key === "Escape" || e.key === "q" || e.key === "Q") {
        e.preventDefault();
        quit();
      } else if ((e.key === "r" || e.key === "R" || e.key === "Enter") && state === "over") {
        e.preventDefault();
        restart();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [quit, restart, state, steer]);

  // game loop
  useEffect(() => {
    if (state !== "running") return;
    const id = window.setInterval(() => {
      if (queued.current.length) dir.current = queued.current.shift()!;
      setSnake((s) => {
        const head = { x: s[0].x + dir.current.x, y: s[0].y + dir.current.y };
        const hitWall = head.x < 0 || head.y < 0 || head.x >= W || head.y >= H;
        const hitSelf = s.slice(0, -1).some((p) => p.x === head.x && p.y === head.y);
        if (hitWall || hitSelf) {
          setState("over");
          const sc = s.length - 3;
          if (sc > readBest()) {
            try {
              localStorage.setItem(BEST_KEY, String(sc));
            } catch {}
            setBest(sc);
          }
          return s;
        }
        const ate = head.x === food.x && head.y === food.y;
        const next = [head, ...(ate ? s : s.slice(0, -1))];
        if (ate) setFood(freeCell(next));
        return next;
      });
    }, TICK);
    return () => window.clearInterval(id);
  }, [state, food]);

  const cells = new Map<string, "head" | "body">();
  snake.forEach((p, i) => cells.set(`${p.x},${p.y}`, i === 0 ? "head" : "body"));

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <div className="flex w-full max-w-[380px] items-center justify-between font-mono text-[11px]">
        <span className="text-muted">
          score <span className="text-accent">{score}</span>
        </span>
        <span className="text-dim">best {Math.max(best, state === "over" ? score : 0)}</span>
      </div>
      <div
        className="relative w-full max-w-[380px] border border-line-strong bg-ink"
        style={{ aspectRatio: `${W}/${H}`, touchAction: "none" }}
        onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
        onTouchMove={(e) => {
          if (!touch.current) return;
          const dx = e.touches[0].clientX - touch.current.x;
          const dy = e.touches[0].clientY - touch.current.y;
          if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
          steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
          touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }}
        role="img"
        aria-label={`Snake game. Score ${score}.`}
      >
        <div className="grid h-full w-full" style={{ gridTemplateColumns: `repeat(${W}, 1fr)`, gridTemplateRows: `repeat(${H}, 1fr)` }}>
          {Array.from({ length: W * H }, (_, i) => {
            const x = i % W;
            const y = Math.floor(i / W);
            const c = cells.get(`${x},${y}`);
            const isFood = food.x === x && food.y === y;
            return (
              <span
                key={i}
                className={cn(
                  "m-[1px]",
                  c === "head" && "bg-paper",
                  c === "body" && "bg-accent",
                  isFood && "animate-pulse bg-accent/0 outline outline-1 -outline-offset-2 outline-accent",
                  !c && !isFood && "bg-line/40",
                )}
              />
            );
          })}
        </div>
        {state !== "running" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/70 text-center font-mono text-[11px]">
            {state === "ready" ? (
              <>
                <span className="text-paper">press an arrow key (or swipe) to start</span>
                <span className="text-dim">wasd works too · q to quit</span>
              </>
            ) : (
              <>
                <span className="text-accent">game over · score {score}</span>
                <span className="flex gap-2">
                  <button type="button" onClick={restart} className="border border-line px-2 py-1 text-paper hover:border-accent/60">
                    play again (r)
                  </button>
                  <button type="button" onClick={quit} className="border border-line px-2 py-1 text-muted hover:text-paper">
                    quit (q)
                  </button>
                </span>
              </>
            )}
          </div>
        )}
      </div>
      {/* touch d-pad */}
      <div className="flex items-center gap-1.5 [@media(pointer:fine)]:hidden">
        {(
          [
            ["left", ArrowLeft],
            ["up", ArrowUp],
            ["down", ArrowDown],
            ["right", ArrowRight],
          ] as const
        ).map(([d, Icon]) => (
          <button
            key={d}
            type="button"
            aria-label={d}
            onClick={() => (state === "over" ? null : steer(d))}
            className="flex h-9 w-9 items-center justify-center border border-line text-muted active:bg-accent/20"
          >
            <Icon size={14} />
          </button>
        ))}
        <button type="button" onClick={quit} className="ml-2 h-9 border border-line px-3 font-mono text-[11px] text-muted">
          quit
        </button>
      </div>
      <button type="button" onClick={quit} className="hidden font-mono text-[11px] text-dim hover:text-paper [@media(pointer:fine)]:inline">
        q / esc to quit
      </button>
    </div>
  );
}
