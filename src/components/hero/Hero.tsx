"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { site } from "@/data/site";
import { EASE_OUT } from "@/lib/utils";
import { PixelPortrait } from "./PixelPortrait";

type Seg = { t: string; serif?: boolean };
const HEADLINE: Seg[] = [{ t: "Studying business and computer science, and building software along the way." }];

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: EASE_OUT },
});

export function Hero({ children }: { children?: React.ReactNode }) {
  let wordIndex = 0;
  return (
    <section aria-label="Introduction" className="relative flex min-h-[100svh] flex-col">
      {/* faint dot grid, fading out */}
      <div
        aria-hidden
        className="dot-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_70%_60%_at_70%_40%,black,transparent)]"
      />
      <div className="container-x grid flex-1 items-center gap-14 pb-14 pt-36 lg:grid-cols-12 lg:gap-10 lg:pb-16 lg:pt-36">
        <div className="lg:col-span-7">
          <motion.div {...rise(0.05)} className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-2.5 border border-line bg-ink-2/60 px-3 py-1.5 font-mono text-[11px] text-paper">
              <span className="relative h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent" aria-hidden />
              {site.status}
            </span>
            <span className="label text-dim">{site.cities.join(" · ")}</span>
          </motion.div>

          <motion.p {...rise(0.15)} className="mt-9 text-[clamp(1.1rem,1.5vw,1.3rem)] leading-none tracking-[-0.01em] text-muted">
            Hey, I&apos;m Christian.
          </motion.p>

          <h1 className="mt-5 text-[clamp(2.3rem,4.4vw,4.3rem)] font-medium leading-[0.98] tracking-[-0.045em] text-balance">
            <span className="sr-only">Christian Nguyens: </span>
            {HEADLINE.map((seg, si) =>
              seg.t.split(" ").map((word, wi) => {
                const i = wordIndex++;
                return (
                  <span key={`${si}-${wi}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                    <motion.span
                      className={
                        seg.serif
                          ? "inline-block pr-[0.06em] font-serif font-normal italic tracking-[-0.02em] text-accent"
                          : "inline-block"
                      }
                      initial={{ y: "105%" }}
                      animate={{ y: 0 }}
                      transition={{ duration: 1, delay: 0.25 + i * 0.035, ease: EASE_OUT }}
                    >
                      {word}
                    </motion.span>
                    {" "}
                  </span>
                );
              }),
            )}
          </h1>

          <motion.p {...rise(0.75)} className="mt-7 max-w-[34rem] text-[17px] leading-relaxed text-muted text-pretty">
            Most of what I know I picked up by building things: a macOS dashboard, a campus lending
            marketplace, and a group-buying app from a hackathon.
          </motion.p>

          <motion.div {...rise(0.9)} className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#work"
              className="group inline-flex h-12 items-center gap-3 bg-paper pl-5 pr-4 text-[14px] font-medium text-ink transition-colors hover:bg-accent"
            >
              Explore my work
              <ArrowDownRight size={16} className="transition-transform duration-300 group-hover:rotate-[-45deg]" />
            </a>
            <a
              href="#contact"
              className="group inline-flex h-12 items-center gap-3 border border-line-strong px-5 text-[14px] text-paper transition-colors hover:border-paper"
            >
              Get in touch
              <ArrowUpRight
                size={16}
                className="text-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-paper"
              />
            </a>
          </motion.div>
        </div>

        <motion.div
          className="mx-auto w-full max-w-[420px] lg:col-span-5 lg:max-w-none lg:pl-6"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: EASE_OUT }}
        >
          <PixelPortrait src={site.portrait.src} alt={site.portrait.alt} palette={site.portrait.palette} />
        </motion.div>
      </div>
      {children}
    </section>
  );
}
