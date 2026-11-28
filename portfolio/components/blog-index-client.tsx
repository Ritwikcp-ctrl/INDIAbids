"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Code2,
  ExternalLink,
  FolderGit2,
  Search,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Reveal } from "@/components/reveal";
import { PORTFOLIO_PROFILE, PROJECT_ITEMS } from "@/lib/portfolio-data";
import type { BlogPostMeta, PostType } from "@/lib/blog";

interface BlogIndexClientProps {
  posts: BlogPostMeta[];
  basePath?: string;
}

export function BlogFeedCard({
  post,
  basePath = "",
}: {
  post: BlogPostMeta;
  basePath?: string;
}) {
  const project = post.relatedProject
    ? PROJECT_ITEMS.find((p) => p.id === post.relatedProject)
    : undefined;
  const isGist = post.type === "gist";

  return (
    <Link
      href={`${basePath}/blog/${post.slug}`}
      className="group block rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 text-left transition-colors hover:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
              isGist
                ? "border-neutral-900 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                : "border-neutral-300 bg-neutral-100 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            }`}
          >
            {isGist ? (
              <Code2 className="h-3 w-3" />
            ) : (
              <BookOpen className="h-3 w-3" />
            )}
            <span>{isGist ? "Gist" : "Article"}</span>
          </span>

          <span>{post.date}</span>
          <span>·</span>
          <span>{post.readingTime}</span>

          {project && (
            <span className="inline-flex items-center gap-1 rounded border border-neutral-200 bg-[#fafafa] px-2 py-0.5 text-[10px] text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
              <FolderGit2 className="h-3 w-3" />
              <span>{project.title}</span>
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-1 font-semibold text-neutral-500 group-hover:text-neutral-950 dark:text-neutral-400 dark:group-hover:text-white">
          <span>{isGist ? "Inspect Gist" : "Read"}</span>
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>

      <div className="mt-3 space-y-1.5">
        <h2 className="text-base sm:text-lg font-bold tracking-tight group-hover:underline underline-offset-4">
          {post.title}
        </h2>
        <p className="text-xs sm:text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          {post.summary}
        </p>
      </div>

      {isGist && post.previewCode && (
        <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-[#fafafa] dark:border-neutral-800 dark:bg-[#0d0d0d]">
          <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-100/80 px-3 py-1.5 text-[10.5px] font-mono text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-400">
            <span>{post.previewCode.filename || `snippet.${post.previewCode.language}`}</span>
            <span className="flex items-center gap-1.5 uppercase">
              <span>{post.previewCode.language}</span>
              {post.gistUrl && <ExternalLink className="h-2.5 w-2.5" />}
            </span>
          </div>
          <pre className="overflow-x-auto px-3.5 py-2.5 font-mono text-[11.5px] leading-relaxed text-neutral-800 dark:text-neutral-200">
            <code>{post.previewCode.code}</code>
          </pre>
        </div>
      )}

      {post.tags.length > 0 && (
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[10.5px] font-mono text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

export function BlogIndexClient({
  posts,
  basePath = "",
}: BlogIndexClientProps) {
  const [typeFilter, setTypeFilter] = useState<"all" | PostType>("all");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [query, setQuery] = useState("");

  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return ["All", ...Array.from(set)];
  }, [posts]);

  const counts = useMemo(() => {
    const articles = posts.filter((p) => p.type === "article").length;
    const gists = posts.filter((p) => p.type === "gist").length;
    return { all: posts.length, articles, gists };
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (typeFilter !== "all" && post.type !== typeFilter) return false;
      if (selectedTag !== "All" && !post.tags.includes(selectedTag)) return false;
      if (!q) return true;
      return (
        post.title.toLowerCase().includes(q) ||
        post.summary.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q)) ||
        (post.previewCode?.code.toLowerCase().includes(q) ?? false)
      );
    });
  }, [posts, typeFilter, selectedTag, query]);

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-950 dark:bg-[#0a0a0a] dark:text-neutral-50 transition-colors">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-[#fafafa]/90 backdrop-blur-md dark:border-neutral-800 dark:bg-[#0a0a0a]/90">
        <div className="mx-auto flex h-12 max-w-[940px] items-center justify-between px-5 sm:px-8">
          <Link
            href={basePath || "/"}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to {PORTFOLIO_PROFILE.name}</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              05 / Blogs &amp; Gists
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
                  05 / Engineering Blog &amp; Gist Stream
                </p>
                <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
                  Articles, Dev Logs &amp; Code Gists
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
                  Deep-dive MDX essays linked directly to production case studies alongside standalone copy-ready Gist snippets. Drop <code className="rounded bg-neutral-200/70 px-1.5 py-0.5 text-[11px] font-mono dark:bg-neutral-800">.mdx</code> / <code className="rounded bg-neutral-200/70 px-1.5 py-0.5 text-[11px] font-mono dark:bg-neutral-800">.md</code> files inside <code className="rounded bg-neutral-200/70 px-1.5 py-0.5 text-[11px] font-mono dark:bg-neutral-800">content/blog/</code> to publish automatically on schedule.
                </p>
              </div>
              <span className="rounded-full border border-neutral-300 px-3 py-1 text-[11px] font-mono text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
                {filteredPosts.length} visible
              </span>
            </div>
          </Reveal>

          {/* Type Filter Tabs + Search Input */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="inline-flex rounded-full border border-neutral-300 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-950 w-fit">
              {(
                [
                  { id: "all", label: `All (${counts.all})` },
                  { id: "article", label: `Articles (${counts.articles})` },
                  { id: "gist", label: `Gists (${counts.gists})` },
                ] as const
              ).map((tab) => {
                const active = typeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTypeFilter(tab.id)}
                    className={`cursor-pointer rounded-full px-3.5 py-1 text-[11px] font-mono font-semibold transition-colors ${
                      active
                        ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                        : "text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts, tags, code..."
                className="w-full rounded-full border border-neutral-300 bg-white pl-8 pr-3 py-1.5 text-xs text-neutral-950 placeholder:text-neutral-400 focus:border-neutral-950 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:focus:border-white"
              />
            </div>
          </div>

          {/* Tag Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => {
              const active = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`cursor-pointer rounded-full border px-2.5 py-0.5 text-[10.5px] font-mono transition-colors ${
                    active
                      ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                      : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-500 hover:text-neutral-950 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-white"
                  }`}
                >
                  {tag === "All" ? "All Tags" : `#${tag}`}
                </button>
              );
            })}
          </div>
        </section>

        <section className="px-5 sm:px-8 py-12 sm:py-14">
          {filteredPosts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-800">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                No articles or code gists match your active filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post, idx) => (
                <Reveal key={post.slug} delay={idx * 0.03}>
                  <BlogFeedCard post={post} basePath={basePath} />
                </Reveal>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
