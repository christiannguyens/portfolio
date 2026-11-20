import { ArrowUpRight, Mail } from "lucide-react";
import { site } from "@/data/site";
import { CopyButton } from "../ui/CopyButton";
import { GitHubIcon, LinkedInIcon } from "../ui/Icons";
import { Reveal } from "../ui/Reveal";

type Row = {
  label: string;
  value: string;
  href: string;
  icon: React.ReactNode;
  copy?: boolean;
  external?: boolean;
};

const rows: Row[] = [
  ...site.emails.map((e) => ({
    label: `Email · ${e.label}`,
    value: e.address,
    href: `mailto:${e.address}`,
    icon: <Mail size={16} strokeWidth={1.6} />,
    copy: true,
  })),
  {
    label: "GitHub",
    value: site.socials.github.handle,
    href: site.socials.github.href,
    icon: <GitHubIcon size={16} />,
    external: true,
  },
  {
    label: "LinkedIn",
    value: site.socials.linkedin.handle,
    href: site.socials.linkedin.href,
    icon: <LinkedInIcon size={16} />,
    external: true,
  },
];

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="container-x pb-24 pt-28 md:pb-32 md:pt-40">
      <Reveal>
        <div className="flex items-center gap-4 border-t border-line pt-5">
          <span className="font-pixel text-[11px] text-accent">05</span>
          <span className="label">Contact</span>
          <span className="h-px flex-1 bg-line" aria-hidden />
        </div>
      </Reveal>

      <Reveal>
        <h2
          id="contact-title"
          className="mt-12 max-w-5xl text-[clamp(2.6rem,6.4vw,5.6rem)] font-medium leading-[0.96] tracking-[-0.05em] text-balance"
        >
          Say hi.
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <Reveal delay={0.08}>
            <p className="max-w-[28rem] text-[16px] leading-relaxed text-muted text-pretty">
              If you want to work on something together, have a question, or just want to talk, email me or
              message me on LinkedIn.
            </p>
          </Reveal>
        </div>

        <Reveal className="lg:col-span-7" delay={0.12}>
          <ul className="border-t border-line">
            {rows.map((r) => (
              <li key={r.href} className="relative border-b border-line">
                <a
                  href={r.href}
                  {...(r.external ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="group flex items-center gap-4 py-5 pr-24 transition-colors sm:pr-28"
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 origin-left scale-x-0 bg-accent/[0.06] transition-transform duration-500 ease-out-expo group-hover:scale-x-100"
                  />
                  <span className="relative text-dim transition-colors group-hover:text-accent">{r.icon}</span>
                  <span className="relative min-w-0">
                    <span className="label block text-dim">{r.label}</span>
                    <span className="mt-1 block truncate text-[clamp(1rem,1.8vw,1.25rem)] tracking-[-0.01em] transition-colors group-hover:text-accent">
                      {r.value}
                    </span>
                  </span>
                </a>
                <span className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-3">
                  {r.copy && <CopyButton value={r.value} />}
                  <ArrowUpRight
                    size={18}
                    aria-hidden
                    className="pointer-events-none text-dim transition-all duration-300 [li:hover_&]:-translate-y-0.5 [li:hover_&]:translate-x-0.5 [li:hover_&]:text-accent"
                  />
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
