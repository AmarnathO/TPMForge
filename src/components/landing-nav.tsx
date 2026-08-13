"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { label: "How it works", href: "#how-it-works", id: "how-it-works" },
  { label: "Features", href: "#features", id: "features" },
  { label: "Pricing", href: "#pricing", id: "pricing" },
];

export function LandingNav() {
  const pathname = usePathname();
  const onLanding = pathname === "/";
  const [activeId, setActiveId] = useState<string | null>(null);

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

  return (
    <div className="hidden items-center gap-1 md:flex">
      {LINKS.map((link) => {
        const active = onLanding && activeId === link.id;
        return (
          <a
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-4 py-2 text-sm transition ${
              active
                ? "bg-indigo-600/15 font-medium text-indigo-300"
                : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            {link.label}
          </a>
        );
      })}
      <Link
        href="/blog"
        aria-current={!onLanding && pathname.startsWith("/blog") ? "page" : undefined}
        className={`rounded-lg px-4 py-2 text-sm transition ${
          !onLanding && pathname.startsWith("/blog")
            ? "bg-indigo-600/15 font-medium text-indigo-300"
            : "text-zinc-400 hover:text-zinc-100"
        }`}
      >
        Blog
      </Link>
    </div>
  );
}
