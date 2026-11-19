"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/data/site";
import { useActiveSection } from "@/lib/hooks";
import { ICONS, MONOGRAM } from "@/lib/pixel";
import { cn, EASE_OUT } from "@/lib/utils";
import { GitHubIcon, LinkedInIcon } from "../ui/Icons";
import { LocalTime } from "../ui/LocalTime";
import { PixelGlyph } from "../ui/PixelGlyph";

const ids = site.nav.map((n) => n.id);

export function Nav({ ticker }: { ticker?: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const active = useActiveSection(ids, isHome);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const href = (id: string) => (isHome ? `#${id}` : `/#${id}`);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
          scrolled || open
            ? "border-b border-line bg-ink/80 backdrop-blur-md"
            : "border-b border-transparent bg-transparent",
        )}
      >
        {ticker}
        <div className="container-x flex h-16 items-center justify-between gap-6">
          <Link
            href="/"
            className="group flex items-center gap-3"
            aria-label={`${site.name}, home`}
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                window.scrollTo({ top: 0 });
                history.replaceState(null, "", "/");
              }
            }}
          >
            <PixelGlyph rows={MONOGRAM} size={2} className="text-paper transition-colors group-hover:text-accent" />
            <span className="hidden text-[13px] font-medium tracking-[-0.01em] sm:block">{site.name}</span>
          </Link>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {site.nav.map((item, i) => {
                const isActive = active === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={href(item.id)}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "relative flex items-center gap-1.5 px-3 py-2 text-[13px] transition-colors",
                        isActive ? "text-paper" : "text-muted hover:text-paper",
                      )}
                    >
                      <span className={cn("font-pixel text-[8px]", isActive ? "text-accent" : "text-faint")}>
                        0{i + 1}
                      </span>
                      {item.label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-x-3 -bottom-[13px] h-px bg-accent"
                          transition={{ type: "spring", stiffness: 380, damping: 34 }}
                        />
                      )}
                    </a>
                  </li>
                );
              })}
              <li>
                <Link
                  href={site.wall.href}
                  aria-current={pathname.startsWith(site.wall.href) ? "page" : undefined}
                  className={cn(
                    "relative ml-2 flex items-center gap-1.5 border-l border-line py-2 pl-4 pr-3 text-[13px] transition-colors",
                    pathname.startsWith(site.wall.href) ? "text-paper" : "text-muted hover:text-paper",
                  )}
                >
                  <PixelGlyph rows={ICONS.star} size={1.6} className="text-accent" />
                  {site.wall.label}
                  {pathname.startsWith(site.wall.href) && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-3 -bottom-[13px] h-px bg-accent"
                      transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    />
                  )}
                </Link>
              </li>
            </ul>
          </nav>

          <div className="flex items-center gap-4">
            <span className="hidden lg:block">
              <LocalTime className="font-mono text-[11px] text-dim" />
            </span>
            <button
              type="button"
              className="flex h-9 items-center gap-2 border border-line px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-paper md:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="relative block h-2 w-3.5" aria-hidden>
                <span
                  className={cn(
                    "absolute left-0 top-0 h-px w-full bg-current transition-transform duration-300",
                    open && "translate-y-1 rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "absolute bottom-0 left-0 h-px w-full bg-current transition-transform duration-300",
                    open && "-translate-y-[3px] -rotate-45",
                  )}
                />
              </span>
              {open ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col bg-ink pt-[5.75rem] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <nav aria-label="Mobile" className="container-x flex-1 overflow-y-auto pt-8">
              <ul className="border-t border-line">
                {site.nav.map((item, i) => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.05, duration: 0.6, ease: EASE_OUT }}
                    className="border-b border-line"
                  >
                    <a
                      href={href(item.id)}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline gap-4 py-5 text-4xl font-medium tracking-[-0.03em]"
                    >
                      <span className="font-pixel text-[11px] text-accent">0{i + 1}</span>
                      {item.label}
                    </a>
                  </motion.li>
                ))}
                <motion.li
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + site.nav.length * 0.05, duration: 0.6, ease: EASE_OUT }}
                  className="border-b border-line"
                >
                  <Link
                    href={site.wall.href}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-4 py-5 text-4xl font-medium tracking-[-0.03em]"
                  >
                    <PixelGlyph rows={ICONS.star} size={2} className="text-accent" />
                    {site.wall.label}
                  </Link>
                </motion.li>
              </ul>
            </nav>
            <div className="container-x flex items-center justify-between border-t border-line py-5">
              <LocalTime stacked className="font-mono text-[11px] text-dim" />
              <div className="flex items-center gap-5 text-muted">
                <a href={site.socials.github.href} target="_blank" rel="noreferrer" aria-label="GitHub">
                  <GitHubIcon size={18} />
                </a>
                <a href={site.socials.linkedin.href} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                  <LinkedInIcon size={18} />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
