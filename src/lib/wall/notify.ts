/**
 * New-submission notifications for The Wall. Every channel is optional and
 * configured by env vars (see src/data/wall.ts). Failures are swallowed:
 * a notification problem should never block a visitor's submission.
 */

type NewPolaroid = {
  imageUrl: string | null; // public image URL (Blob), null in local dev
  adminUrl: string;
  pendingCount: number;
  replacing: boolean;
};

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

async function email(p: NewPolaroid) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.WALL_NOTIFY_EMAIL;
  if (!key || !to) return;
  const waiting = `${p.pendingCount} waiting for approval`;
  const html = `
    <div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:420px;margin:0 auto;padding:24px;color:#1b1b19">
      <p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#77746c;margin:0 0 12px">The Wall</p>
      <h1 style="font-size:22px;margin:0 0 6px">New polaroid${p.replacing ? " (a retake)" : ""}</h1>
      <p style="color:#77746c;margin:0 0 20px">${esc(waiting)}</p>
      ${p.imageUrl ? `<img src="${esc(p.imageUrl)}" alt="New polaroid" width="300" style="display:block;width:300px;max-width:100%;margin:0 0 24px;box-shadow:0 10px 30px rgba(0,0,0,.15)">` : ""}
      <a href="${esc(p.adminUrl)}" style="display:inline-block;background:#1b1b19;color:#fff;text-decoration:none;padding:12px 18px;font-size:14px">Review it</a>
    </div>`;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.WALL_NOTIFY_FROM || "The Wall <onboarding@resend.dev>",
      to: to.split(",").map((s) => s.trim()),
      subject: `New polaroid on The Wall · ${waiting}`,
      html,
    }),
    signal: AbortSignal.timeout(8000),
  });
}

async function webhook(p: NewPolaroid) {
  const url = process.env.WALL_NOTIFY_WEBHOOK;
  if (!url) return;
  const text = `New polaroid on The Wall${p.replacing ? " (a retake)" : ""}. ${p.pendingCount} waiting for approval.`;
  const host = new URL(url).hostname;
  let init: RequestInit;
  if (host.endsWith("discord.com") || host.endsWith("discordapp.com")) {
    init = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `${text}\nReview: ${p.adminUrl}`,
        embeds: p.imageUrl ? [{ image: { url: p.imageUrl } }] : undefined,
      }),
    };
  } else if (host.endsWith("slack.com")) {
    init = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `${text} <${p.adminUrl}|Review it>` }),
    };
  } else {
    // ntfy (ntfy.sh or self-hosted) and other plain-text endpoints
    const headers: Record<string, string> = { Title: "The Wall", Click: p.adminUrl, Tags: "camera" };
    if (p.imageUrl) headers.Attach = p.imageUrl;
    init = { method: "POST", headers, body: text };
  }
  await fetch(url, { ...init, signal: AbortSignal.timeout(8000) });
}

export async function notifyNewPolaroid(p: NewPolaroid) {
  await Promise.allSettled([email(p), webhook(p)]);
}
