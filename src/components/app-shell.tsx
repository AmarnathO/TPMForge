import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { Logo } from "@/components/logo";

export function AppShell({
  user,
  children,
}: {
  user: { email: string };
  children: React.ReactNode;
}) {
  const navLinks = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/readiness", label: "Readiness" },
    { href: "/dashboard/radar", label: "Radar" },
    { href: "/dashboard/roadmap", label: "Roadmap" },
    { href: "/dashboard/coach", label: "Coach" },
    { href: "/dashboard/practice", label: "Practice" },
    { href: "/dashboard/progress", label: "Progress" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Logo size={32} withWordmark />
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-100"
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
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-100"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
