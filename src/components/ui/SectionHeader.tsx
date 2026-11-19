import { Reveal } from "./Reveal";

type Props = {
  index: string;
  label: string;
  title: React.ReactNode;
  note?: React.ReactNode;
  id?: string;
};

/** Numbered editorial section header: "01 — About" + large title. */
export function SectionHeader({ index, label, title, note, id }: Props) {
  return (
    <header className="mb-14 md:mb-20">
      <Reveal>
        <div className="flex items-center gap-4 border-t border-line pt-5">
          <span className="font-pixel text-[11px] text-accent">{index}</span>
          <span className="label">{label}</span>
          <span className="h-px flex-1 bg-line" aria-hidden />
          {note && <span className="label hidden text-dim md:block">{note}</span>}
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <h2
          id={id}
          className="mt-8 max-w-4xl text-[clamp(2rem,4.6vw,3.75rem)] font-medium leading-[1.02] tracking-[-0.035em] text-balance"
        >
          {title}
        </h2>
      </Reveal>
    </header>
  );
}
