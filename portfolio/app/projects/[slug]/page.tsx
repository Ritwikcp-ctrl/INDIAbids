import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, Layers } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProjectDevLogs } from "@/components/project-dev-logs";
import { PORTFOLIO_PROFILE, PROJECT_ITEMS } from "@/lib/portfolio-data";

interface ProjectCaseStudyProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return PROJECT_ITEMS.map((project) => ({
    slug: project.id,
  }));
}

export async function generateMetadata({
  params,
}: ProjectCaseStudyProps): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECT_ITEMS.find((p) => p.id === slug);
  if (!project) {
    return {
      title: `Case Study Not Found · ${PORTFOLIO_PROFILE.handle}`,
    };
  }
  return {
    title: `${project.title} · Case Study · ${PORTFOLIO_PROFILE.handle}`,
    description: project.description,
  };
}

export default async function ProjectCaseStudyPage({
  params,
}: ProjectCaseStudyProps) {
  const { slug } = await params;
  const project = PROJECT_ITEMS.find((p) => p.id === slug);
  if (!project) notFound();

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-950 dark:bg-[#0a0a0a] dark:text-neutral-50 transition-colors">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-[#fafafa]/90 backdrop-blur-md dark:border-neutral-800 dark:bg-[#0a0a0a]/90">
        <div className="mx-auto flex h-12 max-w-[940px] items-center justify-between px-5 sm:px-8">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Projects</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              Case Study · {project.year}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[940px] border-x border-neutral-200 dark:border-neutral-800 min-h-[calc(100vh-3rem)]">
        <section className="border-b border-neutral-200 px-5 sm:px-8 py-12 sm:py-14 dark:border-neutral-800 space-y-6">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
            <Layers className="h-3.5 w-3.5" />
            <span>
              {project.year} · {project.status}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {project.title}
            </h1>
            <p className="text-sm sm:text-base font-medium text-neutral-600 dark:text-neutral-400">
              {project.tagline}
            </p>
          </div>

          <p className="text-sm sm:text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
            {project.description}
          </p>

          <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 dark:border-neutral-800 dark:bg-neutral-950">
            <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
              System Architecture &amp; Mechanics
            </p>
            <ul className="space-y-2.5">
              {project.architecture.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-950 dark:bg-white" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex flex-wrap gap-1.5">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-[11px] font-mono text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {project.liveHref && (
                <a
                  href={project.liveHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-4 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-neutral-950"
                >
                  <span>Visit Live</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              )}
              {project.repoHref && (
                <a
                  href={project.repoHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-4 py-1.5 text-xs font-semibold dark:border-neutral-700"
                >
                  <span>Source Repo</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </section>

        <section className="px-5 sm:px-8 py-12 sm:py-14">
          <ProjectDevLogs projectSlug={project.id} basePath="" />
        </section>
      </main>
    </div>
  );
}
