"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Reveal } from "@/components/ui/reveal";
import { PORTFOLIO_PROFILE } from "@/lib/portfolio-data";
import {
  parseStoredJson,
  useLocalValue,
  writeLocalValue,
} from "@/lib/portfolio-storage";
import type { BlogPostMeta } from "@/lib/blog";

const CUSTOM_NOTES_KEY = "tejas_custom_blog_notes";
const EMPTY_NOTES_JSON = "[]";

export interface CustomBlogNote extends BlogPostMeta {
  body: string;
  isCustom: true;
}

export function EditableNotesFeed({
  initialPosts,
  basePath = "",
  maxItems,
}: {
  initialPosts: BlogPostMeta[];
  basePath?: string;
  maxItems?: number;
}) {
  const customRaw = useLocalValue(CUSTOM_NOTES_KEY, EMPTY_NOTES_JSON);
  const customNotes = parseStoredJson<CustomBlogNote[]>(customRaw, []);

  const [formOpen, setFormOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [readingNote, setReadingNote] = useState<CustomBlogNote | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [body, setBody] = useState("");

  const mergedNotes: Array<BlogPostMeta | CustomBlogNote> = useMemo(
    () =>
      [...customNotes, ...initialPosts].sort((a, b) =>
        b.date.localeCompare(a.date)
      ),
    [customNotes, initialPosts]
  );

  const visibleNotes = maxItems ? mergedNotes.slice(0, maxItems) : mergedNotes;

  const resetForm = () => {
    setFormOpen(false);
    setEditingSlug(null);
    setTitle("");
    setSummary("");
    setTagsInput("");
    setBody("");
  };

  const openEdit = (note: CustomBlogNote) => {
    setEditingSlug(note.slug);
    setTitle(note.title);
    setSummary(note.summary);
    setTagsInput(note.tags.join(", "));
    setBody(note.body);
    setFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const words = body.trim().split(/\s+/).length;
    const baseSlug =
      title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "note";

    const today = new Date().toISOString().slice(0, 10);
    const existing = editingSlug
      ? customNotes.find((n) => n.slug === editingSlug)
      : undefined;

    const nextNote: CustomBlogNote = {
      slug: editingSlug ?? `${baseSlug}-${customNotes.length + 1}`,
      title: title.trim(),
      date: existing?.date ?? today,
      summary:
        summary.trim() ||
        body.trim().slice(0, 140) + (body.trim().length > 140 ? "..." : ""),
      tags,
      published: true,
      readingTime: `${Math.max(1, Math.ceil(words / 180))} min read`,
      body: body.trim(),
      isCustom: true,
    };

    const nextList = editingSlug
      ? customNotes.map((n) => (n.slug === editingSlug ? nextNote : n))
      : [nextNote, ...customNotes];

    writeLocalValue(CUSTOM_NOTES_KEY, JSON.stringify(nextList));
    resetForm();
  };

  const handleDelete = (slug: string) => {
    const next = customNotes.filter((n) => n.slug !== slug);
    writeLocalValue(
      CUSTOM_NOTES_KEY,
      next.length > 0 ? JSON.stringify(next) : null
    );
    if (readingNote?.slug === slug) setReadingNote(null);
  };

  return (
    <div className="space-y-4">
      {formOpen && (
        <form
          onSubmit={handleSave}
          className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5 space-y-3 dark:border-neutral-800 dark:bg-neutral-950"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              {editingSlug ? "Edit Note" : "New Note"}
            </p>
            <button
              type="button"
              onClick={resetForm}
              className="cursor-pointer p-1 text-neutral-500 hover:text-neutral-950 dark:hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="h-9 w-full rounded-lg border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none focus:border-neutral-950 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="One-line summary (optional)"
              className="h-9 rounded-lg border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none focus:border-neutral-950 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
            />
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Tags (comma separated)"
              className="h-9 rounded-lg border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none focus:border-neutral-950 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
            />
          </div>

          <textarea
            rows={4}
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your note..."
            className="w-full rounded-lg border border-neutral-200 bg-[#FAFAFA] p-3 text-xs outline-none focus:border-neutral-950 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="cursor-pointer rounded-lg border border-neutral-200 px-3 py-1.5 text-xs dark:border-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer rounded-lg bg-neutral-950 px-3.5 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-neutral-950"
            >
              Save Note
            </button>
          </div>
        </form>
      )}

      {readingNote && (
        <div className="rounded-xl border border-neutral-300 bg-white p-5 space-y-3 dark:border-neutral-700 dark:bg-neutral-950">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                {readingNote.date} · {readingNote.readingTime}
              </p>
              <h3 className="mt-1 text-base sm:text-lg font-semibold tracking-tight">
                {readingNote.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setReadingNote(null)}
              className="cursor-pointer rounded p-1 text-neutral-500 hover:text-neutral-950 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="whitespace-pre-wrap text-[13.5px] sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {readingNote.body}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {visibleNotes.map((post) =>
          "isCustom" in post && post.isCustom ? (
            <div
              key={post.slug}
              className="group relative rounded-xl bg-neutral-100/60 p-4 sm:p-5 transition-colors hover:bg-neutral-100 dark:bg-neutral-900/45 dark:hover:bg-neutral-900/75"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setReadingNote(post)}
                  className="cursor-pointer text-left text-[15px] sm:text-base font-medium tracking-tight text-neutral-950 group-hover:underline underline-offset-4 dark:text-neutral-50"
                >
                  {post.title}
                </button>

                <div className="flex shrink-0 items-center gap-2 text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.readingTime}</span>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => openEdit(post)}
                      aria-label={`Edit ${post.title}`}
                      className="cursor-pointer p-0.5 text-neutral-500 hover:text-neutral-950 dark:hover:text-white"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(post.slug)}
                      aria-label={`Delete ${post.title}`}
                      className="cursor-pointer p-0.5 text-neutral-500 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              <p className="mt-1 text-[13px] sm:text-[13.5px] leading-relaxed text-neutral-500 dark:text-neutral-400 line-clamp-2">
                {post.summary}
              </p>

              {post.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                  {post.tags.map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <BlogFeedCard key={post.slug} post={post} basePath={basePath} />
          )
        )}
      </div>

      {!formOpen && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              resetForm();
              setFormOpen(true);
            }}
            className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-mono text-neutral-500 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
          >
            <Plus className="h-3 w-3" />
            <span>Write note</span>
          </button>
        </div>
      )}
    </div>
  );
}

