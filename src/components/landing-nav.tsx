"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const LINKS = [
  { label: "How it works", href: "#how-it-works", id: "how-it-works" },
  { label: "Features", href: "#features", id: "features" },
  { label: "Pricing", href: "#pricing", id: "pricing" },
];

export function LandingNav() {
  const pathname = usePathname();
  const onLanding = pathname === "/";
  const [activeId, setActiveId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!onLanding) return;
    const onScroll = () => {
      const y = window.scrollY + 120;
      let current: string | null = null;
      for (const link of LINKS) {
        const el = document.getElementById(link.id);
        if (el && el.offsetTop <= y) current = link.id;
      }
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 80) {
        current = LINKS[LINKS.length - 1].id;
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onLanding]);

  const isBlogActive = !onLanding && pathname.startsWith("/blog");
  const sectionActive = (id: string) => onLanding && activeId === id;
  const cls = (active: boolean) =>
    `flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition ${
      active
        ? "bg-indigo-600/15 font-medium text-indigo-300"
        : "text-zinc-400 hover:text-zinc-100"
    }`;

  return (
    <>
      <div className="hidden items-center gap-1 md:flex">
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            aria-current={sectionActive(link.id) ? "page" : undefined}
            className={cls(sectionActive(link.id))}
          >
            {link.label}
          </a>
        ))}
        <Link
          href="/blog"
          aria-current={isBlogActive ? "page" : undefined}
          className={cls(isBlogActive)}
        >
          Blog
        </Link>
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="rounded-lg border border-zinc-800 p-2 text-zinc-400 transition hover:text-zinc-100 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-72 flex-col border-l border-zinc-800 bg-zinc-950 p-4">
            <div className="flex items-center justify-between px-2 pb-4">
              <span className="text-sm font-semibold text-zinc-300">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-lg p-2 text-zinc-400 transition hover:text-zinc-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={sectionActive(link.id) ? "page" : undefined}
                  className={cls(sectionActive(link.id))}
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/blog"
                onClick={() => setOpen(false)}
                aria-current={isBlogActive ? "page" : undefined}
                className={cls(isBlogActive)}
              >
                Blog
              </Link>
            </nav>
            <div className="mt-auto flex flex-col gap-3 pt-4">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-zinc-800 px-4 py-2.5 text-center text-sm font-medium text-zinc-300 transition hover:border-zinc-600 hover:text-zinc-100"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
