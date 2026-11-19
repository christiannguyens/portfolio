/**
 * TECH STACK: rendered as a "table of elements".
 * `usedIn` should only list project slugs where the tool is documented.
 */

export type StackItem = {
  name: string;
  symbol: string;
  description: string;
  usedIn?: string[];
};

export type StackGroup = { category: string; items: StackItem[] };

export const stack: StackGroup[] = [
  {
    category: "Languages & libraries",
    items: [
      { name: "Swift", symbol: "Sw", description: "Apple's language for native apps.", usedIn: ["portabledash"] },
      { name: "Java", symbol: "Jv", description: "Statically typed and object-oriented." },
      { name: "JavaScript", symbol: "Js", description: "The language of the web.", usedIn: ["campus-borrow"] },
      { name: "React", symbol: "Re", description: "Component-based UI library for the web.", usedIn: ["campus-borrow", "pool"] },
    ],
  },
  {
    category: "Frameworks & APIs",
    items: [
      { name: "SwiftUI", symbol: "Su", description: "Apple's declarative UI framework." },
      { name: "AppKit", symbol: "Ak", description: "The framework underneath classic macOS apps." },
      { name: "WebKit", symbol: "Wk", description: "Apple's web engine, embeddable inside native apps.", usedIn: ["portabledash"] },
      { name: "EventKit", symbol: "Ek", description: "Apple's API for calendar events and reminders.", usedIn: ["portabledash"] },
    ],
  },
  {
    category: "Data & integrations",
    items: [
      { name: "SQLite", symbol: "Sq", description: "A small, fast, file-based SQL database.", usedIn: ["portabledash"] },
      { name: "AppleScript", symbol: "As", description: "Scripting and automation for macOS apps.", usedIn: ["portabledash"] },
      { name: "REST APIs", symbol: "Ra", description: "Talking to other services over HTTP." },
    ],
  },
  {
    category: "Tools",
    items: [
      { name: "Vercel", symbol: "Vc", description: "Hosting and deploys for web apps.", usedIn: ["campus-borrow"] },
      { name: "Claude Code", symbol: "Cc", description: "Anthropic's agentic coding tool for the terminal." },
      { name: "Google Workspace", symbol: "Gw", description: "Docs, Sheets and Slides: where plans get written." },
      { name: "CapCut", symbol: "Cp", description: "Short-form video editing." },
    ],
  },
];
