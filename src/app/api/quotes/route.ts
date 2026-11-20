import { NextResponse } from "next/server";
import { tickerRevalidate } from "@/data/ticker";
import { getQuotes } from "@/lib/quotes";

/** Same quotes as the top-bar ticker, for the terminal's `stocks` command. */
export async function GET() {
  const quotes = await getQuotes();
  return NextResponse.json(
    { quotes },
    { headers: { "Cache-Control": `public, s-maxage=${tickerRevalidate}, stale-while-revalidate=${tickerRevalidate}` } },
  );
}
