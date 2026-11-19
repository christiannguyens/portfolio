/**
 * THE WALL: a guest wall of polaroids visitors take and sign themselves.
 * New polaroids wait in a queue until approved at /wall/admin.
 *
 * Setup (production):
 *   1. Vercel dashboard → Storage → Create a *Blob* store (public access) and
 *      connect it to this project (adds BLOB_STORE_ID).
 *   2. Add an env var WALL_ADMIN_SECRET (any long random string).
 * Locally, polaroids are stored in ./.wall-data instead.
 *
 * Notifications (optional, any combination):
 *   - Email via Resend: RESEND_API_KEY + WALL_NOTIFY_EMAIL
 *     (optional WALL_NOTIFY_FROM once you've verified a domain in Resend)
 *   - Push/chat: WALL_NOTIFY_WEBHOOK = a Discord or Slack webhook URL,
 *     or an ntfy topic URL like https://ntfy.sh/your-secret-topic
 */

export const wallConfig = {
  /**
   * Polaroids each visitor can have on the wall. Pinning beyond this
   * replaces their oldest one (it swaps in once the new one is approved).
   */
  maxPerVisitor: 1,
  /** Max typed-signature length. */
  maxSignature: 28,
  /** Max size of an uploaded polaroid JPEG, in bytes. */
  maxBytes: 1_500_000,
  /** Refuse new submissions when this many are waiting for approval. */
  maxPending: 200,
  /** Per-visitor submissions allowed per 10 minutes (best effort). */
  rateLimit: 4,
};

/** Christian's own polaroids, pinned as the first ones on the wall. */
export const foundingPolaroids = [
  { src: "/images/interests/photo-01.jpg", alt: "Christian with friends, dressed up at night", position: "50% 35%", note: "christian" },
  { src: "/images/interests/photo-03.jpg", alt: "Christian with friends at WashU", position: "50% 40%", note: "washu ✿" },
  { src: "/images/interests/photo-02.jpg", alt: "Christian and friends in a dorm room", position: "50% 30%", note: "dorm night" },
  { src: "/images/interests/photo-04.jpg", alt: "An upside-down selfie", position: "50% 50%", note: "upside down" },
];
