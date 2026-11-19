/**
 * PROJECTS
 * Add a project by appending an object to `projects`. Each one automatically
 * gets a card on the homepage and a case-study page at /projects/[slug].
 *
 * Screenshots: put images in /public/images/projects/ and reference them with
 * `cover` (card + page hero) and `gallery` (case-study page). When `cover` is
 * missing, a hand-built illustrative mockup is shown instead (see `mock`).
 */

export type ProjectImage = {
  src: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
};

export type ProjectLink = {
  label: string;
  href: string;
  kind: "live" | "github" | "other";
};

export type MockKey = "portabledash" | "campusborrow" | "pool";

export type Project = {
  slug: string;
  title: string;
  category: string;
  /** Where/why it was made — e.g. "Personal project", "Pitch competition". */
  context: string;
  role: string;
  featured?: boolean;
  tagline: string;
  summary: string;
  tech: string[];
  features: string[];
  overview: string;
  problem: string;
  solution: string;
  contributions: string[];
  links: ProjectLink[];
  mock?: MockKey;
  cover?: ProjectImage;
  gallery: ProjectImage[];
};

export const projects: Project[] = [
  {
    slug: "portabledash",
    title: "PortableDash",
    category: "Native macOS Application",
    context: "Personal project",
    role: "Product design & development direction",
    featured: true,
    tagline: "Messages, music, calendar, markets and Claude, all on one second monitor.",
    summary:
      "A native macOS dashboard that unifies iMessage, Spotify, Claude, Google Calendar, a live stock ticker and websites in one customizable layout for a second monitor.",
    tech: ["Swift", "SQLite", "AppleScript", "EventKit", "WebKit"],
    features: [
      "Drag-to-resize panels",
      "Seven layout presets",
      "Eight themes",
      "Portrait-mode layouts",
      "Photo gallery",
      "Privacy mode that blurs private panels in public spaces",
    ],
    overview:
      "PortableDash is a native macOS dashboard built for a second monitor. It brings iMessage, Spotify, Claude, Google Calendar, a live stock ticker and any website into one customizable layout, so the things you check throughout the day live in one place instead of a dozen windows.",
    problem:
      "The things people glance at during a work session (messages, music, a calendar, the market, an AI chat, a few websites) are scattered across separate apps and tabs. Keeping an eye on them means constant window-switching, and none of those apps were designed to share a screen.",
    solution:
      "One native app that turns a second monitor into a dashboard. Each source lives in its own panel. Panels resize by dragging, snap into layout presets (including portrait orientations), and restyle with themes. When you're working somewhere public, privacy mode blurs the personal panels.",
    contributions: [
      "Designed the product: which sources to unify, how panels behave, and how layouts and themes work together.",
      "Directed development of the native macOS app from concept to a working dashboard.",
      "Shaped the feature set: seven layout presets, eight themes, portrait layouts, a photo gallery and privacy mode.",
    ],
    // Add a GitHub link here if/when the repo is public:
    // { label: "GitHub", href: "https://github.com/christiannguyens/...", kind: "github" },
    links: [],
    mock: "portabledash",
    gallery: [],
  },
  {
    slug: "campus-borrow",
    title: "Campus Borrow",
    category: "Student Marketplace · Full-Stack Web App",
    context: "Two-minute pitch competition",
    role: "Design, prototype & pitch",
    tagline: "Borrow what you need from someone down the hall.",
    summary:
      "An interactive prototype of a student-to-student lending marketplace that lets WashU students temporarily borrow the things they need.",
    tech: ["React", "JavaScript", "Vercel"],
    features: [
      "Search and category filters",
      "Campus pickup locations",
      "Lender dashboard",
      "Borrowing requests",
      "Separate lender and borrower experiences",
    ],
    overview:
      "Campus Borrow is a lending marketplace prototype for WashU students. Borrowers search for an item, filter by category, pick a campus pickup spot and send a request. Lenders manage their listings and incoming requests from a dashboard. It was built for a two-minute pitch competition.",
    problem:
      "Students regularly need something for a day or a weekend. Buying it new for a single use is expensive and wasteful, especially when someone nearby probably already owns one.",
    solution:
      "A marketplace scoped to campus. Borrowers browse and request items, lenders list them and handle requests, and handoffs happen at campus pickup locations. Lenders and borrowers each get their own experience, built around what they're trying to do.",
    // TODO(Christian): confirm these reflect your exact role.
    contributions: [
      "Built the interactive prototype in React and deployed it on Vercel.",
      "Designed separate lender and borrower experiences, including the lender dashboard and request flow.",
      "Presented the concept in a two-minute pitch competition.",
    ],
    links: [{ label: "Live demo", href: "https://campusborrowwashu.vercel.app", kind: "live" }],
    mock: "campusborrow",
    gallery: [],
  },
  {
    slug: "pool",
    title: "Pool",
    category: "Hackathon Project",
    context: "WashU Skandalaris Hackathon",
    role: "Team member",
    tagline: "Bulk prices, without buying in bulk.",
    summary:
      "A group-buying platform that helps college students get bulk discounts without each having to buy large quantities.",
    tech: ["Python", "TypeScript", "React", "AWS"],
    features: [
      "Coordinated purchases",
      "Demand declaration",
      "Group purchasing workflow",
      "Pickup coordination",
    ],
    overview:
      "Pool is a group-buying platform built collaboratively at the WashU Skandalaris Hackathon. Students declare what they want, join a shared purchase with others who want the same thing, and coordinate pickup, so a bulk order gets split instead of bought alone.",
    problem:
      "Bulk pricing is one of the easiest ways to save money, but it assumes you have the cash, the storage and the need for large quantities. Most college students have none of the three.",
    solution:
      "Pool lets students combine demand. Individuals declare what they need, the platform coordinates a group purchase, and pickup is organized so everyone gets their share.",
    // TODO(Christian): replace with the specific parts you owned on the team.
    contributions: [
      "Built collaboratively with a team at the WashU Skandalaris Hackathon.",
      "Helped take the idea from a concept to a working group-purchasing workflow within the hackathon.",
    ],
    links: [],
    mock: "pool",
    gallery: [],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

export const projectNumber = (slug: string) =>
  String(projects.findIndex((p) => p.slug === slug) + 1).padStart(2, "0");
