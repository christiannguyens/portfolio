import { Camera } from "lucide-react";
import Image from "next/image";
import { interests, interestTags } from "@/data/about";
import { isDev } from "@/data/site";
import { cn } from "@/lib/utils";
import { Reveal } from "../ui/Reveal";

const TILTS = ["-rotate-[2.5deg]", "rotate-[1.5deg]", "-rotate-[1deg]", "rotate-[2.5deg]", "-rotate-[1.5deg]"];

export function Polaroids() {
  return (
    <div>
      <ul className="grid grid-cols-2 gap-x-5 gap-y-8 sm:gap-x-7 md:grid-cols-4">
        {interests.map((item, i) => (
          <Reveal as="li" key={(item.image ?? item.title ?? "") + i} delay={i * 0.07}>
            <figure
              className={cn(
                "group bg-[#e9e6de] p-2.5 pb-0 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.8)] transition-transform duration-500 ease-out-expo hover:-translate-y-1.5 hover:rotate-0",
                TILTS[i % TILTS.length],
              )}
            >
              <div className="relative aspect-square overflow-hidden bg-ink-3">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.alt ?? item.caption ?? item.title ?? ""}
                    fill
                    sizes="(min-width: 768px) 22vw, 45vw"
                    className="object-cover grayscale-[15%] transition-all duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
                    style={{ objectPosition: item.position ?? "50% 50%" }}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-faint">
                    <div
                      aria-hidden
                      className="absolute inset-0 opacity-60"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(135deg, rgba(245,171,237,0.05) 0 8px, transparent 8px 16px)",
                      }}
                    />
                    <Camera size={18} strokeWidth={1.5} className="relative" />
                    <span className="relative font-mono text-[10px] uppercase tracking-[0.14em]">coming soon</span>
                    {isDev && (
                      <span className="absolute inset-x-2 bottom-2 text-center font-mono text-[9px] leading-tight text-accent/70">
                        add image in data/about.ts
                      </span>
                    )}
                  </div>
                )}
              </div>
              <figcaption className="flex min-h-12 items-center justify-between px-1 py-3 text-ink">
                <span className="font-serif text-[17px] italic leading-tight">
                  {item.title ?? ""}
                </span>
                <span className="font-mono text-[9px] text-ink/50">{String(i + 1).padStart(2, "0")}</span>
              </figcaption>
            </figure>
            {item.caption && <p className="mt-4 text-[13px] leading-snug text-muted">{item.caption}</p>}
          </Reveal>
        ))}
      </ul>

      {interestTags.length > 0 && (
        <ul className="mt-10 flex flex-wrap gap-2">
          {interestTags.map((t) => (
            <li key={t} className="border border-line px-3 py-1.5 font-mono text-[11px] text-muted">
              {t}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
