"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Reveal } from "@/components/reveal";
import { GitHubPinnedProjects } from "@/components/github-pinned-projects";
import { PORTFOLIO_PROFILE } from "@/lib/portfolio-data";

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-950 dark:bg-[#0a0a0a] dark:text-neutral-50 transition-colors">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-[#fafafa]/90 backdrop-blur-md dark:border-neutral-800 dark:bg-[#0a0a0a]/90">
        <div className="mx-auto flex h-12 max-w-[940px] items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to {PORTFOLIO_PROFILE.name}</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              02 / GitHub Pinned Projects
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[940px] border-x border-neutral-200 dark:border-neutral-800 min-h-[calc(100vh-3rem)]">
        <section className="border-b border-neutral-200 px-5 sm:px-8 py-12 sm:py-14 dark:border-neutral-800 space-y-4">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                  02 / Projects
                </p>
                <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
                  GitHub Pinned Repositories
                </h1>
                <p className="mt-2 max-w-xl text-sm text-neutral-600 dark:text-neutral-400">
                  Synced directly from the pinned repositories on{" "}
                  <span className="font-mono text-neutral-900 dark:text-neutral-100">
                    github.com/{PORTFOLIO_PROFILE.githubUsername}
                  </span>
                  .
                </p>
              </div>
              <a
                href={PORTFOLIO_PROFILE.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-3.5 py-1.5 text-xs font-semibold hover:border-neutral-950 dark:border-neutral-700 dark:hover:border-white"
              >
                <span>Open GitHub Profile</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </Reveal>
        </section>

        <section className="px-5 sm:px-8 py-12 sm:py-14">
          <GitHubPinnedProjects
            defaultUsername={PORTFOLIO_PROFILE.githubUsername}
            basePath=""
          />
        </section>
      </main>
    </div>
  );
}
