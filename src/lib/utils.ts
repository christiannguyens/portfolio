export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-05" -> { y: 2026, m: 4 } */
export function parseYM(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return { y, m: m - 1 };
}

export function formatYM(ym: string) {
  const { y, m } = parseYM(ym);
  return `${MONTHS[m]} ${y}`;
}

export function monthIndex(ym: string) {
  const { y, m } = parseYM(ym);
  return y * 12 + m;
}

/** Inclusive month count → "2 mos" / "1 yr" / "2 yrs 3 mos". */
export function duration(start: string, end: string) {
  const months = monthIndex(end) - monthIndex(start) + 1;
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y) parts.push(`${y} yr${y > 1 ? "s" : ""}`);
  if (m) parts.push(`${m} mo${m > 1 ? "s" : ""}`);
  return parts.join(" ");
}

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
