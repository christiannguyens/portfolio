/**
 * Core personal info. Edit this file to change anything that appears
 * across the site (name, links, emails, portrait, navigation).
 */

export type PortraitPalette = "tint" | "mono" | "original";

export const site = {
  name: "Christian Nguyens",
  firstName: "Christian",
  initials: "CN",
  /** Production URL — used for SEO, Open Graph and the sitemap. */
  url: "https://christiannguyens.vercel.app",
  title: "Christian Nguyens — Business + Computer Science at WashU",
  description:
    "Christian Nguyens is a Business + Computer Science student at Washington University in St. Louis who builds software and turns ideas into working products.",

  status: "Currently building",
  location: "St. Louis, Missouri & Charlotte, North Carolina",
  locationShort: "St. Louis, MO & Charlotte, NC",
  cities: ["St. Louis, MO", "Charlotte, NC"],
  /** WashU Danforth Campus — shown as a small detail in the hero/footer. */
  coordinates: "38.6488° N, 90.3108° W",
  /** Live clocks shown in the nav, menu and footer. */
  clocks: [
    { label: "STL", timeZone: "America/Chicago" },
    { label: "CLT", timeZone: "America/New_York" },
  ],

  education: {
    school: "Washington University in St. Louis",
    schoolShort: "WashU",
    degree: "Bachelor of Science in Business and Computer Science",
    program: "Business + Computer Science",
    programShort: "BUCS",
    expected: "May 2030",
    classOf: 2030,
    honors: ["Taylor Scholar"],
  },

  emails: [
    { label: "School", address: "nguyens@wustl.edu" },
    { label: "Personal", address: "nguyenschristian@gmail.com" },
  ],

  socials: {
    github: {
      label: "GitHub",
      handle: "@christiannguyens",
      href: "https://github.com/christiannguyens",
    },
    linkedin: {
      label: "LinkedIn",
      handle: "in/christian-nguyens",
      href: "https://linkedin.com/in/christian-nguyens",
    },
  },

  /**
   * PORTRAIT
   * Replace /public/images/portrait.jpg to change it (portrait orientation,
   * face in the upper third works best). Set `src` to null to show the
   * generated placeholder silhouette instead.
   *
   * palette: "tint" (accent-pink dithered), "mono" (greyscale), or
   * "original" (pixelated, real colours).
   */
  portrait: {
    src: "/images/portrait.jpg" as string | null,
    alt: "Portrait of Christian Nguyens",
    palette: "tint" as PortraitPalette,
  },

  /** Extra page tab shown after the section links. */
  wall: { href: "/wall", label: "The Wall" },

  nav: [
    { id: "about", label: "About" },
    { id: "work", label: "Work" },
    { id: "experience", label: "Experience" },
    { id: "stack", label: "Stack" },
    { id: "contact", label: "Contact" },
  ],
} as const;

export const isDev = process.env.NODE_ENV === "development";
