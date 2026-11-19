import { site } from "@/data/site";
import { ICONS } from "@/lib/pixel";
import { PixelGlyph } from "../ui/PixelGlyph";
import { Reveal } from "../ui/Reveal";

const items = [
  { k: "School", v: site.education.school },
  { k: "Program", v: site.education.program },
  { k: "Class", v: `Class of ${site.education.classOf}` },
  { k: "Recognition", v: site.education.honors[0], star: true },
];

export function InfoStrip() {
  return (
    <div className="container-x">
      <Reveal>
        <dl className="grid grid-cols-2 border-y border-line md:grid-cols-4">
          {items.map((it, i) => (
            <div
              key={it.k}
              className={[
                "flex flex-col justify-between gap-6 py-5 pr-4",
                i % 2 === 1 ? "border-l border-line pl-4 md:pl-5" : "md:pl-5",
                i >= 2 ? "border-t border-line md:border-t-0" : "",
                i === 2 ? "md:border-l" : "",
                i === 0 ? "md:pl-0" : "",
              ].join(" ")}
            >
              <dt className="label flex items-center gap-2 text-dim">
                <span className="font-pixel text-[8px] text-faint">{String(i + 1).padStart(2, "0")}</span>
                {it.k}
              </dt>
              <dd className="flex items-center gap-2 text-[15px] leading-snug tracking-[-0.01em]">
                {it.star && <PixelGlyph rows={ICONS.star} size={2} className="shrink-0 text-accent" />}
                {it.v}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </div>
  );
}
