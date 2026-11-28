"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  GitFork,
  Pin,
  RefreshCw,
  Star,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import type { GitHubPinnedResponse } from "@/app/api/github-pinned/route";
import { PROJECT_ITEMS } from "@/lib/portfolio-data";

const USERNAME_KEY = "tejas_github_username";
const usernameListeners = new Set<() => void>();

function subscribeStoredUsername(cb: () => void) {
  usernameListeners.add(cb);
  const onStorage = () => cb();
  window.addEventListener("storage", onStorage);
  return () => {
    usernameListeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

interface GitHubPinnedProjectsProps {
  defaultUsername: string;
  basePath?: string;
  maxItems?: number;
}

export function GitHubPinnedProjects({
  defaultUsername,
  basePath = "",
  maxItems,
}: GitHubPinnedProjectsProps) {
  const activeUsername = useSyncExternalStore(
    subscribeStoredUsername,
    () => localStorage.getItem(USERNAME_KEY) || defaultUsername,
    () => defaultUsername
  );

  const [data, setData] = useState<GitHubPinnedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/github-pinned?username=${encodeURIComponent(activeUsername)}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("Failed to load pinned repositories");
        const json = (await res.json()) as GitHubPinnedResponse;
        if (!controller.signal.aborted) {
          setData(json);
        }
      } catch {
        // Ignore abort or transient network error
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => controller.abort();
  }, [activeUsername, refreshTick]);

  const repos = data?.repos ?? [];
  const visibleRepos = maxItems ? repos.slice(0, maxItems) : repos;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
        <div className="flex flex-wrap items-center gap-2">
          <FaGithub className="h-3.5 w-3.5 text-neutral-900 dark:text-neutral-100" />
          <span>
            Pinned on{" "}
            <a
              href={`https://github.com/${encodeURIComponent(activeUsername)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-neutral-900 underline underline-offset-4 hover:opacity-75 dark:text-neutral-100"
            >
              @{activeUsername}
            </a>
          </span>
          {data && (
            <span className="rounded-full border border-neutral-200 px-2 py-0.5 text-[10px] dark:border-neutral-800">
              {maxItems && repos.length > maxItems
                ? `Showing ${visibleRepos.length} of ${repos.length} pinned`
                : `${repos.length} pinned ${repos.length === 1 ? "repo" : "repos"}`}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setRefreshTick((t) => t + 1)}
          aria-label="Refresh GitHub pinned repositories"
          className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-neutral-200 px-2.5 py-0.5 text-[10.5px] transition-colors hover:border-neutral-400 hover:text-neutral-950 dark:border-neutral-800 dark:hover:border-neutral-600 dark:hover:text-white"
        >
          <RefreshCw className={`h-2.5 w-2.5 ${loading ? "animate-spin" : ""}`} />
          <span>Sync</span>
        </button>
      </div>

      {loading && repos.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: maxItems ?? 4 }).map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleRepos.map((repo) => {
            const matchedCaseStudy = PROJECT_ITEMS.find(
              (item) =>
                item.id.toLowerCase() === repo.name.toLowerCase() ||
                item.title.toLowerCase() === repo.name.toLowerCase()
            );

            return (
              <div
                key={repo.fullName}
                className="group flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 transition-colors hover:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-white"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Pin className="h-3.5 w-3.5 shrink-0 text-neutral-500 dark:text-neutral-400" />
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-sm sm:text-base font-bold tracking-tight hover:underline underline-offset-4"
                      >
                        {repo.name}
                      </a>
                    </div>

                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${repo.fullName} on GitHub`}
                      className="inline-flex shrink-0 items-center gap-1 text-[11px] font-mono text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
                    >
                      <span>GitHub</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {repo.description}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-3 text-[11px] font-mono text-neutral-500 dark:border-neutral-900 dark:text-neutral-400">
                  <div className="flex flex-wrap items-center gap-3">
                    {repo.language && (
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: repo.languageColor || "#737373",
                          }}
                        />
                        <span>{repo.language}</span>
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      <span>{repo.stars}</span>
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <GitFork className="h-3 w-3" />
                      <span>{repo.forks}</span>
                    </span>
                  </div>

                  {matchedCaseStudy && (
                    <Link
                      href={`${basePath}/projects/${matchedCaseStudy.id}`}
                      className="inline-flex items-center gap-1 font-semibold text-neutral-900 hover:underline underline-offset-4 dark:text-neutral-100"
                    >
                      <span>Notes</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
