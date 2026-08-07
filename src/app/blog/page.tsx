import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { NewsletterForm } from "@/components/newsletter-form";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Blog — TPMForge",
  description:
    "Practical advice for engineers and professionals becoming Technical Program Managers.",
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-indigo-400">The TPMForge Blog</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50">
          From engineer to TPM, one competency at a time
        </h1>
        <p className="mt-3 text-zinc-400">
          Field notes on readiness, evidence, and the roadmap to a technical
          program management career.
        </p>
      </div>

      <div className="mt-10 space-y-4">
        {posts.map(({ meta }) => (
          <Link
            key={meta.slug}
            href={`/blog/${meta.slug}`}
            className="group block rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 transition hover:border-indigo-500/50 hover:bg-zinc-900/70"
          >
            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <span className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 font-medium text-indigo-300">
                {meta.category}
              </span>
              <span>{formatDate(meta.date)}</span>
              <span>·</span>
              <span>{meta.readingMinutes} min read</span>
            </div>
            <h2 className="mt-3 text-xl font-semibold text-zinc-100 transition group-hover:text-indigo-200">
              {meta.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              {meta.description}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-14 rounded-2xl border border-zinc-800 bg-gradient-to-br from-indigo-950/40 to-zinc-900/60 p-8 text-center">
        <h2 className="text-lg font-semibold text-zinc-100">
          Get the next post in your inbox
        </h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-zinc-500">
          Practical TPM advice twice a month. Readiness tips, resume mapping,
          and real roadmap strategies.
        </p>
        <div className="mx-auto mt-5 max-w-md">
          <NewsletterForm />
        </div>
      </div>
    </div>
  );
}
