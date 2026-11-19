import { getQuotes, type Quote } from "@/lib/quotes";
import { cn } from "@/lib/utils";

function Item({ q }: { q: Quote }) {
  const up = (q.change ?? 0) >= 0;
  return (
    <span className="flex items-center gap-2 whitespace-nowrap">
      <span className="text-paper">{q.symbol}</span>
      {q.price !== undefined && <span className="tabular-nums text-muted">{q.price.toFixed(2)}</span>}
      {q.change !== undefined && (
        <span className={cn("tabular-nums", up ? "text-accent" : "text-dim")}>
          {up ? "▲" : "▼"} {Math.abs(q.change).toFixed(2)}%
        </span>
      )}
    </span>
  );
}

/** Scrolling market ticker for the top bar (server-rendered, CSS-animated). */
export async function Ticker() {
  const quotes = await getQuotes();
  const row = (hidden?: boolean) => (
    <div className="flex shrink-0 items-center gap-8 pr-8" aria-hidden={hidden || undefined}>
      {quotes.map((q) => (
        <Item key={q.symbol} q={q} />
      ))}
    </div>
  );
  return (
    <div className="flex h-7 items-center border-b border-line font-mono text-[10.5px]" aria-label="Stock ticker">
      <div className="container-x flex h-full items-center gap-4">
        <span className="flex shrink-0 items-center gap-2 text-faint">
          <span className="h-1 w-1 bg-accent" aria-hidden />
          MKT
        </span>
        <div className="relative h-full min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_4%,black_96%,transparent)]">
          <div
            className="absolute inset-y-0 left-0 flex animate-marquee items-center hover:[animation-play-state:paused]"
            style={{ animationDuration: `${Math.max(40, quotes.length * 4)}s` }}
          >
            {row()}
            {row(true)}
          </div>
        </div>
      </div>
    </div>
  );
}
