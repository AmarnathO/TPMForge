"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { Logo } from "@/components/logo";

export function AppShell({
  user,
  children,
}: {
  user: { email: string };
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/readiness", label: "Readiness" },
    { href: "/dashboard/radar", label: "Radar" },
    { href: "/dashboard/roadmap", label: "Roadmap" },
    { href: "/dashboard/coach", label: "Coach" },
    { href: "/dashboard/practice", label: "Practice" },
    { href: "/dashboard/product-agent", label: "Product" },
    { href: "/dashboard/progress", label: "Progress" },
  ];

  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const navItemClass = (href: string) =>
    `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition ${
      isActive(href)
        ? "bg-indigo-600/15 font-medium text-indigo-200"
        : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
    }`;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <Logo size={32} withWordmark />
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={navItemClass(link.href)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-zinc-500 sm:block">
              {user.email}
            </span>
            <form action={signOut} className="hidden md:block">
              <button
                type="submit"
                className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-100"
              >
                Sign out
              </button>
            </form>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="rounded-lg border border-zinc-800 p-2 text-zinc-400 transition hover:text-zinc-100 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-72 flex-col border-l border-zinc-800 bg-zinc-950 p-4">
            <div className="flex items-center justify-between px-2 pb-4">
              <span className="truncate text-sm text-zinc-500">{user.email}</span>
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
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={navItemClass(link.href)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <form action={signOut} className="mt-auto pt-4">
              <button
                type="submit"
                className="w-full rounded-lg border border-zinc-800 px-3 py-2.5 text-sm text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-100"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}

      <main className="flex-1">{children}</main>
    </div>
  );
}
