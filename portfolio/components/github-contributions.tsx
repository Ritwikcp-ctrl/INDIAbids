"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { ArrowUpRight, Check, Pencil, RefreshCw } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import type {
  ContributionDay,
  GitHubContributionsResponse,
} from "@/app/api/github-contributions/route";

const GITHUB_LIGHT_DOTS = [
  "#ebedf0",
  "#9be9a8",
  "#40c463",
  "#30a14e",
  "#216e39",
] as const;

const GITHUB_DARK_DOTS = [
  "#161b22",
  "#0e4429",
  "#006d32",
  "#26a641",
  "#39d353",
] as const;

const USERNAME_KEY = "tejas_github_username";
const emptySubscribe = () => () => {};
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

function saveStoredUsername(value: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (value) localStorage.setItem(USERNAME_KEY, value);
    else localStorage.removeItem(USERNAME_KEY);
  } catch {
    // Ignore storage quota errors
  }
  usernameListeners.forEach((cb) => cb());
}

function formatDateLabel(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

interface GitHubContributionGraphProps {
  defaultUsername: string;
}

export function GitHubContributionGraph({
  defaultUsername,
}: GitHubContributionGraphProps) {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const isDark = !mounted || resolvedTheme === "dark";
  const palette = isDark ? GITHUB_DARK_DOTS : GITHUB_LIGHT_DOTS;

  const activeUsername = useSyncExternalStore(
    subscribeStoredUsername,
    () => localStorage.getItem(USERNAME_KEY) || defaultUsername,
    () => defaultUsername
  );

  const [editing, setEditing] = useState(false);
  const [draftUsername, setDraftUsername] = useState(defaultUsername);
  const [refreshTick, setRefreshTick] = useState(0);
  const [data, setData] = useState<GitHubContributionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/github-contributions?username=${encodeURIComponent(activeUsername)}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("Failed to load contributions");
        const json = (await res.json()) as GitHubContributionsResponse;
        if (!controller.signal.aborted) {
          setData(json);
        }
      } catch {
        // Ignore abort or transient failure
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => controller.abort();
  }, [activeUsername, refreshTick]);

  const handleSaveUsername = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = draftUsername.trim().replace(/^@/, "");
    if (!cleaned) return;
    saveStoredUsername(cleaned === defaultUsername ? null : cleaned);
    setEditing(false);
  };

  const monthByWeek = new Map<number, string>();
  data?.monthLabels.forEach((m) => monthByWeek.set(m.weekIndex, m.label));

  return (
    <div className="rounded-xl bg-neutral-100/60 p-4 sm:p-5 space-y-4 dark:bg-neutral-900/45">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <FaGithub className="h-3.5 w-3.5 text-neutral-700 dark:text-neutral-300" />
            <p className="text-xs font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
              GitHub Activity
            </p>
          </div>

          <a
            href={`https://github.com/${encodeURIComponent(activeUsername)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-0.5 text-[11px] font-mono text-neutral-700 hover:border-neutral-400 hover:text-neutral-950 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:text-white"
          >
            <span>@{activeUsername}</span>
            <ArrowUpRight className="h-3 w-3" />
          </a>

          {data && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{
                  backgroundColor:
                    data.source === "fallback" ? "#a1a1aa" : "#26a641",
                }}
              />
              <span>
                {data.totalContributions.toLocaleString()} contributions in the last year
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {editing ? (
            <form onSubmit={handleSaveUsername} className="flex items-center gap-1.5">
              <input
                type="text"
                value={draftUsername}
                onChange={(e) => setDraftUsername(e.target.value)}
                placeholder="GitHub username"
                aria-label="GitHub username"
                className="w-36 rounded-full border border-neutral-300 bg-[#fafafa] px-2.5 py-1 text-[11px] font-mono text-neutral-950 focus:border-neutral-950 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-white"
              />
              <button
                type="submit"
                aria-label="Connect GitHub username"
                className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
              >
                <Check className="h-3 w-3" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraftUsername(activeUsername);
                setEditing(true);
              }}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-neutral-200 px-2.5 py-1 text-[10.5px] font-mono text-neutral-600 transition-colors hover:border-neutral-400 hover:text-neutral-950 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-white"
            >
              <Pencil className="h-2.5 w-2.5" />
              <span>Handle</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setRefreshTick((t) => t + 1)}
            aria-label="Refresh GitHub contributions"
            title="Refresh GitHub contributions"
            className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:border-neutral-400 hover:text-neutral-950 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-white"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        {data && data.weeks.length > 0 ? (
          <div className="inline-flex flex-col gap-1.5 min-w-max">
            <div className="flex items-center pl-7">
              <div className="flex gap-[4px]">
                {data.weeks.map((_, weekIdx) => (
                  <div
                    key={weekIdx}
                    className="w-[11px] text-[10px] font-mono leading-none text-neutral-500 dark:text-neutral-400"
                  >
                    {monthByWeek.get(weekIdx) ?? ""}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="grid grid-rows-7 gap-[4px] pt-[1px] text-[9.5px] font-mono leading-[11px] text-neutral-500 dark:text-neutral-400 select-none w-5">
                <span className="h-[11px]" />
                <span className="h-[11px]">Mon</span>
                <span className="h-[11px]" />
                <span className="h-[11px]">Wed</span>
                <span className="h-[11px]" />
                <span className="h-[11px]">Fri</span>
                <span className="h-[11px]" />
              </div>

              <div className="flex gap-[4px]">
                {data.weeks.map((week, wIdx) => (
                  <div key={wIdx} className="grid grid-rows-7 gap-[4px]">
                    {week.map((day, dIdx) =>
                      day ? (
                        <button
                          key={day.date}
                          type="button"
                          onMouseEnter={() => setHoveredDay(day)}
                          onFocus={() => setHoveredDay(day)}
                          aria-label={`${day.count} ${
                            day.count === 1 ? "contribution" : "contributions"
                          } on ${formatDateLabel(day.date)}`}
                          title={`${day.count} ${
                            day.count === 1 ? "contribution" : "contributions"
                          } on ${formatDateLabel(day.date)}`}
                          className="h-[11px] w-[11px] rounded-full transition-transform duration-150 hover:scale-125 focus:scale-125 focus:outline-none"
                          style={{
                            backgroundColor: palette[day.level],
                            boxShadow:
                              day.level === 0
                                ? isDark
                                  ? "inset 0 0 0 1px rgba(255,255,255,0.06)"
                                  : "inset 0 0 0 1px rgba(27,31,35,0.08)"
                                : "none",
                          }}
                        />
                      ) : (
                        <span
                          key={`empty-${wIdx}-${dIdx}`}
                          className="h-[11px] w-[11px]"
                        />
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-flow-col grid-rows-7 gap-[4px] py-2">
            {Array.from({ length: 52 * 7 }).map((_, idx) => (
              <span
                key={idx}
                className="h-[11px] w-[11px] animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800"
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-900">
        <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
          {hoveredDay ? (
            <>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                {hoveredDay.count === 0
                  ? "No contributions"
                  : `${hoveredDay.count} ${
                      hoveredDay.count === 1 ? "contribution" : "contributions"
                    }`}
              </span>{" "}
              on {formatDateLabel(hoveredDay.date)}
            </>
          ) : data?.source === "fallback" ? (
            "Live GitHub preview unavailable offline — connects automatically when online."
          ) : (
            "Hover any dot to inspect daily commit activity."
          )}
        </p>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
          <span>Less</span>
          {palette.map((color, idx) => (
            <span
              key={idx}
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor: color,
                boxShadow:
                  idx === 0
                    ? isDark
                      ? "inset 0 0 0 1px rgba(255,255,255,0.06)"
                      : "inset 0 0 0 1px rgba(27,31,35,0.08)"
                    : "none",
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
