"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ExternalLink,
  FolderGit2,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { GitHubPinnedProjects } from "@/components/github-pinned-projects";
import { PROJECT_ITEMS, type ProjectItem } from "@/lib/portfolio-data";
import {
  parseStoredJson,
  useLocalValue,
  writeLocalValue,
} from "@/lib/portfolio-storage";

const CUSTOM_PROJECTS_KEY = "tejas_custom_live_projects";

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
      tagline: tagline.trim() || "Live Web Build",
      status: status.trim() || "Live",
      year: existing?.year ?? String(new Date().getFullYear()),
      description:
        description.trim() || "Production live deployment.",
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
      {/* Main / Live Featured Projects */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
            <FolderGit2 className="h-3.5 w-3.5 text-neutral-900 dark:text-neutral-100" />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              Main Live Projects
            </span>
          </div>

          {allowEdit && !formOpen && (
            <div className="flex items-center gap-2">
              {storedList !== null && (
                <button
                  type="button"
                  onClick={() => writeLocalValue(CUSTOM_PROJECTS_KEY, null)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-neutral-300 px-2.5 py-1 text-[10.5px] font-mono text-neutral-600 hover:border-neutral-950 hover:text-neutral-950 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-white dark:hover:text-white"
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
                className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-neutral-300 bg-white px-3 py-1 text-[10.5px] font-mono font-medium text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-950 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:border-white dark:hover:text-white"
              >
                <Plus className="h-3 w-3" />
                <span>Add Live Project</span>
              </button>
            </div>
          )}
        </div>

        {formOpen && (
          <form
            onSubmit={handleSave}
            className="rounded-2xl border border-neutral-300 bg-white p-5 space-y-4 dark:border-neutral-700 dark:bg-neutral-950"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {editingId ? "Edit Live Project" : "Add New Live Project"}
              </p>
              <button
                type="button"
                onClick={resetForm}
                aria-label="Close form"
                className="cursor-pointer rounded-full p-1 text-neutral-500 hover:text-neutral-950 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[10.5px] font-mono text-neutral-500 dark:text-neutral-400">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. CrossPnP"
                  className="h-9 w-full rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none focus:border-neutral-900 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10.5px] font-mono text-neutral-500 dark:text-neutral-400">
                  Live URL *
                </label>
                <input
                  type="url"
                  required
                  value={liveHref}
                  onChange={(e) => setLiveHref(e.target.value)}
                  placeholder="https://yourapp.com"
                  className="h-9 w-full rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none focus:border-neutral-900 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10.5px] font-mono text-neutral-500 dark:text-neutral-400">
                  Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Short one-line pitch"
                  className="h-9 w-full rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none focus:border-neutral-900 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10.5px] font-mono text-neutral-500 dark:text-neutral-400">
                  GitHub Repo URL (optional)
                </label>
                <input
                  type="url"
                  value={repoHref}
                  onChange={(e) => setRepoHref(e.target.value)}
                  placeholder="https://github.com/..."
                  className="h-9 w-full rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none focus:border-neutral-900 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10.5px] font-mono text-neutral-500 dark:text-neutral-400">
                  Tech Stack (comma separated)
                </label>
                <input
                  type="text"
                  value={stackInput}
                  onChange={(e) => setStackInput(e.target.value)}
                  placeholder="Next.js, PostgreSQL, Redis"
                  className="h-9 w-full rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none focus:border-neutral-900 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10.5px] font-mono text-neutral-500 dark:text-neutral-400">
                  Status Badge
                </label>
                <input
                  type="text"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  placeholder="Production / Beta"
                  className="h-9 w-full rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none focus:border-neutral-900 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10.5px] font-mono text-neutral-500 dark:text-neutral-400">
                Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What it builds and solves..."
                className="w-full rounded-xl border border-neutral-200 bg-[#FAFAFA] p-3 text-xs outline-none focus:border-neutral-900 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="text-[10.5px] font-mono text-neutral-500 dark:text-neutral-400">
                Saves to browser storage immediately. For permanent deploys, add to{" "}
                <code>PROJECT_ITEMS</code> in <code>lib/portfolio-data.ts</code>.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="cursor-pointer rounded-full border border-neutral-300 px-3.5 py-1.5 text-xs font-medium dark:border-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer rounded-full bg-neutral-950 px-4 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-neutral-950"
                >
                  {editingId ? "Update Project" : "Save Project"}
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {visibleLive.map((project) => {
            const hasCaseStudy = PROJECT_ITEMS.some(
              (item) => item.id === project.id
            );

            return (
              <div
                key={project.id}
                className="rounded-2xl border border-neutral-300 bg-white p-5 sm:p-6 transition-colors hover:border-neutral-950 dark:border-neutral-700 dark:bg-neutral-950 dark:hover:border-white space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-neutral-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {project.status}
                      </span>
                      <span>{project.year}</span>
                    </div>
                    <h3 className="mt-2 text-lg sm:text-xl font-bold tracking-tight">
                      {project.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      {project.tagline}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {project.liveHref && (
                      <a
                        href={project.liveHref}
                        target={project.liveHref.startsWith("http") ? "_blank" : undefined}
                        rel={
                          project.liveHref.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-85 dark:bg-white dark:text-neutral-950"
                      >
                        <span>Open Live</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}

                    {project.repoHref && (
                      <a
                        href={project.repoHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-semibold hover:border-neutral-950 dark:border-neutral-700 dark:hover:border-white"
                      >
                        <span>GitHub</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    )}

                    {hasCaseStudy && (
                      <Link
                        href={`${basePath}/projects/${project.id}`}
                        className="inline-flex items-center gap-1 rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-semibold hover:border-neutral-950 dark:border-neutral-700 dark:hover:border-white"
                      >
                        <span>Notes</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    )}

                    {allowEdit && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(project)}
                          aria-label={`Edit ${project.title}`}
                          className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-neutral-300 text-neutral-600 hover:border-neutral-950 hover:text-neutral-950 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-white dark:hover:text-white"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(project.id)}
                          aria-label={`Remove ${project.title}`}
                          className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-neutral-300 text-neutral-600 hover:border-red-500 hover:text-red-500 dark:border-neutral-700 dark:text-neutral-400"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[10.5px] font-mono text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showGithubMore && (
        <div className="border-t border-dashed border-neutral-200 pt-6 dark:border-neutral-800">
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
