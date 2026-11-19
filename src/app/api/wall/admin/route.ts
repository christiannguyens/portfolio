import { NextResponse } from "next/server";
import { wallConfig } from "@/data/wall";
import { adminConfigured, isAdmin } from "@/lib/wall/auth";
import { approve, listEntries, parseKey, remove, storageReady } from "@/lib/wall/storage";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };

function guard(req: Request) {
  if (!adminConfigured()) return NextResponse.json({ error: "Set WALL_ADMIN_SECRET to enable the admin." }, { status: 503 });
  if (!isAdmin(req)) return NextResponse.json({ error: "Wrong secret" }, { status: 401 });
  if (!storageReady) return NextResponse.json({ error: "Blob storage isn't configured." }, { status: 503 });
  return null;
}

export async function GET(req: Request) {
  const denied = guard(req);
  if (denied) return denied;
  const [pending, approved] = await Promise.all([listEntries("pending"), listEntries("approved")]);
  // flag pending polaroids that will replace one already on the wall
  const flagged = pending.map((e) => ({
    ...e,
    replaces: Boolean(e.visitor) && approved.filter((a) => a.visitor === e.visitor).length >= wallConfig.maxPerVisitor,
  }));
  return NextResponse.json({ pending: flagged, approved }, { headers: noStore });
}

export async function POST(req: Request) {
  const denied = guard(req);
  if (denied) return denied;
  const { action, key } = (await req.json().catch(() => ({}))) as { action?: string; key?: string };
  if (!key || !parseKey(key)) return NextResponse.json({ error: "Bad key" }, { status: 400 });
  try {
    if (action === "approve") await approve(key, wallConfig.maxPerVisitor);
    else if (action === "remove") await remove(key);
    else return NextResponse.json({ error: "Bad action" }, { status: 400 });
    return NextResponse.json({ ok: true }, { headers: noStore });
  } catch {
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
