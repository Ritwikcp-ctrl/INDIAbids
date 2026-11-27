"use client";

import type { ComponentType } from "react";
import { Blocks, Cpu } from "lucide-react";
import {
  SiDocker,
  SiExpress,
  SiFramer,
  SiGithub,
  SiJavascript,
  SiLinux,
  SiMongodb,
  SiNodedotjs,
  SiPostgresql,
  SiPrisma,
  SiRedis,
  SiSolidity,
  SiTypescript,
} from "react-icons/si";
import { Reveal } from "@/components/reveal";
import {
  LINUX_FOUNDATION,
  SKILL_GROUPS,
  type SkillIconId,
} from "@/lib/portfolio-data";

const SKILL_ICON_MAP: Record<
  SkillIconId,
  ComponentType<{ className?: string }>
> = {
  javascript: SiJavascript,
  typescript: SiTypescript,
  systems: Cpu,
  nodejs: SiNodedotjs,
  express: SiExpress,
  motion: SiFramer,
  postgresql: SiPostgresql,
  prisma: SiPrisma,
  mongodb: SiMongodb,
  redis: SiRedis,
  blockchain: Blocks,
  solidity: SiSolidity,
  docker: SiDocker,
  github: SiGithub,
  linux: SiLinux,
};

export function SkillsSection() {
  return (
    <section
      id="skills"
      className="border-b border-neutral-200 px-5 sm:px-8 py-14 sm:py-16 dark:border-neutral-800"
    >
      <Reveal>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
              04 / Stack &amp; Systems
            </p>
            <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight">
              Skills &amp; Technologies
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              Core engineering stack — spanning runtime backends, datastores, Web3, motion, and systems programming on Linux.
            </p>
          </div>
          <span className="rounded-full border border-neutral-300 px-3 py-1 text-[10.5px] font-mono text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
            14 core tools · Linux OS
          </span>
        </div>
      </Reveal>

      <Reveal delay={0.04}>
        <div className="relative rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-dashed divide-neutral-200 dark:divide-neutral-800">
            {SKILL_GROUPS.map((group, groupIdx) => (
              <div
                key={group.group}
                className={`p-5 sm:p-6 space-y-4 ${
                  groupIdx >= 2
                    ? "md:border-t md:border-dashed md:border-neutral-200 dark:md:border-neutral-800"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                    0{groupIdx + 1} · {group.group}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-600">
                    [{group.items.length}]
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {group.items.map((skill) => {
                    const Icon = SKILL_ICON_MAP[skill.id];
                    return (
                      <div
                        key={skill.id}
                        className="group/skill inline-flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-[#fafafa] px-3 py-2 transition-all duration-150 hover:-translate-y-0.5 hover:border-neutral-900 hover:bg-white dark:border-neutral-800 dark:bg-neutral-900/70 dark:hover:border-neutral-400 dark:hover:bg-neutral-900"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-900 transition-colors group-hover/skill:bg-neutral-950 group-hover/skill:text-white dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:group-hover/skill:bg-white dark:group-hover/skill:text-neutral-950">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <div className="leading-tight">
                          <p className="text-xs font-semibold text-neutral-950 dark:text-neutral-50">
                            {skill.name}
                          </p>
                          <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                            {skill.sub}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-neutral-300 bg-neutral-950 px-5 py-4 text-white dark:border-neutral-700 dark:bg-white dark:text-neutral-950">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 dark:border-black/15 dark:bg-black/10">
                  <SiLinux className="h-5 w-5" />
                </span>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.14em] opacity-70">
                    Running On Top Of
                  </span>
                  <p className="text-sm font-bold tracking-tight">
                    {LINUX_FOUNDATION.name}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {LINUX_FOUNDATION.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className="rounded-md border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-mono opacity-90 dark:border-black/15 dark:bg-black/5"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
