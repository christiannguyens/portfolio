import { ArrowUp } from "lucide-react";
import { site } from "@/data/site";
import { MONOGRAM } from "@/lib/pixel";
import { LocalTime } from "../ui/LocalTime";
import { PixelGlyph } from "../ui/PixelGlyph";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-line">
      <div className="container-x py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="flex items-end gap-4">
            <PixelGlyph rows={MONOGRAM} size={4} className="text-accent" />
            <div>
              <p className="font-serif text-3xl italic leading-none tracking-[-0.01em]">Christian</p>
              <p className="label mt-2 text-dim">{site.cities.join(" / ")}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-2 font-mono text-[11px] text-dim sm:flex sm:items-center sm:gap-8">
            <span>{site.coordinates}</span>
            <LocalTime className="col-span-2 sm:col-span-1" />
            <span>© {new Date().getFullYear()} {site.name}</span>
            <a href="#main" className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-accent">
              Back to top <ArrowUp size={12} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
