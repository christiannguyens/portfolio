import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectVisual } from "@/components/mocks/ProjectVisual";
import { TechTags } from "@/components/projects/Projects";
import { Reveal } from "@/components/ui/Reveal";
import { getProject, projectNumber, projects } from "@/data/projects";
import { isDev } from "@/data/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title: `${project.title}, by Christian Nguyens`, description: project.summary },
  };
}

function Block({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <Reveal>
      <section id={title.toLowerCase().replace(/\s+/g, "-")} className="grid gap-4 border-t border-line py-10 md:grid-cols-12 md:gap-10">
        <h2 className="flex items-baseline gap-3 md:col-span-4">
          <span className="font-pixel text-[9px] text-accent">{n}</span>
          <span className="text-[20px] font-medium tracking-[-0.02em]">{title}</span>
        </h2>
        <div className="md:col-span-8">{children}</div>
      </section>
    </Reveal>
  );
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const idx = projects.findIndex((p) => p.slug === slug);
  const next = projects[(idx + 1) % projects.length];
  const showGallery = project.gallery.length > 0 || isDev;

  return (
    <article className="container-x pb-24 pt-36 md:pt-44">
      <Reveal>
        <nav className="flex items-center justify-between gap-4" aria-label="Breadcrumb">
          <Link href="/#work" className="group inline-flex items-center gap-2 font-mono text-[12px] text-muted hover:text-paper">
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
            All work
          </Link>
          <span className="font-mono text-[12px] text-dim">
            Project {projectNumber(slug)} / {String(projects.length).padStart(2, "0")}
          </span>
        </nav>
      </Reveal>

      <header className="mt-14 md:mt-20">
        <Reveal>
          <p className="label">{project.category}</p>
          <h1 className="mt-5 text-[clamp(3rem,10vw,8rem)] font-medium leading-[0.9] tracking-[-0.055em]">
            {project.title}
          </h1>
          <p className="mt-6 max-w-3xl text-[clamp(1.2rem,2vw,1.6rem)] leading-snug tracking-[-0.015em] text-muted">
            {project.tagline}
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <dl className="mt-14 grid grid-cols-2 border-y border-line md:grid-cols-4">
            {[
              { k: "Role", v: project.role },
              { k: "Context", v: project.context },
              { k: "Stack", v: project.tech.join(", ") },
            ].map((m, i) => (
              <div key={m.k} className={`py-5 pr-4 ${i % 2 ? "border-l border-line pl-4" : ""} ${i === 2 ? "border-t border-line md:border-l md:border-t-0 md:pl-4" : ""}`}>
                <dt className="label text-dim">{m.k}</dt>
                <dd className="mt-2 text-[14px] leading-snug">{m.v}</dd>
              </div>
            ))}
            <div className="border-l border-t border-line py-5 pl-4 md:border-t-0">
              <dt className="label text-dim">Links</dt>
              <dd className="mt-2 flex flex-col gap-1 text-[14px]">
                {project.links.length ? (
                  project.links.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">
                      {l.label} <ArrowUpRight size={13} />
                    </a>
                  ))
                ) : (
                  <span className="text-dim">Not public yet</span>
                )}
              </dd>
            </div>
          </dl>
        </Reveal>
      </header>

      <Reveal delay={0.12}>
        <div className="relative mt-14 border border-line bg-ink-2/70 p-3 sm:p-6 md:p-10">
          <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-60" />
          <div className={`group relative mx-auto ${project.mock === "portabledash" || project.cover ? "max-w-5xl" : "max-w-3xl"}`}>
            <ProjectVisual project={project} interactive priority />
          </div>
        </div>
        {!project.cover && (
          <p className="mt-4 font-mono text-[11px] text-dim">
            <span className="text-accent-dim">↳</span>{" "}
            {project.mock === "portabledash"
              ? "Interactive recreation for illustration. Try the controls. Panel contents are placeholders."
              : "Illustrative recreation, not a screenshot. Hover to see a second view."}
          </p>
        )}
      </Reveal>

      <div className="mt-20">
        <Block n="01" title="Overview">
          <p className="text-[clamp(1.1rem,1.6vw,1.3rem)] leading-[1.6] text-paper text-pretty">{project.overview}</p>
        </Block>
        <Block n="02" title="Problem">
          <p className="max-w-[42rem] text-[16px] leading-[1.75] text-muted text-pretty">{project.problem}</p>
        </Block>
        <Block n="03" title="Solution">
          <p className="max-w-[42rem] text-[16px] leading-[1.75] text-muted text-pretty">{project.solution}</p>
          <ul className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2">
            {project.features.map((f, i) => (
              <li key={f} className="flex gap-3 bg-ink p-4 text-[14px] leading-snug">
                <span className="mt-[3px] font-pixel text-[8px] text-accent">{String(i + 1).padStart(2, "0")}</span>
                {f}
              </li>
            ))}
          </ul>
        </Block>
        <Block n="04" title="My contributions">
          <ul className="max-w-[42rem] space-y-3">
            {project.contributions.map((c) => (
              <li key={c} className="flex gap-3 text-[16px] leading-relaxed text-muted">
                <span aria-hidden className="mt-[0.65rem] h-1 w-1 shrink-0 bg-accent" />
                {c}
              </li>
            ))}
          </ul>
        </Block>
        <Block n="05" title="Technologies">
          <TechTags tech={project.tech} />
        </Block>

        {showGallery && (
          <Block n="06" title="Screenshots">
            {project.gallery.length ? (
              <div className="grid gap-6">
                {project.gallery.map((img) => (
                  <figure key={img.src}>
                    <Image
                      src={img.src}
                      alt={img.alt}
                      width={img.width}
                      height={img.height}
                      sizes="(min-width: 1024px) 760px, 100vw"
                      className="h-auto w-full border border-line"
                    />
                    {img.caption && <figcaption className="mt-3 font-mono text-[11px] text-dim">{img.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="flex aspect-[16/10] items-center justify-center border border-dashed border-line-strong p-4 text-center font-mono text-[11px] text-dim">
                    screenshot slot {i}: add images to `gallery` in src/data/projects.ts (hidden in production while empty)
                  </div>
                ))}
              </div>
            )}
          </Block>
        )}
      </div>

      <Reveal>
        <Link
          href={`/projects/${next.slug}`}
          data-cursor="next"
          className="group mt-16 flex items-end justify-between gap-6 border-y border-line py-10"
        >
          <div>
            <p className="label">Next project</p>
            <p className="mt-3 text-[clamp(2rem,5vw,3.75rem)] font-medium leading-none tracking-[-0.045em] transition-colors group-hover:text-accent">
              {next.title}
            </p>
            <p className="mt-3 font-mono text-[12px] text-dim">{next.category}</p>
          </div>
          <ArrowRight size={36} strokeWidth={1.25} className="mb-2 shrink-0 text-muted transition-all duration-500 group-hover:translate-x-2 group-hover:text-accent" />
        </Link>
      </Reveal>
    </article>
  );
}
