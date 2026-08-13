import Link from "next/link";
import { Logo } from "@/components/logo";
import { NewsletterForm } from "@/components/newsletter-form";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-800/70 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={30} withWordmark />
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/blog"
              className="rounded-lg bg-indigo-600/15 px-4 py-2 text-sm font-medium text-indigo-300 transition hover:text-indigo-200"
            >
              Blog
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-zinc-800/70">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <div className="flex items-center gap-2.5">
                <Logo size={28} withWordmark />
              </div>
              <p className="mt-3 max-w-sm text-sm text-zinc-500">
                The engineering-to-TPM learning platform. Map your resume,
                build evidence, follow a real roadmap.
              </p>
            </div>
            <div className="md:justify-self-end">
              <p className="text-sm font-semibold text-zinc-200">
                Get new posts in your inbox
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Practical TPM advice, twice a month. No spam.
              </p>
              <div className="mt-4 max-w-sm">
                <NewsletterForm />
              </div>
            </div>
          </div>
          <p className="mt-10 text-xs text-zinc-600">
            © {new Date().getFullYear()} TPMForge. Built for aspiring TPMs.
          </p>
        </div>
      </footer>
    </div>
  );
}
