"use client";

import { motion } from "motion/react";
import { EASE_OUT } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "li" | "section" | "article" | "span";
};

/** Fades + lifts its children into view once, when scrolled to. */
export function Reveal({ children, className, delay = 0, y = 22, as = "div" }: Props) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.9, delay, ease: EASE_OUT }}
    >
      {children}
    </Comp>
  );
}
