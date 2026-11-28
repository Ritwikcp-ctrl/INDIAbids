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
import { Reveal } from "@/components/reveal";
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
    const next = [
      ...activeSkills,
      { id: `${slug}-${activeSkills.length}`, name: clean },
    ];
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
      className="border-b border-neutral-200/80 px-5 sm:px-7 py-12 sm:py-14 dark:border-neutral-800/80"
    >
      <Reveal>
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <div>
            <p className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
              04 / Stack
            </p>
            <h2 className="mt-0.5 text-lg sm:text-xl font-semibold tracking-[-0.02em]">
              Skills &amp; Technologies
            </h2>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono">
            {(storedSkills !== null || storedOs !== null) && (
              <button
                type="button"
                onClick={() => {
                  writeLocalValue(SKILLS_KEY, null);
                  writeLocalValue(OS_KEY, null);
                }}
                className="inline-flex cursor-pointer items-center gap-1 text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
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
              className="inline-flex cursor-pointer items-center gap-1 text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
            >
              <Pencil className="h-3 w-3" />
              <span>{editing ? "Done" : "Edit"}</span>
            </button>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.04}>
        <div className="space-y-4">
          {editing && (
            <div className="rounded-xl border border-neutral-200/80 bg-white p-4 dark:border-neutral-800/80 dark:bg-neutral-950 space-y-2.5">
              <form
                onSubmit={handleAddSkill}
                className="flex flex-wrap items-center gap-2"
              >
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add skill (e.g. Rust, Kubernetes)"
                  className="h-8 flex-1 min-w-[200px] rounded-lg border border-neutral-200 bg-transparent px-3 text-xs outline-none focus:border-neutral-950 dark:border-neutral-800 dark:focus:border-white"
                />
                <button
                  type="submit"
                  className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg bg-neutral-950 px-3 text-xs font-medium text-white dark:bg-white dark:text-neutral-950"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add</span>
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
                  className="h-8 w-52 rounded-lg border border-neutral-200 bg-transparent px-3 text-xs font-mono outline-none focus:border-neutral-950 dark:border-neutral-800 dark:focus:border-white"
                />
                <button
                  type="submit"
                  className="h-8 cursor-pointer rounded-lg border border-neutral-200 px-3 text-[11px] font-mono hover:border-neutral-950 dark:border-neutral-800 dark:hover:border-white"
                >
                  Update OS
                </button>
              </form>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {activeSkills.map((skill) => {
              const iconKey =
                (skill.id in SKILL_ICON_MAP
                  ? (skill.id as SkillItem["id"])
                  : inferIconId(skill.name)) ?? null;
              const Icon = iconKey ? SKILL_ICON_MAP[iconKey] : Code2;

              return (
                <div
                  key={`${skill.id}-${skill.name}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-200/80 px-3 py-1.5 text-xs font-medium text-neutral-800 transition-colors hover:border-neutral-400 dark:border-neutral-800/80 dark:text-neutral-200 dark:hover:border-neutral-600"
                >
                  <Icon className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                  <span>{skill.name}</span>
                  {editing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill.id, skill.name)}
                      aria-label={`Remove ${skill.name}`}
                      className="ml-0.5 cursor-pointer text-neutral-400 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
            <span className="inline-flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
              <SiLinux className="h-3.5 w-3.5" />
              <span>Running on {activeOs.name}</span>
            </span>
            <span>{activeOs.capabilities.join(" · ")}</span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
