import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, FolderGit2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { MdxContent } from "@/components/mdx-content";
import { getAllPublishedPosts, getPostBySlug } from "@/lib/blog";
import { PORTFOLIO_PROFILE, PROJECT_ITEMS } from "@/lib/portfolio-data";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllPublishedPosts().map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return {
      title: `Note Not Found · ${PORTFOLIO_PROFILE.handle}`,
    };
  }
  return {
    title: `${post.title} · ${PORTFOLIO_PROFILE.handle}`,
    description: post.summary,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const relatedProject = post.relatedProject
    ? PROJECT_ITEMS.find((p) => p.id === post.relatedProject)
    : undefined;

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-950 dark:bg-[#0a0a0a] dark:text-neutral-50 transition-colors">
      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-[#fafafa]/90 backdrop-blur-md dark:border-neutral-800/80 dark:bg-[#0a0a0a]/90">
        <div className="mx-auto flex h-12 max-w-[780px] items-center justify-between px-5 sm:px-7">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Notes</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
              {post.date}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[780px] min-h-[calc(100vh-3rem)]">
        <article className="px-5 sm:px-7 py-10 sm:py-12 space-y-8">
          <header className="space-y-3 border-b border-neutral-200/80 pb-7 dark:border-neutral-800/80">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
              <span>{post.date}</span>
              <span>·</span>
              <span>{post.readingTime}</span>
            </div>

            <h1 className="text-2xl sm:text-[28px] font-semibold tracking-[-0.02em] leading-tight">
              {post.title}
            </h1>

            <p className="text-[14px] sm:text-[15px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {post.summary}
            </p>

            {post.tags.length > 0 && (
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
            )}
          </header>

          <MdxContent source={post.content} />

          {relatedProject && (
            <section className="pt-8 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
              <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                Related Case Study
              </p>
              <Link
                href={`/projects/${relatedProject.id}`}
                className="group block rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 transition-colors hover:border-neutral-950 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-white"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                    <FolderGit2 className="h-3.5 w-3.5" />
                    <span>
                      {relatedProject.year} · {relatedProject.status}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-600 group-hover:text-neutral-950 dark:text-neutral-400 dark:group-hover:text-white">
                    <span>Open Case Study</span>
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>

                <h2 className="mt-2 text-lg font-bold tracking-tight">
                  {relatedProject.title}
                </h2>
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {relatedProject.tagline}
                </p>
                <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {relatedProject.description}
                </p>

                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {relatedProject.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[10px] font-mono text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </Link>
            </section>
          )}
        </article>
      </main>
    </div>
  );
}
