"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  FileText,
  FolderGit2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Reveal } from "@/components/reveal";
import { PORTFOLIO_PROFILE, PROJECT_ITEMS } from "@/lib/portfolio-data";
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
          {mergedNotes.length} published {mergedNotes.length === 1 ? "note" : "notes"}
        </span>
        {!formOpen && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setFormOpen(true);
            }}
            className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-neutral-300 bg-white px-3 py-1 text-[10.5px] font-mono font-medium text-neutral-800 hover:border-neutral-950 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:border-white"
          >
            <Plus className="h-3 w-3" />
            <span>Write Note</span>
          </button>
        )}
      </div>

      {formOpen && (
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-neutral-300 bg-white p-5 space-y-3 dark:border-neutral-700 dark:bg-neutral-950"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {editingSlug ? "Edit Note" : "Write Daily Note"}
            </p>
            <button
              type="button"
              onClick={resetForm}
              className="cursor-pointer p-1 text-neutral-500 hover:text-neutral-950 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="h-9 w-full rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none focus:border-neutral-950 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Short summary (optional)"
              className="h-9 rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none focus:border-neutral-950 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
            />
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Tags (comma separated: AI, CrossPnP)"
              className="h-9 rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none focus:border-neutral-950 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
            />
          </div>

          <textarea
            rows={4}
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your note content..."
            className="w-full rounded-xl border border-neutral-200 bg-[#FAFAFA] p-3 text-xs outline-none focus:border-neutral-950 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10.5px] font-mono text-neutral-500 dark:text-neutral-400">
              Saved in browser. For permanent public pages, save `.md` inside <code>content/blog/</code>.
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="cursor-pointer rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium dark:border-neutral-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="cursor-pointer rounded-full bg-neutral-950 px-4 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-neutral-950"
              >
                Save Note
              </button>
            </div>
          </div>
        </form>
      )}

      {readingNote && (
        <div className="rounded-2xl border border-neutral-900 bg-white p-6 space-y-3 dark:border-white dark:bg-neutral-950">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                {readingNote.date} · {readingNote.readingTime}
              </p>
              <h3 className="mt-1 text-lg font-bold">{readingNote.title}</h3>
            </div>
            <button
              type="button"
              onClick={() => setReadingNote(null)}
              className="cursor-pointer rounded-full p-1 text-neutral-500 hover:text-neutral-950 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="whitespace-pre-wrap text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {readingNote.body}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {visibleNotes.map((post) =>
          "isCustom" in post && post.isCustom ? (
            <div
              key={post.slug}
              className="group rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 transition-colors hover:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-white"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.readingTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEdit(post)}
                    aria-label={`Edit ${post.title}`}
                    className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-neutral-200 text-neutral-500 hover:border-neutral-950 hover:text-neutral-950 dark:border-neutral-800 dark:hover:border-white dark:hover:text-white"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(post.slug)}
                    aria-label={`Delete ${post.title}`}
                    className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-neutral-200 text-neutral-500 hover:border-red-500 hover:text-red-500 dark:border-neutral-800"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setReadingNote(post)}
                className="mt-3 block w-full cursor-pointer text-left space-y-1.5"
              >
                <h3 className="text-base sm:text-lg font-bold tracking-tight group-hover:underline underline-offset-4">
                  {post.title}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {post.summary}
                </p>
              </button>

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
            </div>
          ) : (
            <BlogFeedCard key={post.slug} post={post} basePath={basePath} />
          )
        )}
      </div>
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
  const project = post.relatedProject
    ? PROJECT_ITEMS.find((p) => p.id === post.relatedProject)
    : undefined;

  return (
    <Link
      href={`${basePath}/blog/${post.slug}`}
      className="group block rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 text-left transition-colors hover:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
        <div className="flex flex-wrap items-center gap-2">
          <FileText className="h-3.5 w-3.5" />
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
          <span>Read Note</span>
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
              05 / Daily Notes
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
                  05 / Daily Blog Notes
                </p>
                <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
                  Notes &amp; Engineering Journal
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
                  Public engineering logs and daily Markdown notes. Save any <code className="rounded bg-neutral-200/70 px-1.5 py-0.5 text-[11px] font-mono dark:bg-neutral-800">.md</code> or <code className="rounded bg-neutral-200/70 px-1.5 py-0.5 text-[11px] font-mono dark:bg-neutral-800">.mdx</code> file in <code className="rounded bg-neutral-200/70 px-1.5 py-0.5 text-[11px] font-mono dark:bg-neutral-800">content/blog/</code> — or write quick notes right here.
                </p>
              </div>
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
                    className={`cursor-pointer rounded-full border px-2.5 py-0.5 text-[10.5px] font-mono transition-colors ${
                      active
                        ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                        : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-500 hover:text-neutral-950 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-white"
                    }`}
                  >
                    {tag === "All" ? "All Notes" : `#${tag}`}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notes..."
                className="w-full rounded-full border border-neutral-300 bg-white pl-8 pr-3 py-1.5 text-xs text-neutral-950 placeholder:text-neutral-400 focus:border-neutral-950 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:focus:border-white"
              />
            </div>
          </div>
        </section>

        <section className="px-5 sm:px-8 py-12 sm:py-14">
          <EditableNotesFeed initialPosts={filteredPosts} basePath={basePath} />
        </section>
      </main>
    </div>
  );
}
