import { createHash, randomBytes } from "node:crypto";
import type { NextResponse } from "next/server";

/**
 * Anonymous visitor identity for The Wall: a random ID in an httpOnly cookie.
 * Polaroids store only a short hash of it, so the public can't use a
 * polaroid to act as its owner.
 */
const COOKIE = "wall_vid";

export function readVisitor(req: Request) {
  const raw = req.headers.get("cookie") ?? "";
  const m = raw.match(/(?:^|;\s*)wall_vid=([a-f0-9]{32})/);
  return m ? m[1] : null;
}

export const visitorHash = (vid: string) => createHash("sha256").update(vid).digest("hex").slice(0, 12);

/** Existing visitor ID, or a new one (call `remember` to persist it). */
export function getOrCreateVisitor(req: Request) {
  const existing = readVisitor(req);
  const vid = existing ?? randomBytes(16).toString("hex");
  return { vid, vh: visitorHash(vid), isNew: !existing };
}

export function remember(res: NextResponse, vid: string) {
  res.cookies.set(COOKIE, vid, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365 * 2,
  });
  return res;
}
