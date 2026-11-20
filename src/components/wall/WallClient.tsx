"use client";

import { Camera, RotateCcw, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { foundingPolaroids } from "@/data/wall";
import { ICONS } from "@/lib/pixel";
import { cn, EASE_OUT } from "@/lib/utils";
import { PixelGlyph } from "../ui/PixelGlyph";
import { Booth, type Submitted, type WallFont } from "./Booth";
import { CARD } from "./compose";

type Approved = { id: string; url: string; createdAt: string };
type Mine = { id: string; key: string; url: string; createdAt: string; status: "pending" | "approved"; local?: boolean };
type Item =
  | { kind: "image"; id: string; src: string; pending?: boolean; mineKey?: string }
  | { kind: "founding"; id: string; src: string; alt: string; position: string; note: string };

/** Stable pseudo-random number in [0,1) from a string. */
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000;
}

function FoundingCard({ item, handFont }: { item: Extract<Item, { kind: "founding" }>; handFont: string }) {
  return (
    <div className="relative w-full bg-[#f4f1ea] [container-type:inline-size]" style={{ aspectRatio: `${CARD.w}/${CARD.h}` }}>
      <div
        className="absolute overflow-hidden bg-ink-3"
        style={{ left: `${(CARD.pad / CARD.w) * 100}%`, top: `${(CARD.pad / CARD.h) * 100}%`, width: `${(CARD.photo / CARD.w) * 100}%`, aspectRatio: "1" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.src} alt={item.alt} loading="lazy" className="h-full w-full object-cover" style={{ objectPosition: item.position }} />
      </div>
      <div
        className="absolute inset-x-0 flex items-center justify-center text-[#1b1b19]"
        style={{ top: `${((CARD.pad + CARD.photo) / CARD.h) * 100}%`, bottom: 0, fontFamily: handFont, fontSize: "10cqw" }}
      >
        {item.note}
      </div>
    </div>
  );
}

function Card({ item, handFont, large }: { item: Item; handFont: string; large?: boolean }) {
  return item.kind === "founding" ? (
    <FoundingCard item={item} handFont={handFont} />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.src}
      alt="A visitor's signed polaroid"
      loading={large ? "eager" : "lazy"}
      className="block w-full"
      style={{ aspectRatio: `${CARD.w}/${CARD.h}` }}
    />
  );
}

