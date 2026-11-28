"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ExternalLink,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { GitHubPinnedProjects } from "@/components/portfolio/github-pinned-projects";
import { PROJECT_ITEMS, type ProjectItem } from "@/lib/portfolio-data";
import {
  parseStoredJson,
  useLocalValue,
  writeLocalValue,
} from "@/lib/portfolio-storage";

const CUSTOM_PROJECTS_KEY = "tejas_custom_live_projects";

function getStatusBadge(status: string) {
  const s = status.trim().toLowerCase();
  if (s === "live" || s === "production ready") {
    return {
      label: "Live",
      dotClass: "bg-emerald-500",
      pillClass:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    };
  }
  if (s === "building" || s === "in progress") {
    return {
      label: "Building",
      dotClass: "bg-red-500",
      pillClass: "bg-red-500/10 text-red-600 dark:text-red-400",
    };
  }
  return {
    label: status || "Not Started",
    dotClass: "bg-neutral-400 dark:bg-neutral-500",
    pillClass: "bg-neutral-500/10 text-neutral-500 dark:text-neutral-400",
  };
}

interface ProjectsShowcaseProps {
  defaultUsername: string;
  basePath?: string;
  maxMain?: number;
  maxGithub?: number;
  showGithubMore?: boolean;
  allowEdit?: boolean;
}

