"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Reveal } from "@/components/ui/reveal";
import { ProjectsShowcase } from "@/components/portfolio/projects-showcase";
import { PORTFOLIO_PROFILE } from "@/lib/portfolio-data";

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-950 dark:bg-[#0a0a0a] dark:text-neutral-50 transition-colors">
      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-[#fafafa]/90 backdrop-blur-md dark:border-neutral-800/80 dark:bg-[#0a0a0a]/90">
        <div className="mx-auto flex h-12 max-w-[780px] items-center justify-between px-5 sm:px-7">
          <Link
            href="/tejas"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to {PORTFOLIO_PROFILE.name}</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
              Projects
            </span>
            <ThemeToggle compact monochrome />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[780px] min-h-[calc(100vh-3rem)]">
        <section className="px-5 sm:px-7 pt-10 pb-4 space-y-4">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-[28px] font-semibold tracking-[-0.02em]">
                  Projects
                </h1>
                <p className="mt-1.5 max-w-xl text-[13.5px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                  Live products and pinned repositories from{" "}
                  <span className="font-mono text-neutral-700 dark:text-neutral-300">
                    @{PORTFOLIO_PROFILE.githubUsername}
                  </span>
                  .
                </p>
              </div>
              <a
                href={PORTFOLIO_PROFILE.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-mono text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
              >
                <span>GitHub</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </Reveal>
        </section>

        <section className="px-5 sm:px-7 pb-12">
          <ProjectsShowcase
            defaultUsername={PORTFOLIO_PROFILE.githubUsername}
            basePath="/tejas"
          />
        </section>
      </main>
    </div>
  );
}
