import { NextRequest, NextResponse } from "next/server";

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface MonthLabel {
  label: string;
  weekIndex: number;
}

export interface GitHubContributionsResponse {
  username: string;
  totalContributions: number;
  weeks: (ContributionDay | null)[][];
  monthLabels: MonthLabel[];
  source: "github" | "github-api" | "fallback";
  fetchedAt: string;
}

const DEFAULT_USERNAME = "Ritwikcp-ctrl";
const GITHUB_USERNAME_RE = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function clampLevel(val: number): 0 | 1 | 2 | 3 | 4 {
  if (val <= 0 || Number.isNaN(val)) return 0;
  if (val === 1) return 1;
  if (val === 2) return 2;
  if (val === 3) return 3;
  return 4;
}

function buildCalendarGrid(days: ContributionDay[]): {
  weeks: (ContributionDay | null)[][];
  monthLabels: MonthLabel[];
} {
  if (days.length === 0) {
    return { weeks: [], monthLabels: [] };
  }

  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const firstDate = new Date(`${sorted[0].date}T00:00:00Z`);
  const leadingEmpty = firstDate.getUTCDay();

  const cells: (ContributionDay | null)[] = [
    ...Array.from({ length: leadingEmpty }, () => null),
    ...sorted,
  ];

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks: (ContributionDay | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const monthLabels: MonthLabel[] = [];
  let lastMonth = -1;

  weeks.forEach((week, weekIndex) => {
    const firstValidDay = week.find((d): d is ContributionDay => d !== null);
    if (!firstValidDay) return;
    const month = new Date(`${firstValidDay.date}T00:00:00Z`).getUTCMonth();
    if (month !== lastMonth) {
      const prev = monthLabels[monthLabels.length - 1];
      if (!prev || weekIndex - prev.weekIndex >= 2) {
        monthLabels.push({ label: MONTHS[month], weekIndex });
      }
      lastMonth = month;
    }
  });

  return { weeks, monthLabels };
}

function parseGitHubHtml(html: string): {
  days: ContributionDay[];
  totalContributions: number;
} {
  const tooltips = new Map<string, number>();
  const tooltipRe = /<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([\s\S]*?)<\/tool-tip>/gi;
  let tipMatch: RegExpExecArray | null;

  while ((tipMatch = tooltipRe.exec(html)) !== null) {
    const targetId = tipMatch[1];
    const rawText = tipMatch[2].replace(/<[^>]+>/g, " ").trim();
    const countMatch = rawText.match(/^(\d[\d,]*)\s+contribution/i);
    const count = countMatch ? Number(countMatch[1].replace(/,/g, "")) : 0;
    tooltips.set(targetId, Number.isFinite(count) ? count : 0);
  }

  const days: ContributionDay[] = [];
  const tdRe = /<td\b([^>]*\bdata-date="\d{4}-\d{2}-\d{2}"[^>]*)>/gi;
  let tdMatch: RegExpExecArray | null;

  while ((tdMatch = tdRe.exec(html)) !== null) {
    const attrs = tdMatch[1];
    const dateMatch = attrs.match(/\bdata-date="(\d{4}-\d{2}-\d{2})"/i);
    if (!dateMatch) continue;

    const levelMatch = attrs.match(/\bdata-level="([0-4])"/i);
    const idMatch = attrs.match(/\bid="([^"]+)"/i);

    const level = clampLevel(levelMatch ? Number(levelMatch[1]) : 0);
    const tipCount = idMatch ? tooltips.get(idMatch[1]) : undefined;
    const inferredCount = tipCount ?? (level === 0 ? 0 : level * 2);

    days.push({
      date: dateMatch[1],
      count: inferredCount,
      level,
    });
  }

  const headerMatch = html.match(
    /([\d,]+)\s+contributions?\s+in\s+(?:the\s+last\s+year|\d{4})/i
  );
  const parsedTotal = headerMatch
    ? Number(headerMatch[1].replace(/,/g, ""))
    : NaN;
  const summed = days.reduce((acc, day) => acc + day.count, 0);

  return {
    days,
    totalContributions:
      Number.isFinite(parsedTotal) && parsedTotal >= summed ? parsedTotal : summed,
  };
}

function buildFallbackDays(): ContributionDay[] {
  const days: ContributionDay[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const totalDays = 52 * 7 + today.getUTCDay() + 1;

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const seed = (d.getUTCDate() * 7 + (d.getUTCMonth() + 1) * 13 + i) % 11;
    const level = clampLevel(
      seed <= 2 ? 0 : seed <= 4 ? 1 : seed <= 7 ? 2 : seed <= 9 ? 3 : 4
    );
    days.push({
      date: iso,
      count: level === 0 ? 0 : level * 2,
      level,
    });
  }
  return days;
}

export async function GET(request: NextRequest) {
  const rawUsername = request.nextUrl.searchParams.get("username")?.trim() || DEFAULT_USERNAME;
  const username = GITHUB_USERNAME_RE.test(rawUsername)
    ? rawUsername
    : DEFAULT_USERNAME;

  try {
    const htmlRes = await fetch(
      `https://github.com/users/${encodeURIComponent(username)}/contributions`,
      {
        headers: {
          "User-Agent": "Tejas-Portfolio/1.0",
          Accept: "text/html,application/xhtml+xml",
        },
        next: { revalidate: 1800 },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (htmlRes.ok) {
      const html = await htmlRes.text();
      const parsed = parseGitHubHtml(html);

      if (parsed.days.length > 0) {
        const { weeks, monthLabels } = buildCalendarGrid(parsed.days);
        const payload: GitHubContributionsResponse = {
          username,
          totalContributions: parsed.totalContributions,
          weeks,
          monthLabels,
          source: "github",
          fetchedAt: new Date().toISOString(),
        };
        return NextResponse.json(payload, {
          headers: {
            "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
          },
        });
      }
    }
  } catch {
    // Fall through to secondary mirror
  }

  try {
    const apiRes = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`,
      {
        headers: { "User-Agent": "Tejas-Portfolio/1.0" },
        next: { revalidate: 1800 },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (apiRes.ok) {
      const json = (await apiRes.json()) as {
        total?: { lastYear?: number };
        contributions?: Array<{ date: string; count: number; level: number }>;
      };

      const rawDays = Array.isArray(json.contributions) ? json.contributions : [];
      if (rawDays.length > 0) {
        const days: ContributionDay[] = rawDays.map((item) => ({
          date: item.date,
          count: Math.max(0, Number(item.count) || 0),
          level: clampLevel(Number(item.level) || 0),
        }));
        const total =
          typeof json.total?.lastYear === "number"
            ? json.total.lastYear
            : days.reduce((sum, d) => sum + d.count, 0);
        const { weeks, monthLabels } = buildCalendarGrid(days);

        const payload: GitHubContributionsResponse = {
          username,
          totalContributions: total,
          weeks,
          monthLabels,
          source: "github-api",
          fetchedAt: new Date().toISOString(),
        };
        return NextResponse.json(payload, {
          headers: {
            "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
          },
        });
      }
    }
  } catch {
    // Fall through to offline fallback
  }

  const fallbackDays = buildFallbackDays();
  const { weeks, monthLabels } = buildCalendarGrid(fallbackDays);
  const payload: GitHubContributionsResponse = {
    username,
    totalContributions: fallbackDays.reduce((sum, d) => sum + d.count, 0),
    weeks,
    monthLabels,
    source: "fallback",
    fetchedAt: new Date().toISOString(),
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
