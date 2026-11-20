import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { type Project, projectNumber, projects } from "@/data/projects";
import { cn } from "@/lib/utils";
import { ProjectVisual } from "../mocks/ProjectVisual";
import { Reveal } from "../ui/Reveal";
import { SectionHeader } from "../ui/SectionHeader";

export function TechTags({ tech, className }: { tech: string[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label="Technologies">
      {tech.map((t) => (
        <li key={t} className="border border-line px-2 py-1 font-mono text-[11px] leading-none text-muted">
          {t}
        </li>
      ))}
    </ul>
  );
}

function ExternalLinks({ project }: { project: Project }) {
  if (!project.links.length) return null;
  return (
    <>
      {project.links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noreferrer"
          data-cursor="open"
          className="relative z-10 inline-flex items-center gap-1.5 text-[13px] text-paper transition-colors hover:text-accent"
        >
          {l.label}
          <ArrowUpRight size={14} />
        </a>
      ))}
    </>
  );
}

function Featured({ project }: { project: Project }) {
  return (
    <article className="border-y border-line py-10 md:py-14" aria-labelledby={`p-${project.slug}`}>
      <Reveal>
        <div className="mb-10 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="font-pixel text-[11px] text-accent">{projectNumber(project.slug)}</span>
          <span className="border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
            Featured
          </span>
          <span className="label">{project.category}</span>
          <span className="label text-dim">· {project.context}</span>
        </div>
      </Reveal>

      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <Reveal>
            <h3
              id={`p-${project.slug}`}
              className="text-[clamp(2.6rem,4.2vw,3.6rem)] font-medium leading-[0.95] tracking-[-0.045em]"
            >
              {project.title}
            </h3>
            <p className="mt-5 text-[19px] leading-snug tracking-[-0.01em] text-paper/80">{project.tagline}</p>
            <p className="mt-6 text-[15px] leading-relaxed text-muted text-pretty">{project.summary}</p>
          </Reveal>

          <Reveal delay={0.08}>
            <ul className="mt-8 border-t border-line">
              {project.features.map((f, i) => (
                <li key={f} className="flex gap-3 border-b border-line py-2.5 text-[13.5px] leading-snug">
                  <span className="mt-[3px] font-pixel text-[8px] text-faint">{String(i + 1).padStart(2, "0")}</span>
                  {f}
                </li>
              ))}
            </ul>
            <TechTags tech={project.tech} className="mt-6" />
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <Link
                href={`/projects/${project.slug}`}
                className="group inline-flex h-11 items-center gap-3 bg-paper pl-5 pr-4 text-[14px] font-medium text-ink transition-colors hover:bg-accent"
              >
                Read the case study
                <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <ExternalLinks project={project} />
            </div>
          </Reveal>
        </div>

        <Reveal className="lg:col-span-8" delay={0.12}>
          <div className="relative border border-line bg-ink-2/70 p-3 sm:p-6 md:p-8">
            <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-60" />
            <div className="relative">
              <ProjectVisual project={project} interactive />
            </div>
          </div>
          <p className="mt-4 font-mono text-[11px] leading-relaxed text-dim">
            <span className="text-accent-dim">↳</span> Interactive recreation for illustration. Drag the divider, switch
            layouts and themes, flip to portrait or turn on privacy mode. Panel contents are placeholders.
          </p>
        </Reveal>
      </div>
    </article>
  );
}

function ProjectCard({ project, delay }: { project: Project; delay: number }) {
  return (
    <Reveal as="article" delay={delay} className="group relative" >
      <div data-cursor="view" className="relative">
        <div className="relative overflow-hidden border border-line bg-ink-2/70 p-4 transition-colors duration-500 group-hover:border-line-strong sm:p-6">
          <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-50" />
          <div className="relative transition-transform duration-700 ease-out-expo group-hover:scale-[1.015]">
            <ProjectVisual project={project} />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <span className="font-pixel text-[10px] text-accent">{projectNumber(project.slug)}</span>
          <span className="label">{project.category}</span>
        </div>
        <h3 className="mt-3 flex items-center gap-3 text-[clamp(1.8rem,3vw,2.4rem)] font-medium leading-none tracking-[-0.04em]">
          <Link
            href={`/projects/${project.slug}`}
            className="after:absolute after:inset-0 after:content-['']"
            aria-label={`${project.title} case study`}
          >
            {project.title}
          </Link>
          <ArrowRight
            size={22}
            className="-translate-x-2 text-accent opacity-0 transition-all duration-500 ease-out-expo group-hover:translate-x-0 group-hover:opacity-100"
            aria-hidden
          />
        </h3>
        <p className="mt-2 font-mono text-[11.5px] text-dim">{project.context}</p>
        <p className="mt-4 max-w-[34rem] text-[15px] leading-relaxed text-muted text-pretty">{project.summary}</p>
        <TechTags tech={project.tech} className="mt-5" />
        <div className="mt-6 flex items-center gap-6">
          <span className="inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors group-hover:text-paper">
            Case study <ArrowRight size={14} />
          </span>
          <ExternalLinks project={project} />
        </div>
      </div>
    </Reveal>
  );
}

export function Projects() {
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  return (
    <section id="work" aria-labelledby="work-title" className="container-x pt-28 md:pt-40">
      <SectionHeader
        index="02"
        label="Work"
        id="work-title"
        note={`${projects.length} projects`}
        title="Stuff I've built."
      />
      {featured.map((p) => (
        <Featured key={p.slug} project={p} />
      ))}
      <div className="mt-16 grid gap-16 md:mt-20 md:grid-cols-2 md:gap-x-10">
        {rest.map((p, i) => (
          <ProjectCard key={p.slug} project={p} delay={i * 0.08} />
        ))}
      </div>
    </section>
  );
}
