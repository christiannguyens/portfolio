"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function CopyButton({ value, className }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        } catch {
          /* clipboard unavailable: ignore */
        }
      }}
      className={cn(
        "relative z-10 inline-flex h-8 items-center gap-1.5 rounded-[3px] border border-line px-2.5 font-mono text-[11px] text-muted transition-colors hover:border-line-strong hover:text-paper",
        className,
      )}
      aria-label={copied ? "Copied" : `Copy ${value}`}
    >
      {copied ? <Check size={12} className="text-accent" /> : <Copy size={12} />}
      <span aria-live="polite">{copied ? "copied" : "copy"}</span>
    </button>
  );
}
