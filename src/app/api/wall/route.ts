import { after, NextResponse } from "next/server";
import { wallConfig } from "@/data/wall";
import { notifyNewPolaroid } from "@/lib/wall/notify";
import { listEntries, newId, remove, savePending, storageReady } from "@/lib/wall/storage";
import { getOrCreateVisitor, remember } from "@/lib/wall/visitor";

export const dynamic = "force-dynamic";

/** Public: approved polaroids, newest first. */
export async function GET() {
  if (!storageReady) return NextResponse.json({ entries: [], configured: false });
  try {
    const entries = (await listEntries("approved")).map(({ id, url, createdAt }) => ({ id, url, createdAt }));
    return NextResponse.json(
      { entries, configured: true, maxPerVisitor: wallConfig.maxPerVisitor },
      { headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60" } },
    );
  } catch {
    return NextResponse.json({ entries: [], configured: true, error: "unavailable" }, { status: 503 });
  }
}

// best-effort, per-instance rate limit
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > wallConfig.rateLimit;
}

/**
 * Public: submit a composed polaroid (JPEG data URL) to the pending queue.
 * Each visitor keeps at most `maxPerVisitor`: their oldest pending ones are
 * replaced right away; approved ones are replaced when the new one is approved.
 */
export async function POST(req: Request) {
  if (!storageReady) {
    return NextResponse.json({ error: "The wall isn't set up yet. Check back soon." }, { status: 503 });
  }
  let body: { image?: unknown; website?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  // honeypot: bots fill every field
  if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ ok: true, id: newId() });

  const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  if (limited(ip)) return NextResponse.json({ error: "Easy there. Try again in a few minutes." }, { status: 429 });

  const image = typeof body.image === "string" ? body.image : "";
  const prefix = "data:image/jpeg;base64,";
  if (!image.startsWith(prefix)) return NextResponse.json({ error: "Expected a JPEG image" }, { status: 400 });
  const buf = Buffer.from(image.slice(prefix.length), "base64");
  const isJpeg = buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  if (!isJpeg || buf.length < 5_000 || buf.length > wallConfig.maxBytes) {
    return NextResponse.json({ error: "That image didn't look right" }, { status: 400 });
  }

  const visitor = getOrCreateVisitor(req);
  try {
    const [pending, approved] = await Promise.all([listEntries("pending"), listEntries("approved")]);
    const myPending = pending.filter((e) => e.visitor === visitor.vh); // newest first
    const myApproved = approved.filter((e) => e.visitor === visitor.vh);

    // make room: drop this visitor's oldest pending polaroids first
    const max = wallConfig.maxPerVisitor;
    const drop: string[] = [];
    while (myApproved.length + myPending.length + 1 > max && myPending.length) drop.push(myPending.pop()!.key);
    if (pending.length - drop.length >= wallConfig.maxPending) {
      return NextResponse.json({ error: "The wall is full right now. Try again later." }, { status: 429 });
    }
    await Promise.all(drop.map(remove));

    const id = newId();
    const saved = await savePending(id, visitor.vh, buf);
    const replacing = drop.length > 0 || myApproved.length >= max;

    const adminUrl = `${new URL(req.url).origin}/wall/admin`;
    const pendingCount = pending.length - drop.length + 1;
    after(() => notifyNewPolaroid({ imageUrl: saved.publicUrl, adminUrl, pendingCount, replacing }));

    return remember(NextResponse.json({ ok: true, id }), visitor.vid);
  } catch {
    return NextResponse.json({ error: "Couldn't save that. Try again?" }, { status: 500 });
  }
}
