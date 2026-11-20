/**
 * ABOUT: copy, quick facts, "currently exploring" and the
 * "Outside the keyboard" photo wall.
 */

export const aboutParagraphs = [
  "I'm from Charlotte, North Carolina, and moved to St. Louis for school. I like making things that are actually useful, and I learn best by just building them.",
  "Right now I'm most interested in software engineering, product management, fintech, edtech, AI, systems, and web development.",
  "When I'm not working on something, I'm usually with my girlfriend, my close friends, or my family.",
];

/** "Off the clock" list next to the About copy. */
export const offTheClock = [
  { k: "Gym", v: "Lifting, sometimes running" },
  { k: "Games", v: "League of Legends, TFT" },
  { k: "Also", v: "Walks, eating, doomscrolling" },
];

/** Edit freely: this is the "now" list. */
export const currentlyExploring = [
  { label: "Native macOS apps", note: "Swift, AppKit, WebKit" },
  { label: "Building with AI tools", note: "mostly Claude Code" },
  { label: "Product and startups", note: "pitch comps, hackathons" },
];

/**
 * OUTSIDE THE KEYBOARD
 * Replace each placeholder with a real photo + caption:
 *   { title: "Film photography", caption: "Shot on ...", image: "/images/interests/film.jpg" }
 * Images go in /public/images/interests/. Polaroids crop square; use `position` to adjust the crop.
 * Entries without `image` render as blank "coming soon" polaroids.
 */
export type Interest = {
  /** Short label on the polaroid (leave empty to show just the number). */
  title?: string;
  /** Optional sentence under the polaroid. */
  caption?: string;
  image?: string;
  alt?: string;
  /** CSS object-position for the crop, e.g. "50% 30%". */
  position?: string;
};

/** Empty entries show as blank "coming soon" polaroids. */
export const interests: Interest[] = [{}, {}, {}, {}];

/** Short interest tags shown under the photos. Leave empty to hide. */
export const interestTags: string[] = [];
