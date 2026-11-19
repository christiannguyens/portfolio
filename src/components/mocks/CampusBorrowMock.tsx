"use client";

import { Check, MapPin, Search, X } from "lucide-react";
import { ICONS, type IconName } from "@/lib/pixel";
import { PixelGlyph } from "../ui/PixelGlyph";
import { ScaledStage } from "./ScaledStage";

/** Illustrative recreation: borrower browse view → (hover) lender dashboard. */

const ITEMS: { icon: IconName; name: string }[] = [
  { icon: "camera", name: "Camera" },
  { icon: "headphones", name: "Headphones" },
  { icon: "lamp", name: "Desk lamp" },
  { icon: "tent", name: "Tent" },
  { icon: "book", name: "Textbook" },
  { icon: "box", name: "Storage bin" },
];
const CHIPS = ["All", "Electronics", "Outdoor", "Books", "Dorm"];

function Chrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[8px] border border-line-strong bg-[#121211] font-sans text-paper">
      <div className="flex h-8 items-center gap-3 border-b border-line px-3">
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-faint" />
          <span className="h-2 w-2 rounded-full bg-faint" />
          <span className="h-2 w-2 rounded-full bg-faint" />
        </div>
        <div className="flex-1 rounded-[4px] bg-ink px-3 py-1 text-center font-mono text-[10px] text-dim">
          campusborrowwashu.vercel.app
        </div>
      </div>
      <div className="relative flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

export function CampusBorrowMock() {
  return (
    <ScaledStage width={640} height={420}>
      <Chrome>
        {/* borrower view */}
        <div className="absolute inset-0 p-4 transition-all duration-700 ease-out-expo group-hover:-translate-x-6 group-hover:opacity-0">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold tracking-tight">Campus Borrow</span>
            <div className="flex rounded-[4px] border border-line p-0.5 text-[10px]">
              <span className="rounded-[3px] bg-paper px-2 py-0.5 text-ink">Borrow</span>
              <span className="px-2 py-0.5 text-muted">Lend</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-[5px] border border-line bg-ink px-3 py-2 text-[11px] text-dim">
            <Search size={12} /> What do you need to borrow?
          </div>
          <div className="mt-3 flex gap-1.5">
            {CHIPS.map((c, i) => (
              <span
                key={c}
                className={
                  i === 0
                    ? "rounded-full bg-accent px-2.5 py-0.5 text-[10px] text-ink"
                    : "rounded-full border border-line px-2.5 py-0.5 text-[10px] text-muted"
                }
              >
                {c}
              </span>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            {ITEMS.map((it) => (
              <div key={it.name} className="rounded-[6px] border border-line bg-ink-3/60 p-2.5">
                <div className="flex h-16 items-center justify-center rounded-[4px] bg-ink">
                  <PixelGlyph rows={ICONS[it.icon]} size={4} className="text-accent" />
                </div>
                <p className="mt-2 text-[11px] font-medium">{it.name}</p>
                <p className="mt-1 flex items-center gap-1 text-[9px] text-dim">
                  <MapPin size={9} />
                  <span className="skel inline-block h-1 w-12" />
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* lender dashboard (hover) */}
        <div className="absolute inset-0 translate-x-6 p-4 opacity-0 transition-all duration-700 ease-out-expo group-hover:translate-x-0 group-hover:opacity-100">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold tracking-tight">Lender dashboard</span>
            <div className="flex rounded-[4px] border border-line p-0.5 text-[10px]">
              <span className="px-2 py-0.5 text-muted">Borrow</span>
              <span className="rounded-[3px] bg-paper px-2 py-0.5 text-ink">Lend</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {["Listings", "Requests", "Lent out"].map((k) => (
              <div key={k} className="rounded-[6px] border border-line p-3">
                <p className="text-[9px] uppercase tracking-wider text-dim">{k}</p>
                <span className="skel mt-2 block h-3 w-8 !opacity-30" />
              </div>
            ))}
          </div>
          <p className="mt-4 text-[10px] uppercase tracking-wider text-dim">Borrowing requests</p>
          <ul className="mt-2 space-y-2">
            {ITEMS.slice(0, 3).map((it) => (
              <li key={it.name} className="flex items-center gap-3 rounded-[6px] border border-line px-3 py-2">
                <PixelGlyph rows={ICONS[it.icon]} size={2} className="text-accent" />
                <div className="flex-1">
                  <p className="text-[11px]">{it.name}</p>
                  <p className="mt-1 flex items-center gap-1 text-[9px] text-dim">
                    <MapPin size={9} /> <span className="skel inline-block h-1 w-14" />
                  </p>
                </div>
                <span className="flex h-6 w-6 items-center justify-center rounded-[4px] border border-line text-muted">
                  <X size={11} />
                </span>
                <span className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-accent text-ink">
                  <Check size={11} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Chrome>
    </ScaledStage>
  );
}
