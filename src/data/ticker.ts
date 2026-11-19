/**
 * Symbols for the scrolling ticker in the top bar. Quotes come from Yahoo
 * Finance's public chart endpoint, cached for 15 minutes, and are sorted so
 * the biggest movers show first. If a quote can't be fetched, just the
 * symbol is shown (no made-up numbers).
 */
export const tickerSymbols = [
  "NVDA", "AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA", "AVGO",
  "AMD", "PLTR", "NFLX", "COIN", "HOOD", "UBER", "SPY", "QQQ",
];

/** Seconds between quote refreshes. */
export const tickerRevalidate = 900;
