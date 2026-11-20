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
 * Images go in /public/images/interests/. The file name (minus .jpg) is used as the caption, exactly as written.
 * Polaroids crop square; use `position` to adjust the crop.
 * Entries without `image` render as blank "coming soon" polaroids.
 */
export type Interest = {
  /** Label on the polaroid. Defaults to the image file name, exactly ("i love hiking.jpg" -> "i love hiking"). */
  title?: string;
  /** Optional sentence under the polaroid. */
  caption?: string;
  image?: string;
  alt?: string;
  /** CSS object-position for the crop, e.g. "50% 30%". */
  position?: string;
};

/** Empty entries ({}) show as blank "coming soon" polaroids. */
export const interests: Interest[] = [
  { image: "/images/interests/lifting is my favorite hobby.jpg", alt: "The dumbbell rack at my gym", position: "50% 65%" },
  { image: "/images/interests/me, my girlfriend, and my friends.jpg", alt: "Me, my girlfriend, and my friends out at night", position: "50% 50%" },
  { image: "/images/interests/my car and my dad's car.jpg", alt: "My car and my dad's car parked in a driveway at dusk", position: "50% 58%" },
  { image: "/images/interests/i love hiking.jpg", alt: "Me looking out over the trees from a rocky overlook", position: "50% 42%" },
];

/** Short interest tags shown under the photos. Leave empty to hide. */
export const interestTags: string[] = [];