export function WallClient({ fonts, handFont }: { fonts: WallFont[]; handFont: string }) {
  const [approved, setApproved] = useState<Approved[]>([]);
  const [mine, setMine] = useState<Mine[]>([]);
  const [max, setMax] = useState(1);
  const [removing, setRemoving] = useState<string | null>(null);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [booth, setBooth] = useState(false);
  const [open, setOpen] = useState<Item | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const load = useCallback(async () => {
    try {
      const [pub, own] = await Promise.all([
        fetch("/api/wall", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/wall/mine", { cache: "no-store" }).then((r) => r.json()),
      ]);
      setApproved(pub.entries ?? []);
      setConfigured(pub.configured !== false);
      setMine(own.entries ?? []);
      if (typeof own.max === "number") setMax(own.max);
    } catch {
      /* keep whatever we have */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const items: Item[] = useMemo(() => {
    const mineById = new Map(mine.map((m) => [m.id, m]));
    const publicIds = new Set(approved.map((a) => a.id));
    return [
      ...mine
        .filter((m) => m.status === "pending")
        .map((m) => ({ kind: "image" as const, id: m.id, src: m.url, pending: true, mineKey: m.key })),
      // own approved polaroids the (briefly cached) public list hasn't caught up with yet
      ...mine
        .filter((m) => m.status === "approved" && !publicIds.has(m.id))
        .map((m) => ({ kind: "image" as const, id: m.id, src: m.url, mineKey: m.key })),
      ...approved.map((a) => ({ kind: "image" as const, id: a.id, src: a.url, mineKey: mineById.get(a.id)?.key })),
      ...foundingPolaroids.map((f, i) => ({ kind: "founding" as const, id: `founding-${i}`, ...f })),
    ];
  }, [mine, approved]);

  const atLimit = mine.length >= max;
  const hasApproved = mine.some((m) => m.status === "approved");
  const notice = !atLimit
    ? undefined
    : max === 1
      ? hasApproved
        ? "You already have a polaroid up. Your new one replaces it once it's approved."
        : "This replaces the polaroid you already sent in."
      : `You've used all ${max} of your spots. A new one replaces your oldest.`;

  const onSubmitted = (s: Submitted) => {
    // show it instantly, then sync with the server
    setMine((m) => [{ id: s.id, key: "", url: s.dataUrl, createdAt: s.createdAt, status: "pending", local: true }, ...m]);
    load();
  };

  const removeMine = async (key: string) => {
    if (!confirm("Take this polaroid down?")) return;
    setRemoving(key);
    try {
      await fetch("/api/wall/mine", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      setApproved((a) => a.filter((e) => !mine.some((m) => m.key === key && m.id === e.id)));
      await load();
    } finally {
      setRemoving(null);
    }
  };

  return (
    <section className="container-x pb-28 pt-36 md:pt-44">
      <header className="grid gap-8 border-b border-line pb-10 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <p className="label flex items-center gap-2.5">
            <PixelGlyph rows={ICONS.star} size={2} className="text-accent" />
            You found the wall
          </p>
          <h1 className="mt-6 text-[clamp(2.4rem,5.4vw,4.6rem)] font-medium leading-[0.98] tracking-[-0.045em] text-balance">
            A wall of everyone who&apos;s stopped by.
          </h1>
          <p className="mt-6 max-w-[34rem] text-[16px] leading-relaxed text-muted">
            Take a photo, sign it, and pin it up next to everyone else&apos;s. New polaroids go up once I&apos;ve had a look.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 md:col-span-4 md:items-end">
          <button
            type="button"
            onClick={() => setBooth(true)}
            disabled={!configured}
            className="group inline-flex h-12 items-center gap-3 bg-accent px-5 text-[14px] font-medium text-ink transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Camera size={16} /> {atLimit ? (max === 1 ? "Retake your polaroid" : "Add another polaroid") : "Add your polaroid"}
          </button>
          <span className="font-mono text-[11px] text-dim">
            {!configured ? "The booth opens soon." : loading ? "loading…" : `${items.length} polaroids and counting`}
          </span>
        </div>
      </header>

      {!loading && items.length === 0 && (
        <div className="mt-14 flex flex-col items-center gap-4 border border-dashed border-line py-20 text-center">
          <PixelGlyph rows={ICONS.star} size={3} className="text-accent/60" />
          <p className="text-[15px] text-muted">Nothing up yet. Be the first one.</p>
        </div>
      )}

      <ul className="mt-14 grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 sm:gap-x-7 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((item, i) => {
          const r = hash(item.id);
          const rot = (r - 0.5) * 8;
          const tapeRot = (hash(item.id + "t") - 0.5) * 14;
          return (
            <motion.li
              key={item.id}
              layout
              initial={{ opacity: 0, y: 24, rotate: rot }}
              animate={{ opacity: 1, y: 0, rotate: rot }}
              transition={{ duration: 0.7, delay: Math.min(i, 12) * 0.04, ease: EASE_OUT }}
              className="relative"
              style={{ marginTop: `${Math.round(r * 18)}px` }}
            >
              <button
                type="button"
                onClick={() => setOpen(item)}
                data-cursor="view"
                aria-label={item.kind === "founding" ? `Open polaroid: ${item.alt}` : "Open polaroid"}
                className="group relative block w-full shadow-[0_20px_40px_-20px_rgba(0,0,0,0.85)] transition-transform duration-500 ease-out-expo hover:z-10 hover:-translate-y-1.5 hover:scale-[1.03]"
              >
                <span
                  aria-hidden
                  className="absolute -top-3 left-1/2 z-10 h-6 w-16 -translate-x-1/2 bg-accent/45 mix-blend-normal backdrop-blur-[1px]"
                  style={{ transform: `translateX(-50%) rotate(${tapeRot}deg)` }}
                />
                <Card item={item} handFont={handFont} />
              </button>
              {item.kind === "image" && item.mineKey !== undefined && (
                <div className="mt-3 text-center font-mono text-[10px] leading-snug">
                  <p className={item.pending ? "text-accent" : "text-muted"}>
                    {item.pending ? "pending · only you can see this" : "yours"}
                  </p>
                  {item.mineKey && (
                    <div className="mt-1.5 flex items-center justify-center gap-3 text-dim">
                      <button type="button" onClick={() => setBooth(true)} className="inline-flex items-center gap-1 hover:text-paper">
                        <RotateCcw size={10} /> retake
                      </button>
                      <button
                        type="button"
                        disabled={removing === item.mineKey}
                        onClick={() => removeMine(item.mineKey!)}
                        className="inline-flex items-center gap-1 hover:text-paper disabled:opacity-50"
                      >
                        <Trash2 size={10} /> remove
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.li>
          );
        })}
      </ul>

      {mounted &&
        createPortal(
          <>
      <AnimatePresence>
        {booth && <Booth fonts={fonts} notice={notice} onClose={() => setBooth(false)} onSubmitted={onSubmitted} />}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/92 p-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Polaroid"
          >
            <button type="button" aria-label="Close" className="absolute right-5 top-5 text-muted hover:text-paper" onClick={() => setOpen(null)}>
              <X size={22} />
            </button>
            <motion.div
              initial={{ scale: 0.92, rotate: -3, opacity: 0 }}
              animate={{ scale: 1, rotate: -1.5, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
              className={cn("w-full shadow-[0_40px_80px_-30px_rgba(0,0,0,0.95)]")}
              style={{ maxWidth: "min(460px, calc(85svh * 0.833))" }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card item={open} handFont={handFont} large />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
          </>,
          document.body,
        )}
    </section>
  );
}
