import { readLocal, type WallStatus } from "@/lib/wall/storage";

/** Local development only: serves polaroids stored in ./.wall-data. */
export async function GET(_req: Request, { params }: { params: Promise<{ status: string; id: string }> }) {
  const { status, id } = await params;
  if (status !== "pending" && status !== "approved") return new Response("Not found", { status: 404 });
  const buf = await readLocal(status as WallStatus, id);
  if (!buf) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(buf), { headers: { "Content-Type": "image/jpeg", "Cache-Control": "no-store" } });
}
