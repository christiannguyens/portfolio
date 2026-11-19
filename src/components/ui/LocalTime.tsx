"use client";

import { site } from "@/data/site";
import { useClocks } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const zones = site.clocks.map((c) => c.timeZone);

/** Live clocks for each city in site.clocks, e.g. "STL 5:53:12 PM  CLT 6:53:12 PM". */
export function LocalTime({ className, stacked = false }: { className?: string; stacked?: boolean }) {
  const times = useClocks(zones);
  return (
    <span className={cn(stacked ? "flex flex-col gap-0.5" : "inline-flex items-center gap-4", className)}>
      {site.clocks.map((c, i) => (
        <span key={c.label} className="whitespace-nowrap">
          <span className="text-faint">{c.label}</span>{" "}
          <span className="tabular-nums" suppressHydrationWarning>
            {times?.[i] ?? "--:--:-- --"}
          </span>
        </span>
      ))}
    </span>
  );
}