export function BlogFeedCard({
  post,
  basePath = "",
}: {
  post: BlogPostMeta;
  basePath?: string;
}) {
  return (
    <Link
      href={`${basePath}/blog/${post.slug}`}
      className="group block rounded-xl bg-neutral-100/60 p-4 sm:p-5 text-left transition-colors hover:bg-neutral-100 dark:bg-neutral-900/45 dark:hover:bg-neutral-900/75"
    >
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
        <h3 className="text-[15px] sm:text-base font-medium tracking-tight text-neutral-950 group-hover:underline underline-offset-4 dark:text-neutral-50">
          {post.title}
        </h3>

        <div className="flex shrink-0 items-center gap-2 text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
          <span>{post.date}</span>
          <span>·</span>
          <span>{post.readingTime}</span>
          <ArrowUpRight className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
        </div>
      </div>

      <p className="mt-1 text-[13px] sm:text-[13.5px] leading-relaxed text-neutral-500 dark:text-neutral-400 line-clamp-2">
        {post.summary}
      </p>

      {post.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
          {post.tags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
      )}
    </Link>
  );
}

interface BlogIndexClientProps {
  posts: BlogPostMeta[];
  basePath?: string;
}

export function BlogIndexClient({
  posts,
  basePath = "",
}: BlogIndexClientProps) {
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [query, setQuery] = useState("");

  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return ["All", ...Array.from(set)];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (selectedTag !== "All" && !post.tags.includes(selectedTag)) return false;
      if (!q) return true;
      return (
        post.title.toLowerCase().includes(q) ||
        post.summary.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [posts, selectedTag, query]);

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-950 dark:bg-[#0a0a0a] dark:text-neutral-50 transition-colors">
      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-[#fafafa]/90 backdrop-blur-md dark:border-neutral-800/80 dark:bg-[#0a0a0a]/90">
        <div className="mx-auto flex h-12 max-w-[780px] items-center justify-between px-5 sm:px-7">
          <Link
            href={basePath || "/"}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to {PORTFOLIO_PROFILE.name}</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
              Blogs
            </span>
            <ThemeToggle compact monochrome />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[780px] min-h-[calc(100vh-3rem)]">
        <section className="px-5 sm:px-7 pt-10 pb-6 dark:border-neutral-800/80 space-y-5">
          <Reveal>
            <div>
              <h1 className="text-2xl sm:text-[28px] font-semibold tracking-[-0.02em]">
                Writing &amp; Notes
              </h1>
              <p className="mt-1.5 max-w-xl text-[13.5px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                Engineering logs, learnings, and daily notes.
              </p>
            </div>
          </Reveal>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => {
                const active = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`cursor-pointer rounded-md px-2 py-0.5 text-[11px] font-mono transition-colors ${
                      active
                        ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                        : "text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
                    }`}
                  >
                    {tag === "All" ? "All" : `#${tag}`}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-52">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-lg border border-neutral-200 bg-transparent pl-7 pr-2.5 py-1 text-xs text-neutral-950 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:text-white dark:focus:border-neutral-600"
              />
            </div>
          </div>
        </section>

        <section className="px-5 sm:px-7 py-10 sm:py-12">
          <EditableNotesFeed initialPosts={filteredPosts} basePath={basePath} />
        </section>
      </main>
    </div>
  );
}
