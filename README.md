# Christian Nguyens — personal site

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Motion · Lucide

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (also type-checks)
```

## Editing content

Everything personal lives in `src/data/`. You shouldn't need to touch components to update the site.

| File | What's in it |
| --- | --- |
| `site.ts` | Name, URL, emails, socials, location, **portrait**, nav |
| `projects.ts` | Projects → homepage cards + `/projects/[slug]` case studies |
| `experience.ts` | Experience timeline + high-school leadership (shown in About) |
| `about.ts` | About copy, quick facts, "currently exploring", **Outside the keyboard** photos |
| `stack.ts` | Tech stack "table of elements" |
| `ticker.ts` | Symbols in the top-bar stock ticker (live quotes, refreshed every 15 min; falls back to symbols only if quotes can't be fetched) |

### Portrait
Replace `public/images/portrait.jpg` (portrait orientation, face in the upper third). The pixel effect auto-levels each photo, so most images work as-is.
Optional: `portrait.palette` in `site.ts` = `"tint"` (pink dither, default), `"mono"`, or `"original"` (pixelated real colours).

### Outside the keyboard photos
Images live in `public/images/interests/`; entries are in `src/data/about.ts`:
```ts
{ image: "/images/interests/photo-01.jpg", alt: "...", title: "optional label", caption: "optional sentence", position: "50% 35%" }
```
Polaroids crop square; `position` nudges the crop.
Add `interestTags` for small tags under the photos.

### Add project screenshots
Put images in `public/images/projects/`, then in `projects.ts`:
```ts
cover: { src: "/images/projects/portabledash.png", alt: "...", width: 2400, height: 1500 },
gallery: [{ src: "...", alt: "...", caption: "...", width: 2400, height: 1500 }],
```
`cover` replaces the illustrative mockup on the card and case-study hero. `gallery` appears as a Screenshots section (hidden while empty). In dev mode you'll see dashed placeholder slots.

### Add a project / job
Append an object to the array in `projects.ts` or `experience.ts`. The page, sitemap and timeline update automatically.

## The Wall (`/wall`)
A guest wall: visitors take a photo (or upload one), sign it by drawing or typing, and pin it up. New polaroids are **pending** until you approve them. The person who made one sees it right away, and everyone else sees it after approval.

- **Moderate** at `/wall/admin`: enter your `WALL_ADMIN_SECRET` once per device, then approve, reject, or delete. Retakes are labelled; approving one swaps it in for that person's current polaroid.
- **One polaroid per person** by default (an anonymous browser cookie, no accounts). Visitors can retake or remove their own. Change `maxPerVisitor` in `src/data/wall.ts` (e.g. `5`) to allow more.
- **Get notified** of new submissions (optional, set in Vercel env vars, any combination):
  - *Email:* sign up at resend.com with the address you want alerts at, create an API key, then set `RESEND_API_KEY` and `WALL_NOTIFY_EMAIL`.
  - *Phone push:* install the ntfy app, subscribe to a hard-to-guess topic, and set `WALL_NOTIFY_WEBHOOK=https://ntfy.sh/<your-topic>`. A Discord or Slack webhook URL works here too.
- **Locally**, polaroids are saved in `./.wall-data` (gitignored), and the admin secret lives in `.env.local`.
- **On Vercel** you need two things (until then the page shows "The booth opens soon"):
  1. Storage → Create **Blob** store (public access) → connect it to this project. This adds `BLOB_STORE_ID`.
  2. Settings → Environment Variables → add `WALL_ADMIN_SECRET` (any long random string), then redeploy.
- Your own pinned polaroids and their handwritten notes are in `src/data/wall.ts`.

## Deploying to Vercel
Push this folder to a GitHub repo and import it at vercel.com/new (framework preset: Next.js, no settings needed), or run `npx vercel`. If you use a custom domain, update `site.url` in `src/data/site.ts` so Open Graph and the sitemap point to it.

## Structure
```
src/
  app/            routes, metadata, OG image, icons, sitemap
  components/
    hero/         Hero, PixelPortrait (canvas), InfoStrip
    about/        About, Terminal, Polaroids
    projects/     Projects (featured + cards)
    mocks/        Illustrative HTML recreations of each project
    experience/   Timeline
    stack/        Table of elements
    contact/      Contact
    layout/       Nav, Footer
    ui/           Reveal, SectionHeader, Cursor, PixelGlyph, ...
  data/           ← all content
  lib/            utils, hooks, pixel-art bitmaps
```
