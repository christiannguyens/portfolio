"use client";

import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { projects } from "@/data/projects";
import { stack } from "@/data/stack";
import { cn, EASE_OUT } from "@/lib/utils";
import { Reveal } from "../ui/Reveal";
import { SectionHeader } from "../ui/SectionHeader";

const flat = stack.flatMap((g) => g.items.map((item) => ({ ...item, category: g.category })));

export function Stack() {
  const [selected, setSelected] = useState(flat[0].name);
  const current = flat.find((f) => f.name === selected)!;
  const number = flat.findIndex((f) => f.name === selected) + 1;
  const used = (current.usedIn ?? []).map((s) => projects.find((p) => p.slug === s)).filter(Boolean);

  let n = 0;
  return (
    <section id="stack" aria-labelledby="stack-title" className="container-x pt-28 md:pt-40">
      <SectionHeader
        index="04"
        label="Stack"
        id="stack-title"
        note="Used, not mastered"
        title="What I build with."
      />

      <div className="grid gap-10 lg:grid-cols-12">
        {/* readout */}
        <div className="lg:order-2 lg:col-span-4">
          <div className="sticky top-28 z-10 border border-line bg-ink-2/95 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="label text-dim">Readout</span>
              <span className="font-mono text-[11px] text-dim">
                {String(number).padStart(2, "0")}/{String(flat.length).padStart(2, "0")}
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={current.name}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
                aria-live="polite"
              >
                <div className="mt-5 flex items-end gap-4">
                  <span className="font-pixel text-[52px] leading-[0.8] text-accent">{current.symbol}</span>
                  <div className="pb-0.5">
                    <p className="text-[20px] font-medium leading-none tracking-[-0.02em]">{current.name}</p>
                    <p className="mt-1.5 font-mono text-[11px] text-dim">{current.category}</p>
                  </div>
                </div>
                <p className="mt-5 text-[14px] leading-relaxed text-muted">{current.description}</p>
                <div className="mt-5 border-t border-line pt-4">
                  <p className="label text-dim">Used in</p>
                  {used.length ? (
                    <ul className="mt-2 space-y-1">
                      {used.map((p) => (
                        <li key={p!.slug}>
                          <Link
                            href={`/projects/${p!.slug}`}
                            className="group inline-flex items-center gap-2 text-[14px] text-paper hover:text-accent"
                          >
                            {p!.title}
                            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 font-mono text-[12px] text-dim">No project write-up yet.</p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* table */}
        <div className="space-y-10 lg:order-1 lg:col-span-8">
          {stack.map((group, gi) => (
            <Reveal key={group.category} delay={gi * 0.05}>
              <div>
                <h3 className="label mb-3 flex items-center gap-3">
                  {group.category}
                  <span className="h-px flex-1 bg-line" aria-hidden />
                </h3>
                <ul className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {group.items.map((item) => {
                    n++;
                    const isSel = selected === item.name;
                    return (
                      <li key={item.name}>
                        <button
                          type="button"
                          aria-pressed={isSel}
                          onPointerEnter={(e) => e.pointerType === "mouse" && setSelected(item.name)}
                          onFocus={() => setSelected(item.name)}
                          onClick={() => setSelected(item.name)}
                          className={cn(
                            "group relative flex aspect-[5/4] w-full flex-col justify-between border p-2 text-left transition-all duration-300 sm:p-3",
                            isSel
                              ? "border-accent/60 bg-accent/[0.07]"
                              : "border-line bg-ink-2/40 hover:border-line-strong",
                          )}
                        >
                          <span className="flex items-start justify-between font-mono text-[10px] text-dim">
                            {String(n).padStart(2, "0")}
                            {item.usedIn?.length ? (
                              <span
                                className={cn("h-1.5 w-1.5", isSel ? "bg-accent" : "bg-accent-dim")}
                                aria-label="used in a project"
                              />
                            ) : null}
                          </span>
                          <span
                            className={cn(
                              "font-pixel text-[clamp(1.4rem,2.8vw,2.1rem)] leading-none transition-colors",
                              isSel ? "text-accent" : "text-paper",
                            )}
                          >
                            {item.symbol}
                          </span>
                          <span className="truncate text-[10px] text-muted sm:text-[12px]">{item.name}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Reveal>
          ))}
          <p className="flex items-center gap-2 font-mono text-[11px] text-dim">
            <span className="h-1.5 w-1.5 bg-accent-dim" aria-hidden /> = used in a project on this site
          </p>
        </div>
      </div>
    </section>
  );
}
