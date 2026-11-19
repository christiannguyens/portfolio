/**
 * Wall storage. Uses Vercel Blob when BLOB_READ_WRITE_TOKEN is set,
 * otherwise a local folder (./.wall-data) for development.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { del, list, put, rename } from "@vercel/blob";

export type WallStatus = "pending" | "approved";
export type WallEntry = { id: string; key: string; url: string; createdAt: string; status: WallStatus; visitor?: string };

const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
/** On Vercel without Blob configured, there is nowhere to write. */
export const storageReady = useBlob || !process.env.VERCEL;

const LOCAL_DIR = path.join(process.cwd(), ".wall-data");
// wall/<status>/<id>[_<visitor hash>][-<blob suffix>].jpg
const KEY_RE = /^wall\/(pending|approved)\/(\d{13}x[a-f0-9]{8})(?:_([a-f0-9]{12}))?(-[A-Za-z0-9]+)?\.jpg$/;

export function newId() {
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) => b.toString(16).padStart(2, "0")).join("");
  return `${Date.now()}x${rand}`;
}

export function parseKey(key: string) {
  const m = KEY_RE.exec(key);
  if (!m) return null;
  return { status: m[1] as WallStatus, id: m[2], visitor: m[3] as string | undefined, base: key.split("/")[2] };
}

function toEntry(key: string, url: string): WallEntry | null {
  const p = parseKey(key);
  if (!p) return null;
  return { id: p.id, key, url, status: p.status, visitor: p.visitor, createdAt: new Date(Number(p.id.slice(0, 13))).toISOString() };
}

export async function listEntries(status: WallStatus): Promise<WallEntry[]> {
  const out: WallEntry[] = [];
  if (useBlob) {
    let cursor: string | undefined;
    do {
      const res = await list({ prefix: `wall/${status}/`, cursor, limit: 1000 });
      for (const b of res.blobs) {
        const e = toEntry(b.pathname, b.url);
        if (e) out.push(e);
      }
      cursor = res.hasMore ? res.cursor : undefined;
    } while (cursor);
  } else {
    const dir = path.join(LOCAL_DIR, status);
    const files = await fs.readdir(dir).catch(() => [] as string[]);
    for (const f of files) {
      const e = toEntry(`wall/${status}/${f}`, `/api/wall/file/${status}/${f.replace(/\.jpg$/, "")}`);
      if (e) out.push(e);
    }
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function savePending(id: string, visitor: string, jpeg: Buffer) {
  const key = `wall/pending/${id}_${visitor}.jpg`;
  if (useBlob) {
    const res = await put(key, jpeg, {
      access: "public",
      addRandomSuffix: true,
      contentType: "image/jpeg",
      cacheControlMaxAge: 31_536_000,
    });
    return { key: res.pathname, publicUrl: res.url as string | null };
  }
  await fs.mkdir(path.join(LOCAL_DIR, "pending"), { recursive: true });
  await fs.writeFile(path.join(LOCAL_DIR, key.replace(/^wall\//, "")), jpeg);
  return { key, publicUrl: null as string | null };
}

/** Approves a pending polaroid, then trims that visitor's approved ones to `keep`. */
export async function approve(key: string, keep = Infinity) {
  const p = parseKey(key);
  if (!p || p.status !== "pending") throw new Error("bad key");
  const to = `wall/approved/${p.base}`;
  if (useBlob) {
    await rename(key, to, { access: "public", addRandomSuffix: false, contentType: "image/jpeg", cacheControlMaxAge: 31_536_000 });
  } else {
    await fs.mkdir(path.join(LOCAL_DIR, "approved"), { recursive: true });
    await fs.rename(path.join(LOCAL_DIR, "pending", p.base), path.join(LOCAL_DIR, "approved", p.base));
  }
  if (p.visitor && Number.isFinite(keep)) {
    const theirs = (await listEntries("approved")).filter((e) => e.visitor === p.visitor);
    for (const old of theirs.slice(keep)) await remove(old.key);
  }
}

export async function remove(key: string) {
  const p = parseKey(key);
  if (!p) throw new Error("bad key");
  if (useBlob) await del(key);
  else await fs.rm(path.join(LOCAL_DIR, p.status, p.base), { force: true });
}

/** Local mode only: read a stored file. */
export async function readLocal(status: WallStatus, id: string) {
  if (useBlob) return null;
  if (!/^\d{13}x[a-f0-9]{8}(_[a-f0-9]{12})?$/.test(id)) return null;
  return fs.readFile(path.join(LOCAL_DIR, status, `${id}.jpg`)).catch(() => null);
}
