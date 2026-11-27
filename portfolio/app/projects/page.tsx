"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Camera,
  FolderGit2,
  ImagePlus,
  Layers,
  RotateCcw,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/dialog";
import { Reveal } from "@/components/reveal";
import {
  PORTFOLIO_PROFILE,
  PROJECT_ITEMS,
  type ProjectItem,
} from "@/lib/portfolio-data";

const imageListeners = new Set<() => void>();

function subscribeImages(cb: () => void) {
  imageListeners.add(cb);
  const onStorage = () => cb();
  window.addEventListener("storage", onStorage);
  return () => {
    imageListeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function saveLocalImage(key: string, dataUrl: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (dataUrl) localStorage.setItem(key, dataUrl);
    else localStorage.removeItem(key);
  } catch {
    // Ignore storage quota errors
  }
  imageListeners.forEach((cb) => cb());
}

function useStoredImage(key: string, fallback = "") {
  return useSyncExternalStore(
    subscribeImages,
    () => localStorage.getItem(key) ?? fallback,
    () => fallback
  );
}

function readImageFile(file: File, onDone: (dataUrl: string) => void) {
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") onDone(reader.result);
  };
  reader.readAsDataURL(file);
}

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const statuses = [
    "All",
    ...Array.from(new Set(PROJECT_ITEMS.map((item) => item.status))),
  ];

  const filtered =
    statusFilter === "All"
      ? PROJECT_ITEMS
      : PROJECT_ITEMS.filter((item) => item.status === statusFilter);

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-950 dark:bg-[#0a0a0a] dark:text-neutral-50 transition-colors">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-[#fafafa]/90 backdrop-blur-md dark:border-neutral-800 dark:bg-[#0a0a0a]/90">
        <div className="mx-auto flex h-12 max-w-[820px] items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to {PORTFOLIO_PROFILE.username}</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              02 / Projects Archive
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[820px] border-x border-neutral-200 dark:border-neutral-800 min-h-[calc(100vh-3rem)]">
        <section className="border-b border-neutral-200 px-5 sm:px-8 py-12 sm:py-14 dark:border-neutral-800 space-y-6">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                  02 / Projects &amp; Architecture
                </p>
                <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
                  All Builds &amp; Case Studies
                </h1>
                <p className="mt-2 max-w-xl text-sm text-neutral-600 dark:text-neutral-400">
                  Production platforms, backend engines, developer tools, and open UI experiments. Click any card to inspect full architecture notes or upload a preview screenshot.
                </p>
              </div>
              <span className="rounded-full border border-neutral-300 px-3 py-1 text-[11px] font-mono text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
                {filtered.length} {filtered.length === 1 ? "project" : "projects"}
              </span>
            </div>
          </Reveal>

          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => {
              const active = statusFilter === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`cursor-pointer rounded-full border px-3 py-1 text-[11px] font-mono transition-colors ${
                    active
                      ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                      : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-500 hover:text-neutral-950 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-white"
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>
        </section>

        <section className="px-5 sm:px-8 py-12 sm:py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((project, idx) => (
              <Reveal key={project.id} delay={idx * 0.04}>
                <ProjectArchiveCard
                  project={project}
                  onInspect={() => setSelectedProject(project)}
                />
              </Reveal>
            ))}
          </div>
        </section>
      </main>

      <Dialog
        open={Boolean(selectedProject)}
        onOpenChange={(open) => !open && setSelectedProject(null)}
      >
        <DialogContent className="border-neutral-300 bg-[#fafafa] text-neutral-950 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 sm:max-w-lg">
          {selectedProject && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                  <Layers className="h-3.5 w-3.5" />
                  <span>
                    {selectedProject.year} · {selectedProject.status}
                  </span>
                </div>
                <DialogTitle className="text-xl font-bold">
                  {selectedProject.title}
                </DialogTitle>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  {selectedProject.tagline}
                </p>
              </DialogHeader>

              <div className="space-y-4 pt-2 text-sm">
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {selectedProject.description}
                </p>

                <div className="space-y-2">
                  <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                    Architecture &amp; Mechanics
                  </p>
                  <ul className="space-y-2">
                    {selectedProject.architecture.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2.5 text-xs text-neutral-700 dark:text-neutral-300"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-950 dark:bg-white" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedProject.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[10.5px] font-mono text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {(selectedProject.liveHref || selectedProject.repoHref) && (
                  <div className="flex flex-wrap items-center gap-3 border-t border-neutral-200 pt-3 dark:border-neutral-800">
                    {selectedProject.liveHref && (
                      <a
                        href={selectedProject.liveHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-3.5 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-neutral-950"
                      >
                        <span>Visit Live</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {selectedProject.repoHref && (
                      <a
                        href={selectedProject.repoHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-3.5 py-1.5 text-xs font-semibold dark:border-neutral-700"
                      >
                        <span>Source Repo</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProjectArchiveCard({
  project,
  onInspect,
}: {
  project: ProjectItem;
  onInspect: () => void;
}) {
  const storageKey = `tejas_portfolio_project_${project.id}`;
  const imgSrc = useStoredImage(storageKey, project.image ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="h-full rounded-2xl border border-neutral-200 bg-white overflow-hidden transition-colors hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-600">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) readImageFile(file, (url) => saveLocalImage(storageKey, url));
        }}
      />

      <div className="relative h-40 w-full border-b border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/60">
        {imgSrc ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imgSrc}
            alt={`${project.title} preview`}
            className="h-full w-full object-cover grayscale"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-4 text-center">
            <ImagePlus className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            <span className="text-[10.5px] font-mono text-neutral-500 dark:text-neutral-400">
              Project Screenshot Slot
            </span>
          </div>
        )}

        <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-neutral-300 bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-neutral-900 backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-950/90 dark:text-white"
          >
            <Camera className="h-3 w-3" />
            <span>{imgSrc ? "Replace" : "Upload"}</span>
          </button>
          {imgSrc && (
            <button
              type="button"
              aria-label="Reset screenshot"
              onClick={() => saveLocalImage(storageKey, null)}
              className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-neutral-300 bg-white/90 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950/90 dark:text-white"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={onInspect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onInspect();
          }
        }}
        className="group cursor-pointer p-5 space-y-3"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FolderGit2 className="h-3.5 w-3.5" />
            <span className="text-[10.5px] font-mono text-neutral-500 dark:text-neutral-400">
              {project.year} · {project.status}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-500 group-hover:text-neutral-950 dark:text-neutral-400 dark:group-hover:text-white">
            Inspect <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>

        <div>
          <h2 className="text-base font-bold">{project.title}</h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            {project.tagline}
          </p>
        </div>

        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1 pt-1">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 text-[10px] font-mono text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
