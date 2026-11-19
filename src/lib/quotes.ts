import { tickerRevalidate, tickerSymbols } from "@/data/ticker";

export type Quote = { symbol: string; price?: number; change?: number };

async function fetchQuote(symbol: string): Promise<Quote> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`,
      {
        headers: { "User-Agent": "Mozilla/5.0" },
        next: { revalidate: tickerRevalidate },
        signal: AbortSignal.timeout(4000),
      },
    );
    if (!res.ok) return { symbol };
    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    const price: unknown = meta?.regularMarketPrice;
    if (typeof price !== "number") return { symbol };
    const prev: unknown = meta.chartPreviousClose ?? meta.previousClose;
    const change =
      typeof meta.regularMarketChangePercent === "number"
        ? meta.regularMarketChangePercent
        : typeof prev === "number" && prev
          ? ((price - prev) / prev) * 100
          : undefined;
    return { symbol, price, change };
  } catch {
    return { symbol };
  }
}

/** Quotes for the ticker, biggest movers first. Never throws. */
export async function getQuotes(): Promise<Quote[]> {
  const quotes = await Promise.all(tickerSymbols.map(fetchQuote));
  return quotes.sort((a, b) => Math.abs(b.change ?? 0) - Math.abs(a.change ?? 0));
}
