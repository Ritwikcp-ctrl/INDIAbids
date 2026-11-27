import Link from "next/link";
import { ArrowUpRight, BookOpen, Code2 } from "lucide-react";
import { getPostsForProject } from "@/lib/blog";

interface ProjectDevLogsProps {
  projectSlug: string;
  basePath?: string;
}

export function ProjectDevLogs({
  projectSlug,
  basePath = "",
}: ProjectDevLogsProps) {
  const logs = getPostsForProject(projectSlug);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
            Engineering Build Logs &amp; Gists
          </p>
          <h3 className="mt-1 text-base sm:text-lg font-bold tracking-tight">
            Connected Articles &amp; Snippets
          </h3>
        </div>
        <span className="rounded-full border border-neutral-300 px-2.5 py-0.5 text-[10.5px] font-mono text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
          {logs.length} {logs.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 p-5 text-xs font-mono text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          No build logs linked to <code>{projectSlug}</code> yet. Set{" "}
          <code>relatedProject: &quot;{projectSlug}&quot;</code> in any MDX post frontmatter to link it here automatically.
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((post) => (
            <Link
              key={post.slug}
              href={`${basePath}/blog/${post.slug}`}
              className="group flex flex-col gap-2.5 rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-white"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                <span className="inline-flex items-center gap-1.5">
                  {post.type === "gist" ? (
                    <Code2 className="h-3.5 w-3.5" />
                  ) : (
                    <BookOpen className="h-3.5 w-3.5" />
                  )}
                  <span className="uppercase">{post.type}</span>
                  <span>·</span>
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.readingTime}</span>
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>

              <div>
                <h4 className="text-sm font-bold group-hover:underline underline-offset-4">
                  {post.title}
                </h4>
                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {post.summary}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
