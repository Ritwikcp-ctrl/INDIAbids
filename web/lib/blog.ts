import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type PostType = "article" | "gist";

export interface CodePreview {
  language: string;
  filename?: string;
  code: string;
}

export interface BlogPostFrontmatter {
  title: string;
  date: string; // YYYY-MM-DD
  summary: string;
  type: PostType;
  tags: string[];
  relatedProject?: string;
  gistUrl?: string;
  published: boolean;
}

export interface BlogPostMeta extends BlogPostFrontmatter {
  slug: string;
  readingTime: string;
  previewCode?: CodePreview;
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

function extractFirstCodeBlock(markdownBody: string): CodePreview | undefined {
  const match = markdownBody.match(/```([^\n]*)\n([\s\S]*?)```/);
  if (!match) return undefined;
  const metaLine = match[1].trim();
  const langMatch = metaLine.match(/^([a-zA-Z0-9_-]+)/);
  const titleMatch = metaLine.match(/title=["']([^"']+)["']/);
  const language = langMatch ? langMatch[1] : "text";
  const lines = match[2].trimEnd().split("\n").slice(0, 6);
  return {
    language,
    filename: titleMatch ? titleMatch[1] : undefined,
    code: lines.join("\n"),
  };
}

function parseDateIso(rawDate: unknown): string {
  if (rawDate instanceof Date && !Number.isNaN(rawDate.getTime())) {
    return rawDate.toISOString().slice(0, 10);
  }
  const str = String(rawDate ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.slice(0, 10);
  }
  return "1970-01-01";
}

function normalizeFrontmatter(
  data: Record<string, unknown>,
  slug: string
): BlogPostFrontmatter {
  const rawType = String(data.type ?? "article").toLowerCase();
  const type: PostType = rawType === "gist" ? "gist" : "article";
  const tags = Array.isArray(data.tags)
    ? data.tags.map((t) => String(t).trim()).filter(Boolean)
    : [];

  return {
    title: String(data.title ?? slug),
    date: parseDateIso(data.date),
    summary: String(data.summary ?? ""),
    type,
    tags,
    relatedProject: data.relatedProject
      ? String(data.relatedProject).trim()
      : undefined,
    gistUrl: data.gistUrl ? String(data.gistUrl).trim() : undefined,
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
    const raw = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(raw);
    const frontmatter = normalizeFrontmatter(
      data as Record<string, unknown>,
      slug
    );

    if (!isPostVisible(frontmatter)) continue;

    posts.push({
      slug,
      ...frontmatter,
      readingTime: computeReadingTime(content),
      previewCode: extractFirstCodeBlock(content),
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
