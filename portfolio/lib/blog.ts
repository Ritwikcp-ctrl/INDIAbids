import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export interface BlogPostFrontmatter {
  title: string;
  date: string; // YYYY-MM-DD
  summary: string;
  tags: string[];
  relatedProject?: string;
  published: boolean;
}

export interface BlogPostMeta extends BlogPostFrontmatter {
  slug: string;
  readingTime: string;
}

export interface BlogPostFull extends BlogPostMeta {
  content: string;
}

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function computeReadingTime(markdownBody: string): string {
  const words = markdownBody
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`[\]()-]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const mins = Math.max(1, Math.ceil(words / 180));
  return `${mins} min read`;
}

function slugToTitle(slug: string): string {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function inferSummary(markdownBody: string): string {
  const cleaned = markdownBody
    .replace(/```[\s\S]*?```/g, "")
    .split(/\n\s*\n/)
    .map((block) => block.replace(/^#+\s+/, "").trim())
    .find((block) => block.length > 0 && !block.startsWith("import "));
  if (!cleaned) return "Daily engineering note.";
  return cleaned.length > 180 ? `${cleaned.slice(0, 177)}...` : cleaned;
}

function parseDateIso(rawDate: unknown, fallbackIso: string): string {
  if (rawDate instanceof Date && !Number.isNaN(rawDate.getTime())) {
    return rawDate.toISOString().slice(0, 10);
  }
  const str = String(rawDate ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.slice(0, 10);
  }
  return fallbackIso;
}

function normalizeFrontmatter(
  data: Record<string, unknown>,
  slug: string,
  content: string,
  mtimeIso: string
): BlogPostFrontmatter {
  const tags = Array.isArray(data.tags)
    ? data.tags.map((t) => String(t).trim()).filter(Boolean)
    : [];
  const headingMatch = content.match(/^#\s+(.+)$/m);

  return {
    title: String(data.title ?? (headingMatch ? headingMatch[1].trim() : slugToTitle(slug))),
    date: parseDateIso(data.date, mtimeIso),
    summary: String(data.summary ?? "").trim() || inferSummary(content),
    tags,
    relatedProject: data.relatedProject
      ? String(data.relatedProject).trim()
      : undefined,
    published: data.published !== false,
  };
}

function isPostVisible(frontmatter: BlogPostFrontmatter): boolean {
  if (!frontmatter.published) return false;
  const todayIso = new Date().toISOString().slice(0, 10);
  return frontmatter.date <= todayIso;
}

function readAllRawPosts(): BlogPostFull[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const entries = fs.readdirSync(BLOG_DIR, { withFileTypes: true });
  const posts: BlogPostFull[] = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!/\.(mdx?|MDX?)$/.test(entry.name)) continue;

    const slug = entry.name.replace(/\.(mdx?|MDX?)$/, "");
    const fullPath = path.join(BLOG_DIR, entry.name);
    const stat = fs.statSync(fullPath);
    const mtimeIso = stat.mtime.toISOString().slice(0, 10);
    const raw = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(raw);
    const frontmatter = normalizeFrontmatter(
      data as Record<string, unknown>,
      slug,
      content,
      mtimeIso
    );

    if (!isPostVisible(frontmatter)) continue;

    posts.push({
      slug,
      ...frontmatter,
      readingTime: computeReadingTime(content),
      content,
    });
  }

  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export function getAllPublishedPosts(): BlogPostMeta[] {
  return readAllRawPosts().map((post) => {
    const { content: _unused, ...meta } = post;
    void _unused;
    return meta;
  });
}

export function getPostBySlug(slug: string): BlogPostFull | null {
  const safeSlug = slug.replace(/[^a-zA-Z0-9_-]/g, "");
  const all = readAllRawPosts();
  return all.find((p) => p.slug === safeSlug) ?? null;
}

export function getPostsForProject(projectSlug: string): BlogPostMeta[] {
  return getAllPublishedPosts().filter(
    (post) => post.relatedProject === projectSlug
  );
}
