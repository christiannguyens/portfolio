import { NextResponse } from "next/server";
import { wallConfig } from "@/data/wall";
import { listEntries, parseKey, remove, storageReady } from "@/lib/wall/storage";
import { readVisitor, visitorHash } from "@/lib/wall/visitor";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "private, no-store" };

/** The current visitor's own polaroids (pending + approved). */
export async function GET(req: Request) {
  const vid = readVisitor(req);
  if (!vid || !storageReady) return NextResponse.json({ entries: [], max: wallConfig.maxPerVisitor }, { headers: noStore });
  const vh = visitorHash(vid);
  const [pending, approved] = await Promise.all([listEntries("pending"), listEntries("approved")]);
  const entries = [...pending, ...approved]
    .filter((e) => e.visitor === vh)
    .map(({ id, key, url, createdAt, status }) => ({ id, key, url, createdAt, status }));
  return NextResponse.json({ entries, max: wallConfig.maxPerVisitor }, { headers: noStore });
}

/** Lets a visitor take down one of their own polaroids. */
export async function DELETE(req: Request) {
  const vid = readVisitor(req);
  const { key } = (await req.json().catch(() => ({}))) as { key?: string };
  const p = key ? parseKey(key) : null;
  if (!vid || !p || !p.visitor || p.visitor !== visitorHash(vid)) {
    return NextResponse.json({ error: "Not yours to remove" }, { status: 403 });
  }
  try {
    await remove(key!);
    return NextResponse.json({ ok: true }, { headers: noStore });
  } catch {
    return NextResponse.json({ error: "Couldn't remove that" }, { status: 500 });
  }
}
