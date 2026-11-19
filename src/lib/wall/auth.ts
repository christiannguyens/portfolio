import { timingSafeEqual } from "node:crypto";

/** True when the request carries the correct WALL_ADMIN_SECRET. */
export function isAdmin(req: Request) {
  const secret = process.env.WALL_ADMIN_SECRET;
  const given = req.headers.get("x-wall-secret");
  if (!secret || !given) return false;
  const a = Buffer.from(secret);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const adminConfigured = () => Boolean(process.env.WALL_ADMIN_SECRET);
