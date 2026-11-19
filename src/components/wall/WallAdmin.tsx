"use client";

import { Check, Loader2, RefreshCw, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Entry = { id: string; key: string; url: string; createdAt: string; status: "pending" | "approved"; replaces?: boolean };
const KEY = "wall:admin-secret";

/** Private moderation queue for The Wall (requires WALL_ADMIN_SECRET). */
export function WallAdmin() {
  const [secret, setSecret] = useState("");
  const [input, setInput] = useState("");
  const [data, setData] = useState<{ pending: Entry[]; approved: Entry[] } | null>(null);
  const [error, setError] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (s: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/wall/admin", { headers: { "x-wall-secret": s }, cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setData(json);
      setSecret(s);
      try {
        localStorage.setItem(KEY, s); // remembered on this device
      } catch {}
    } catch (e) {
      setError((e as Error).message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let saved = "";
    try {
      saved = localStorage.getItem(KEY) ?? "";
    } catch {}
    if (saved) load(saved);
  }, [load]);

  const act = async (action: "approve" | "remove", key: string) => {
    if (action === "remove" && !confirm("Delete this polaroid permanently?")) return;
    setBusyKey(key);
    try {
      const res = await fetch("/api/wall/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-wall-secret": secret },
        body: JSON.stringify({ action, key }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      await load(secret);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyKey(null);
    }
  };

  if (!data) {
    return (
      <section className="container-x flex min-h-[80svh] items-center pt-36">
        <form
          className="w-full max-w-sm"
          onSubmit={(e) => {
            e.preventDefault();
            load(input);
          }}
        >
          <p className="label">The Wall · admin</p>
          <label htmlFor="secret" className="mt-6 block text-[22px] font-medium tracking-[-0.02em]">
            Enter the admin secret
          </label>
          <input
            id="secret"
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="mt-4 h-11 w-full border border-line bg-ink-2 px-3 font-mono text-[14px] outline-none focus:border-accent/60"
            autoFocus
          />
          <button type="submit" className="mt-4 inline-flex h-11 items-center gap-2 bg-paper px-5 text-[14px] font-medium text-ink hover:bg-accent">
            {loading && <Loader2 size={14} className="animate-spin" />} Unlock
          </button>
          {error && <p className="mt-4 font-mono text-[12px] text-accent">{error}</p>}
        </form>
      </section>
    );
  }

  const Grid = ({ list, pending }: { list: Entry[]; pending?: boolean }) =>
    list.length ? (
      <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
        {list.map((e) => (
          <li key={e.key} className="border border-line bg-ink-2 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={e.url} alt="Submitted polaroid" className="w-full" />
            <p className="mt-2 font-mono text-[10px] text-dim">{new Date(e.createdAt).toLocaleString()}</p>
            {e.replaces && <p className="mt-1 font-mono text-[10px] text-accent">retake · replaces their current one</p>}
            <div className="mt-2 flex gap-1.5">
              {pending && (
                <button
                  type="button"
                  disabled={busyKey === e.key}
                  onClick={() => act("approve", e.key)}
                  className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 bg-accent font-mono text-[11px] text-ink disabled:opacity-50"
                >
                  <Check size={12} /> approve
                </button>
              )}
              <button
                type="button"
                disabled={busyKey === e.key}
                onClick={() => act("remove", e.key)}
                className={cn(
                  "inline-flex h-8 items-center justify-center gap-1.5 border border-line font-mono text-[11px] text-muted hover:text-paper disabled:opacity-50",
                  pending ? "px-2.5" : "flex-1",
                )}
              >
                {pending ? <X size={12} /> : <Trash2 size={12} />} {pending ? "" : "delete"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <p className="font-mono text-[12px] text-dim">Nothing here.</p>
    );

  return (
    <section className="container-x pb-24 pt-36">
      <div className="flex items-center justify-between border-b border-line pb-6">
        <div>
          <p className="label">The Wall · admin</p>
          <h1 className="mt-3 text-[28px] font-medium tracking-[-0.03em]">
            {data.pending.length} waiting · {data.approved.length} on the wall
          </h1>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => load(secret)} className="inline-flex h-9 items-center gap-2 border border-line px-3 font-mono text-[11px] text-muted hover:text-paper">
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> refresh
          </button>
          <button
            type="button"
            onClick={() => {
              try {
                localStorage.removeItem(KEY);
              } catch {}
              setData(null);
              setSecret("");
            }}
            className="inline-flex h-9 items-center border border-line px-3 font-mono text-[11px] text-muted hover:text-paper"
          >
            sign out
          </button>
        </div>
      </div>
      {error && <p className="mt-4 font-mono text-[12px] text-accent">{error}</p>}
      <h2 className="label mb-5 mt-10">Waiting for approval</h2>
      <Grid list={data.pending} pending />
      <h2 className="label mb-5 mt-14">On the wall</h2>
      <Grid list={data.approved} />
    </section>
  );
}
