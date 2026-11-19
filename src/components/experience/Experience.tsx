"use client";

import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { experience } from "@/data/experience";
import { cn, duration, EASE_OUT, formatYM, monthIndex, parseYM } from "@/lib/utils";
import { Reveal } from "../ui/Reveal";
import { SectionHeader } from "../ui/SectionHeader";

export function Experience() {
  const [active, setActive] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const d = new Date();
    setNow(d.getFullYear() * 12 + d.getMonth() + d.getDate() / 31);
  }, []);

  const items = useMemo(
    () => [...experience].sort((a, b) => monthIndex(b.start) - monthIndex(a.start)),
    [],
  );

  // ruler spans whole years covering all entries
  const startYear = Math.min(...experience.map((e) => parseYM(e.start).y));
  const endYear = Math.max(...experience.map((e) => parseYM(e.end).y));
  const r0 = startYear * 12;
  const r1 = (endYear + 1) * 12;
  const span = r1 - r0;
  const pct = (m: number) => ((m - r0) / span) * 100;
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  return (
    <section id="experience" aria-labelledby="experience-title" className="container-x pt-28 md:pt-40">
      <SectionHeader
        index="03"
        label="Experience"
        id="experience-title"
        note={`${startYear}–${endYear}`}
        title="Internships, tutoring, and the work in between."
      />

      {/* ruler */}
      <Reveal>
        <div className="mb-16 select-none" aria-hidden>
          <div className="relative flex border-b border-line pb-2">
            {years.map((y) => (
              <span key={y} className="label flex-1 text-dim">
                {y}
              </span>
            ))}
          </div>
          <div className="relative h-3">
            {Array.from({ length: span + 1 }, (_, i) => (
              <span
                key={i}
                className={cn("absolute top-0 w-px bg-line-strong", i % 12 === 0 ? "h-3" : "h-1.5")}
                style={{ left: `${(i / span) * 100}%` }}
              />
            ))}
          </div>
          <div className="relative mt-3 space-y-2">
            {items.map((e) => {
              const left = pct(monthIndex(e.start));
              const width = pct(monthIndex(e.end) + 1) - left;
              const isActive = active === e.id;
              const inside = width > 30;
              return (
                <div
                  key={e.id}
                  className="relative h-6"
                  onPointerEnter={() => setActive(e.id)}
                  onPointerLeave={() => setActive(null)}
                >
                  <motion.div
                    className={cn(
                      "absolute top-0 flex h-full items-center overflow-hidden border px-2 font-mono text-[10px] transition-colors duration-300",
                      isActive ? "border-accent bg-accent text-ink" : "border-accent/40 bg-accent/10 text-accent",
                    )}
                    style={{ left: `${left}%` }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${width}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: EASE_OUT, delay: 0.2 }}
                  >
                    {inside && <span className="whitespace-nowrap">{e.org}</span>}
                  </motion.div>
                  {!inside && (
                    <span
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[10px] transition-colors",
                        isActive ? "text-accent" : "text-muted",
                      )}
                      style={
                        left > 50
                          ? { right: `${100 - left}%`, paddingRight: 8 }
                          : { left: `${left + width}%`, paddingLeft: 8 }
                      }
                    >
                      {e.org}
                    </span>
                  )}
                </div>
              );
            })}
            {now !== null && now >= r0 && now <= r1 && (
              <div className="pointer-events-none absolute -bottom-2 -top-[22px] w-px bg-paper/50" style={{ left: `${pct(now)}%` }}>
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-wider text-paper">
                  now
                </span>
              </div>
            )}
          </div>
        </div>
      </Reveal>

      {/* entries */}
      <ol className="relative">
        {items.map((e, i) => {
          const isActive = active === e.id;
          return (
            <Reveal as="li" key={e.id} delay={i * 0.06}>
              <div
                onPointerEnter={() => setActive(e.id)}
                onPointerLeave={() => setActive(null)}
                className="group grid gap-4 border-t border-line py-10 md:grid-cols-12 md:gap-10"
              >
                <div className="md:col-span-3">
                  <p className="font-mono text-[12px] text-paper">
                    {formatYM(e.start)} — {formatYM(e.end)}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-dim">{duration(e.start, e.end)}</p>
                </div>

                <div className="relative md:col-span-9 md:pl-10">
                  <span
                    aria-hidden
                    className="absolute bottom-0 left-0 top-0 hidden w-px bg-line md:block"
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -left-[4px] top-[0.55rem] hidden h-[9px] w-[9px] border transition-colors duration-300 md:block",
                      isActive ? "border-accent bg-accent" : "border-line-strong bg-ink",
                    )}
                  />
                  <h3 className="text-[clamp(1.5rem,2.4vw,2rem)] font-medium leading-tight tracking-[-0.03em]">
                    {e.role}
                  </h3>
                  <p className="mt-1.5 text-[15px] text-muted">
                    <span className={cn("transition-colors", isActive ? "text-accent" : "text-paper")}>{e.org}</span>
                    {e.detail && <span> · {e.detail}</span>}
                    {e.location && <span className="text-dim"> · {e.location}</span>}
                  </p>
                  <ul className="mt-5 max-w-[44rem] space-y-2.5">
                    {e.points.map((p) => (
                      <li key={p} className="flex gap-3 text-[15px] leading-relaxed text-muted">
                        <span aria-hidden className="mt-[0.6rem] h-1 w-1 shrink-0 bg-accent" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <ul className="mt-5 flex flex-wrap gap-1.5">
                    {e.tags.map((t) => (
                      <li key={t} className="font-mono text-[11px] text-dim">
                        #{t.toLowerCase().replace(/\s+/g, "-")}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          );
        })}
      </ol>
    </section>
  );
}
