/**
 * ABOUT: copy, quick facts, "currently exploring" and the
 * "Outside the keyboard" photo wall.
 */

export const aboutParagraphs = [
  "I'm in WashU's joint Business + Computer Science program, which is a fancy way of saying I spend half my week on how things are built and the other half on why anyone would want them. The interesting stuff usually happens where those two questions meet.",
  "I learn best by making something real. PortableDash pulled me into native macOS development. Campus Borrow had to hold up through a two-minute pitch. Pool had to come together before the hackathon clock ran out. Each one made me learn whatever the project needed next.",
  "Right now I'm most interested in software engineering, product management, fintech, edtech, AI, systems, and web development.",
];

export const facts = [
  { k: "Based in", v: "St. Louis, MO & Charlotte, NC" },
  { k: "Studying", v: "Business + CS (BUCS)" },
  { k: "School", v: "WashU, Class of 2030" },
  { k: "Honors", v: "Taylor Scholar" },
  { k: "Builds", v: "macOS apps, web apps, hackathon things" },
];

/** Edit freely: this is the "now" list. */
export const currentlyExploring = [
  { label: "Native macOS development", note: "Swift, AppKit and WebKit, via PortableDash" },
  { label: "Building with AI coding tools", note: "Claude Code" },
  { label: "Where product meets business", note: "Pitch competitions, hackathons, BUCS" },
];

/**
 * OUTSIDE THE KEYBOARD
 * Replace each placeholder with a real photo + caption:
 *   { title: "Film photography", caption: "Shot on ...", image: "/images/interests/film.jpg" }
 * Images go in /public/images/interests/. Polaroids crop square; use `position` to adjust the crop.
 * Entries without `image` render as "developing" polaroids.
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

export const interests: Interest[] = [
  { image: "/images/interests/photo-01.jpg", alt: "Christian with friends, dressed up at night", position: "50% 35%" },
  { image: "/images/interests/photo-02.jpg", alt: "Christian and friends posing in a dorm room", position: "50% 30%" },
  { image: "/images/interests/photo-03.jpg", alt: "Christian with friends at WashU", position: "50% 40%" },
  { image: "/images/interests/photo-04.jpg", alt: "An upside-down selfie with a friend", position: "50% 50%" },
];

/** Short interest tags shown under the photos. Leave empty to hide. */
export const interestTags: string[] = [];
