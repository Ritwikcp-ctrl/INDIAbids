"use client";

import { useState, type ComponentType } from "react";
import { Blocks, Code2, Cpu, Pencil, Plus, RotateCcw, X } from "lucide-react";
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
import { Reveal } from "@/components/ui/reveal";
import {
  LINUX_FOUNDATION,
  SKILLS,
  type SkillIconId,
  type SkillItem,
} from "@/lib/portfolio-data";
import {
  parseStoredJson,
  useLocalValue,
  writeLocalValue,
} from "@/lib/portfolio-storage";

const SKILLS_KEY = "tejas_custom_skills";
const OS_KEY = "tejas_custom_linux_os";

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

function inferIconId(name: string): SkillIconId | null {
  const n = name.toLowerCase();
  if (n.includes("typescript") || n === "ts") return "typescript";
  if (n.includes("javascript") || n === "js") return "javascript";
  if (n.includes("docker")) return "docker";
  if (n.includes("postgres")) return "postgresql";
  if (n.includes("express")) return "express";
  if (n.includes("solidity")) return "solidity";
  if (n.includes("redis")) return "redis";
  if (n.includes("motion")) return "motion";
  if (n.includes("system")) return "systems";
  if (n.includes("prisma")) return "prisma";
  if (n.includes("block")) return "blockchain";
  if (n.includes("mongo")) return "mongodb";
  if (n.includes("node")) return "nodejs";
  if (n.includes("github")) return "github";
  if (n.includes("linux")) return "linux";
  return null;
}

export function SkillsSection() {
  const rawSkills = useLocalValue(SKILLS_KEY, "");
  const storedSkills = rawSkills
    ? parseStoredJson<Array<{ id: string; name: string }>>(rawSkills, SKILLS)
    : null;
  const activeSkills: Array<{ id: string; name: string }> = storedSkills ?? SKILLS;

  const rawOs = useLocalValue(OS_KEY, "");
  const storedOs = rawOs
    ? parseStoredJson<typeof LINUX_FOUNDATION>(rawOs, LINUX_FOUNDATION)
    : null;
  const activeOs = storedOs ?? LINUX_FOUNDATION;

  const [editing, setEditing] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [osName, setOsName] = useState("");

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newSkill.trim();
    if (!clean) return;
    const slug =
      inferIconId(clean) ??
      (clean
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") ||
        `skill-${activeSkills.length + 1}`);
    const next = [...activeSkills, { id: `${slug}-${activeSkills.length}`, name: clean }];
    writeLocalValue(SKILLS_KEY, JSON.stringify(next));
    setNewSkill("");
  };

  const handleRemoveSkill = (id: string, name: string) => {
    const next = activeSkills.filter(
      (s) => !(s.id === id && s.name === name)
    );
    writeLocalValue(SKILLS_KEY, JSON.stringify(next));
  };

  const handleSaveOs = (e: React.FormEvent) => {
    e.preventDefault();
    if (!osName.trim()) return;
    writeLocalValue(
      OS_KEY,
      JSON.stringify({ ...activeOs, name: osName.trim() })
    );
  };

  return (
    <section
      id="skills"
      className="border-b border-neutral-200 px-5 sm:px-8 py-14 sm:py-16 dark:border-neutral-800"
    >
      <Reveal>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
              04 / Stack
            </p>
            <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight">
              Skills &amp; Technologies
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {(storedSkills !== null || storedOs !== null) && (
              <button
                type="button"
                onClick={() => {
                  writeLocalValue(SKILLS_KEY, null);
                  writeLocalValue(OS_KEY, null);
                }}
                className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-neutral-300 px-2.5 py-1 text-[10.5px] font-mono text-neutral-600 hover:border-neutral-950 hover:text-neutral-950 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-white dark:hover:text-white"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setOsName(activeOs.name);
                setEditing((prev) => !prev);
              }}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-neutral-300 bg-white px-3 py-1 text-[10.5px] font-mono font-medium text-neutral-800 hover:border-neutral-950 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:border-white"
            >
              <Pencil className="h-3 w-3" />
              <span>{editing ? "Done" : "Edit Stack"}</span>
            </button>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.04}>
        <div className="rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 overflow-hidden">
          {editing && (
            <div className="border-b border-dashed border-neutral-200 bg-[#fafafa] p-4 dark:border-neutral-800 dark:bg-neutral-900/50 space-y-3">
              <form
                onSubmit={handleAddSkill}
                className="flex flex-wrap items-center gap-2"
              >
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add skill (e.g. Rust, Kubernetes, GraphQL)"
                  className="h-8 flex-1 min-w-[200px] rounded-full border border-neutral-300 bg-white px-3 text-xs outline-none focus:border-neutral-950 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-white"
                />
                <button
                  type="submit"
                  className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-full bg-neutral-950 px-3.5 text-xs font-semibold text-white dark:bg-white dark:text-neutral-950"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Skill</span>
                </button>
              </form>

              <form
                onSubmit={handleSaveOs}
                className="flex flex-wrap items-center gap-2"
              >
                <input
                  type="text"
                  value={osName}
                  onChange={(e) => setOsName(e.target.value)}
                  placeholder="Base OS (e.g. Linux OS)"
                  className="h-8 w-52 rounded-full border border-neutral-300 bg-white px-3 text-xs font-mono outline-none focus:border-neutral-950 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-white"
                />
                <button
                  type="submit"
                  className="h-8 cursor-pointer rounded-full border border-neutral-300 px-3 text-[11px] font-mono hover:border-neutral-950 dark:border-neutral-700 dark:hover:border-white"
                >
                  Update OS
                </button>
              </form>
            </div>
          )}

          <div className="p-5 sm:p-6 flex flex-wrap gap-2.5">
            {activeSkills.map((skill) => {
              const iconKey =
                (skill.id in SKILL_ICON_MAP
                  ? (skill.id as SkillItem["id"])
                  : inferIconId(skill.name)) ?? null;
              const Icon = iconKey ? SKILL_ICON_MAP[iconKey] : Code2;

              return (
                <div
                  key={`${skill.id}-${skill.name}`}
                  className="group/skill inline-flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-[#fafafa] px-3.5 py-2.5 transition-all duration-150 hover:-translate-y-0.5 hover:border-neutral-900 hover:bg-white dark:border-neutral-800 dark:bg-neutral-900/70 dark:hover:border-neutral-400 dark:hover:bg-neutral-900"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-900 transition-colors group-hover/skill:bg-neutral-950 group-hover/skill:text-white dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:group-hover/skill:bg-white dark:group-hover/skill:text-neutral-950">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-xs sm:text-[13px] font-semibold text-neutral-950 dark:text-neutral-50">
                    {skill.name}
                  </span>
                  {editing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill.id, skill.name)}
                      aria-label={`Remove ${skill.name}`}
                      className="ml-0.5 cursor-pointer rounded-full p-0.5 text-neutral-400 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-dashed border-neutral-300 bg-neutral-950 px-5 py-4 text-white dark:border-neutral-700 dark:bg-white dark:text-neutral-950">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 dark:border-black/15 dark:bg-black/10">
                  <SiLinux className="h-5 w-5" />
                </span>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.14em] opacity-70">
                    On Top Of
                  </span>
                  <p className="text-sm font-bold tracking-tight">
                    {activeOs.name}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {activeOs.capabilities.map((cap) => (
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
