import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { formatDate } from "@/lib/format";
import { NewsletterForm } from "@/components/newsletter-form";

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.meta.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: `${post.meta.title} — TPMForge`,
    description: post.meta.description,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { meta, Component } = post;

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <Link
        href="/blog"
        className="text-sm text-indigo-400 transition hover:text-indigo-300"
      >
        ← Back to blog
      </Link>

      <div className="mt-6">
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 font-medium text-indigo-300">
            {meta.category}
          </span>
          <span>{formatDate(meta.date)}</span>
          <span>·</span>
          <span>{meta.readingMinutes} min read</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-50">
          {meta.title}
        </h1>
        <p className="mt-3 text-base text-zinc-400">{meta.description}</p>
      </div>

      <article className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-sm text-zinc-300">
        <Component />
      </article>

      <div className="mt-10 rounded-2xl border border-zinc-800 bg-gradient-to-br from-indigo-950/40 to-zinc-900/60 p-8 text-center">
        <h2 className="text-lg font-semibold text-zinc-100">
          Enjoyed this? Get more in your inbox
        </h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-zinc-500">
          Practical TPM advice twice a month. No spam, unsubscribe anytime.
        </p>
        <div className="mx-auto mt-5 max-w-md">
          <NewsletterForm />
        </div>
      </div>
    </div>
  );
}
