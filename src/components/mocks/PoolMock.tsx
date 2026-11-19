"use client";

import { ICONS } from "@/lib/pixel";
import { cn } from "@/lib/utils";
import { PixelGlyph } from "../ui/PixelGlyph";
import { ScaledStage } from "./ScaledStage";

/** Illustrative recreation of the group-buying flow; hover advances the pool. */

const STEPS = ["Declare", "Pool", "Purchase", "Pickup"];

export function PoolMock() {
  return (
    <ScaledStage width={640} height={420}>
      <div className="flex h-full flex-col overflow-hidden rounded-[8px] border border-line-strong bg-[#121211] p-5 font-sans text-paper">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-[14px] font-semibold tracking-tight">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-accent">
              <span className="h-2 w-2 rounded-full bg-accent" />
            </span>
            Pool
          </span>
          <span className="rounded-full border border-line px-2.5 py-0.5 text-[10px] text-muted">Open pools</span>
        </div>

        {/* stepper */}
        <ol className="mt-5 grid grid-cols-4 gap-2">
          {STEPS.map((s, i) => (
            <li key={s} className="flex flex-col gap-1.5">
              <span
                className={cn(
                  "h-[3px] w-full transition-colors duration-500",
                  i === 0 && "bg-accent",
                  i === 1 && "bg-accent/30 group-hover:bg-accent",
                  i === 2 && "bg-line-strong delay-150 group-hover:bg-accent",
                  i === 3 && "bg-line-strong",
                )}
              />
              <span className="text-[10px] text-muted">
                {String(i + 1).padStart(2, "0")} {s}
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-5 grid flex-1 grid-cols-[1.25fr_1fr] gap-4">
          {/* pool card */}
          <div className="flex flex-col rounded-[8px] border border-line bg-ink-3/50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-[6px] bg-ink">
                <PixelGlyph rows={ICONS.cart} size={4} className="text-accent" />
              </div>
              <div className="flex-1 pt-1">
                <span className="skel block h-2.5 w-3/4 !opacity-40" />
                <span className="skel mt-2 block h-1.5 w-1/2" />
              </div>
            </div>

            <p className="mt-5 text-[10px] uppercase tracking-wider text-dim">Pool progress</p>
            <div className="mt-2 grid grid-cols-12 gap-[3px]">
              {Array.from({ length: 12 }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-4 transition-colors duration-300",
                    i < 5 ? "bg-accent" : i < 10 ? "bg-line-strong group-hover:bg-accent" : "bg-line-strong",
                  )}
                  style={{ transitionDelay: i >= 5 && i < 10 ? `${(i - 5) * 70}ms` : undefined }}
                />
              ))}
            </div>

            <div className="mt-auto flex items-center justify-between pt-4">
              <div className="flex -space-x-1">
                {Array.from({ length: 6 }, (_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#121211] bg-ink-3 text-muted transition-all duration-500",
                      i >= 3 && "w-0 scale-0 opacity-0 group-hover:w-7 group-hover:scale-100 group-hover:opacity-100",
                    )}
                    style={{ transitionDelay: i >= 3 ? `${(i - 3) * 90}ms` : undefined }}
                  >
                    <PixelGlyph rows={ICONS.person} size={2} />
                  </span>
                ))}
              </div>
              <span className="rounded-[4px] bg-paper px-3 py-1.5 text-[11px] font-medium text-ink transition-colors group-hover:bg-accent">
                Join pool
              </span>
            </div>
          </div>

          {/* demand + pickup */}
          <div className="flex flex-col gap-3">
            <div className="rounded-[8px] border border-line p-3">
              <p className="text-[10px] uppercase tracking-wider text-dim">Declare demand</p>
              <div className="mt-2.5 flex items-center justify-between rounded-[4px] border border-line px-2.5 py-1.5">
                <span className="skel h-1.5 w-16" />
                <span className="flex items-center gap-2 text-[11px] text-muted">
                  <span>−</span>
                  <span className="text-paper">1</span>
                  <span>+</span>
                </span>
              </div>
            </div>
            <div className="flex-1 rounded-[8px] border border-line p-3">
              <p className="text-[10px] uppercase tracking-wider text-dim">Pickup</p>
              <ul className="mt-2.5 space-y-2">
                {[0, 1, 2].map((i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-2.5 w-2.5 rounded-full border transition-colors duration-500",
                        i === 0 ? "border-accent group-hover:bg-accent" : "border-line-strong",
                      )}
                    />
                    <span className="skel h-1.5 flex-1" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ScaledStage>
  );
}
