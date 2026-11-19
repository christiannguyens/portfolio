import { aboutParagraphs, currentlyExploring, facts } from "@/data/about";
import { leadership } from "@/data/experience";
import { parseYM } from "@/lib/utils";
import { Reveal } from "../ui/Reveal";
import { SectionHeader } from "../ui/SectionHeader";
import { Polaroids } from "./Polaroids";
import { Terminal } from "./Terminal";

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="container-x pt-28 md:pt-40">
      <SectionHeader
        index="01"
        label="About"
        id="about-title"
        note="Half engineering, half business"
        title="Learning how software gets built, and the business around it."
      />

      <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
        {/* copy */}
        <div className="space-y-6 lg:col-span-7">
          {aboutParagraphs.map((p, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <p
                className={
                  i === 0
                    ? "text-[clamp(1.2rem,1.8vw,1.45rem)] leading-[1.5] tracking-[-0.01em] text-paper text-pretty"
                    : "max-w-[40rem] text-[16px] leading-[1.75] text-muted text-pretty"
                }
              >
                {p}
              </p>
            </Reveal>
          ))}
        </div>

        {/* facts */}
        <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.1}>
          <dl className="border-t border-line">
            {facts.map((f) => (
              <div key={f.k} className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-line py-3.5">
                <dt className="label text-dim">{f.k}</dt>
                <dd className="text-[14px] leading-snug">{f.v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      {/* terminal + now + before washu */}
      <div className="mt-20 grid items-start gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <Terminal />
        </Reveal>

        <div className="flex flex-col gap-10 lg:col-span-5">
          <Reveal delay={0.08}>
            <div className="border border-line bg-ink-2/50 p-5">
              <div className="flex items-center justify-between">
                <h3 className="label text-paper">Currently exploring</h3>
                <span className="font-mono text-[11px] text-dim">now.txt</span>
              </div>
              <ul className="mt-5 space-y-4">
                {currentlyExploring.map((c, i) => (
                  <li key={c.label} className="flex gap-3">
                    <span className="mt-[3px] font-pixel text-[9px] text-accent">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <p className="text-[15px] leading-snug">{c.label}</p>
                      <p className="mt-0.5 font-mono text-[11.5px] text-dim">{c.note}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-5 font-mono text-[12px] text-dim">
                <span className="text-accent-dim">$</span> still going
                <span className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 animate-blink bg-accent" aria-hidden />
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.14}>
            <div>
              <h3 className="label">Before WashU</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-muted">
                In high school I co-founded two clubs and served as vice president of both.
              </p>
              <ul className="mt-5 border-t border-line">
                {leadership.map((l) => (
                  <li key={l.org} className="border-b border-line py-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="text-[15px] leading-snug">{l.org}</p>
                      <span className="shrink-0 font-mono text-[11px] text-dim">
                        {parseYM(l.start).y}–{String(parseYM(l.end).y).slice(2)}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-dim">{l.role}</p>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{l.points.join(" ")}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>

      {/* outside the keyboard */}
      <div className="mt-28">
        <Reveal>
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h3 className="text-[clamp(1.6rem,2.6vw,2.2rem)] font-medium tracking-[-0.03em]">
              Outside the keyboard
            </h3>
            <p className="font-mono text-[12px] text-dim">Friends, campus, and whatever else is going on.</p>
          </div>
        </Reveal>
        <Polaroids />
      </div>
    </section>
  );
}
