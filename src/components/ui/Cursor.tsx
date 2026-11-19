"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";

type Variant = "default" | "link" | "label" | "hidden";

/**
 * A soft trailing ring that reacts to interactive elements.
 * The native cursor is never hidden. Desktop/fine pointers only.
 * Add `data-cursor="label text"` to any element to show a label.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [variant, setVariant] = useState<Variant>("hidden");
  const [label, setLabel] = useState("");

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 520, damping: 42, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 520, damping: 42, mass: 0.6 });

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as Element | null;
      const labelled = t?.closest<HTMLElement>("[data-cursor]");
      if (labelled) {
        const l = labelled.dataset.cursor ?? "";
        if (l === "none") {
          setVariant("hidden");
          return;
        }
        setLabel(l);
        setVariant("label");
        return;
      }
      if (t?.closest("input, textarea, [contenteditable='true']")) {
        setVariant("hidden");
        return;
      }
      if (t?.closest("a, button, [role='button'], [role='separator'], label, summary")) {
        setVariant("link");
        return;
      }
      setVariant("default");
    };
    const onLeave = () => setVariant("hidden");
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const size = variant === "label" ? 76 : variant === "link" ? 44 : 26;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[150] flex items-center justify-center rounded-full border"
      style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
      animate={{
        width: size,
        height: size,
        opacity: variant === "hidden" ? 0 : 1,
        backgroundColor: variant === "label" ? "rgba(245,171,237,0.95)" : "rgba(245,171,237,0)",
        borderColor:
          variant === "link"
            ? "rgba(245,171,237,0.75)"
            : variant === "label"
              ? "rgba(245,171,237,0)"
              : "rgba(236,233,225,0.35)",
      }}
      transition={{ type: "spring", stiffness: 400, damping: 32 }}
    >
      {variant === "label" && (
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink">{label}</span>
      )}
    </motion.div>
  );
}
