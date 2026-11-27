"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, FileText, Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/dialog";
import { Reveal } from "@/components/reveal";
import {
  BLOG_POSTS,
  PORTFOLIO_PROFILE,
  type BlogPost,
} from "@/lib/portfolio-data";

export default function BlogsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const categories = [
    "All",
    ...Array.from(new Set(BLOG_POSTS.map((post) => post.category))),
  ];

  const normalizedQuery = query.trim().toLowerCase();
  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    if (!matchesCategory) return false;
    if (!normalizedQuery) return true;
    return (
      post.title.toLowerCase().includes(normalizedQuery) ||
      post.summary.toLowerCase().includes(normalizedQuery) ||
      post.tags.some((t) => t.toLowerCase().includes(normalizedQuery))
    );
  });

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-950 dark:bg-[#0a0a0a] dark:text-neutral-50 transition-colors">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-[#fafafa]/90 backdrop-blur-md dark:border-neutral-800 dark:bg-[#0a0a0a]/90">
        <div className="mx-auto flex h-12 max-w-[940px] items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to {PORTFOLIO_PROFILE.username}</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              05 / Blogs Archive
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[940px] border-x border-neutral-200 dark:border-neutral-800 min-h-[calc(100vh-3rem)]">
        <section className="border-b border-neutral-200 px-5 sm:px-8 py-12 sm:py-14 dark:border-neutral-800 space-y-6">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                  05 / Blogs &amp; Engineering Notes
                </p>
                <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
                  Writing &amp; Deep Dives
                </h1>
                <p className="mt-2 max-w-xl text-sm text-neutral-600 dark:text-neutral-400">
                  Essays on deterministic transactions, realtime architecture, payment security, and developer tooling. To publish new posts, append entries to{" "}
                  <code className="rounded bg-neutral-200/70 px-1.5 py-0.5 text-[11px] font-mono dark:bg-neutral-800">
                    BLOG_POSTS
                  </code>{" "}
                  in{" "}
                  <code className="rounded bg-neutral-200/70 px-1.5 py-0.5 text-[11px] font-mono dark:bg-neutral-800">
                    portfolio/lib/portfolio-data.ts
                  </code>
                  .
                </p>
              </div>
              <span className="rounded-full border border-neutral-300 px-3 py-1 text-[11px] font-mono text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
                {filteredPosts.length} {filteredPosts.length === 1 ? "article" : "articles"}
              </span>
            </div>
          </Reveal>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`cursor-pointer rounded-full border px-3 py-1 text-[11px] font-mono transition-colors ${
                      active
                        ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                        : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-500 hover:text-neutral-950 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter articles..."
                className="w-full rounded-full border border-neutral-300 bg-white pl-8 pr-3 py-1.5 text-xs text-neutral-950 placeholder:text-neutral-400 focus:border-neutral-950 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:focus:border-white"
              />
            </div>
          </div>
        </section>

        <section className="px-5 sm:px-8 py-12 sm:py-14">
          {filteredPosts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-800">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                No blog articles match your current filter.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post, idx) => (
                <Reveal key={post.slug} delay={idx * 0.04}>
                  <button
                    type="button"
                    onClick={() => setSelectedPost(post)}
                    className="group flex w-full cursor-pointer flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 text-left transition-colors hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-600"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                      <span className="inline-flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        <span>{post.category}</span>
                        <span>·</span>
                        <span>{post.date}</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span>{post.readTime}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h2 className="text-base sm:text-lg font-bold tracking-tight group-hover:underline underline-offset-4">
                        {post.title}
                      </h2>
                      <p className="text-xs sm:text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                        {post.summary}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[10.5px] font-mono text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>
          )}
        </section>
      </main>

      <Dialog
        open={Boolean(selectedPost)}
        onOpenChange={(open) => !open && setSelectedPost(null)}
      >
        <DialogContent className="border-neutral-300 bg-[#fafafa] text-neutral-950 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 sm:max-w-xl max-h-[85vh] overflow-y-auto">
          {selectedPost && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                  <FileText className="h-3.5 w-3.5" />
                  <span>
                    {selectedPost.category} · {selectedPost.date} · {selectedPost.readTime}
                  </span>
                </div>
                <DialogTitle className="text-xl font-bold leading-snug">
                  {selectedPost.title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  {selectedPost.summary}
                </p>

                <div className="space-y-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                  {selectedPost.body.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                  {selectedPost.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[10.5px] font-mono text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