export function ProjectsShowcase({
  defaultUsername,
  basePath = "",
  maxMain,
  maxGithub,
  showGithubMore = true,
  allowEdit = true,
}: ProjectsShowcaseProps) {
  const customRaw = useLocalValue(CUSTOM_PROJECTS_KEY, "");
  const storedList = customRaw
    ? parseStoredJson<ProjectItem[]>(customRaw, PROJECT_ITEMS)
    : null;
  const combinedLive = storedList ?? PROJECT_ITEMS;
  const visibleLive = maxMain ? combinedLive.slice(0, maxMain) : combinedLive;

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [liveHref, setLiveHref] = useState("");
  const [repoHref, setRepoHref] = useState("");
  const [stackInput, setStackInput] = useState("");
  const [status, setStatus] = useState("Live");

  const resetForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setTitle("");
    setTagline("");
    setDescription("");
    setLiveHref("");
    setRepoHref("");
    setStackInput("");
    setStatus("Live");
  };

  const handleOpenEdit = (proj: ProjectItem) => {
    setEditingId(proj.id);
    setTitle(proj.title);
    setTagline(proj.tagline);
    setDescription(proj.description);
    setLiveHref(proj.liveHref ?? "");
    setRepoHref(proj.repoHref ?? "");
    setStackInput(proj.stack.join(", "));
    setStatus(proj.status);
    setFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    const stack = stackInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const baseSlug =
      cleanTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "project";

    const existing = editingId
      ? combinedLive.find((p) => p.id === editingId)
      : undefined;

    const item: ProjectItem = {
      id: editingId ?? `${baseSlug}-${combinedLive.length + 1}`,
      title: cleanTitle,
      tagline: tagline.trim() || "Project",
      status: status.trim() || "Live",
      year: existing?.year ?? String(new Date().getFullYear()),
      description: description.trim() || "Building and shipping.",
      architecture: existing?.architecture ?? [],
      stack: stack.length > 0 ? stack : ["TypeScript", "Next.js"],
      liveHref: liveHref.trim() || undefined,
      repoHref: repoHref.trim() || undefined,
      featured: true,
    };

    const nextList = editingId
      ? combinedLive.map((p) => (p.id === editingId ? item : p))
      : [item, ...combinedLive];

    writeLocalValue(CUSTOM_PROJECTS_KEY, JSON.stringify(nextList));
    resetForm();
  };

  const handleDelete = (id: string) => {
    writeLocalValue(
      CUSTOM_PROJECTS_KEY,
      JSON.stringify(combinedLive.filter((p) => p.id !== id))
    );
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {formOpen && (
          <form
            onSubmit={handleSave}
            className="rounded-xl bg-neutral-100/60 p-4 sm:p-5 space-y-3 dark:bg-neutral-900/50"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                {editingId ? "Edit Project" : "Add Project"}
              </p>
              <button
                type="button"
                onClick={resetForm}
                aria-label="Close form"
                className="cursor-pointer p-1 text-neutral-500 hover:text-neutral-950 dark:hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Project title *"
                className="h-9 w-full rounded-lg border border-neutral-200/80 bg-[#FAFAFA] px-3 text-xs outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-neutral-600"
              />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                aria-label="Project status"
                className="h-9 w-full rounded-lg border border-neutral-200/80 bg-[#FAFAFA] px-3 text-xs outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-neutral-600"
              >
                <option value="Live">Live (Green)</option>
                <option value="Building">Building (Red)</option>
                <option value="Not Started">Not Started (Gray)</option>
              </select>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Tagline"
                className="h-9 w-full rounded-lg border border-neutral-200/80 bg-[#FAFAFA] px-3 text-xs outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-neutral-600"
              />
              <input
                type="url"
                value={liveHref}
                onChange={(e) => setLiveHref(e.target.value)}
                placeholder="Live URL (optional)"
                className="h-9 w-full rounded-lg border border-neutral-200/80 bg-[#FAFAFA] px-3 text-xs outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-neutral-600"
              />
              <input
                type="url"
                value={repoHref}
                onChange={(e) => setRepoHref(e.target.value)}
                placeholder="GitHub URL (optional)"
                className="h-9 w-full rounded-lg border border-neutral-200/80 bg-[#FAFAFA] px-3 text-xs outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-neutral-600"
              />
              <input
                type="text"
                value={stackInput}
                onChange={(e) => setStackInput(e.target.value)}
                placeholder="Tech stack (comma separated)"
                className="h-9 w-full rounded-lg border border-neutral-200/80 bg-[#FAFAFA] px-3 text-xs outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-neutral-600"
              />
            </div>

            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What it does..."
              className="w-full rounded-lg border border-neutral-200/80 bg-[#FAFAFA] p-3 text-xs outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-neutral-600"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="cursor-pointer rounded-lg border border-neutral-200 px-3 py-1.5 text-xs dark:border-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="cursor-pointer rounded-lg bg-neutral-950 px-3.5 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-neutral-950"
              >
                {editingId ? "Update" : "Save"}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {visibleLive.map((project) => {
            const hasCaseStudy =
              project.architecture && project.architecture.length > 0;
            const badge = getStatusBadge(project.status);

            return (
              <div
                key={project.id}
                className="group rounded-xl bg-neutral-100/60 p-4 sm:p-5 transition-colors hover:bg-neutral-100 dark:bg-neutral-900/45 dark:hover:bg-neutral-900/75 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-[15px] sm:text-base font-medium tracking-tight text-neutral-950 dark:text-neutral-50">
                      {project.title}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${badge.pillClass}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${badge.dotClass}`}
                      />
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    {project.liveHref && (
                      <a
                        href={project.liveHref}
                        target={
                          project.liveHref.startsWith("http")
                            ? "_blank"
                            : undefined
                        }
                        rel={
                          project.liveHref.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="inline-flex items-center gap-1 font-medium text-neutral-900 hover:underline underline-offset-4 dark:text-neutral-100"
                      >
                        <span>Live</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}

                    {project.repoHref && (
                      <a
                        href={project.repoHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
                      >
                        <span>GitHub</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    )}

                    {hasCaseStudy && (
                      <Link
                        href={`${basePath}/projects/${project.id}`}
                        className="inline-flex items-center gap-0.5 text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
                      >
                        <span>Notes</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    )}

                    {allowEdit && (
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(project)}
                          aria-label={`Edit ${project.title}`}
                          className="cursor-pointer p-0.5 text-neutral-500 hover:text-neutral-950 dark:hover:text-white"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(project.id)}
                          aria-label={`Remove ${project.title}`}
                          className="cursor-pointer p-0.5 text-neutral-500 hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-[13.5px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {project.description}
                </p>

                {project.stack.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-0.5 text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                    {project.stack.map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {allowEdit && !formOpen && (
          <div className="flex items-center justify-end gap-3">
            {storedList !== null && (
              <button
                type="button"
                onClick={() => writeLocalValue(CUSTOM_PROJECTS_KEY, null)}
                className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                resetForm();
                setFormOpen(true);
              }}
              className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-mono text-neutral-500 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
            >
              <Plus className="h-3 w-3" />
              <span>Add project</span>
            </button>
          </div>
        )}
      </div>

      {showGithubMore && (
        <div className="pt-2">
          <GitHubPinnedProjects
            defaultUsername={defaultUsername}
            basePath={basePath}
            maxItems={maxGithub}
            excludeNames={combinedLive.map((p) => p.title)}
            headingLabel="More Projects on GitHub"
          />
        </div>
      )}
    </div>
  );
}
