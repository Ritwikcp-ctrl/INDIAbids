import { NextRequest, NextResponse } from "next/server";

export interface GitHubPinnedRepo {
  id: string;
  name: string;
  owner: string;
  fullName: string;
  description: string;
  url: string;
  homepage?: string;
  language: string | null;
  languageColor: string | null;
  stars: number;
  forks: number;
  topics: string[];
  updatedAt?: string;
}

export interface GitHubPinnedResponse {
  username: string;
  repos: GitHubPinnedRepo[];
  source: "github-pinned" | "github-repos" | "fallback";
  fetchedAt: string;
}

const DEFAULT_USERNAME = "Ritwikcp-ctrl";
const GITHUB_USERNAME_RE = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

function decodeHtml(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(html: string): string {
  return decodeHtml(html.replace(/<[^>]+>/g, " "));
}

function parseCompactCount(raw: string): number {
  const clean = raw.replace(/,/g, "").trim().toLowerCase();
  if (!clean) return 0;
  if (clean.endsWith("k")) {
    const val = parseFloat(clean.slice(0, -1));
    return Number.isFinite(val) ? Math.round(val * 1000) : 0;
  }
  const val = parseInt(clean, 10);
  return Number.isFinite(val) ? val : 0;
}

function parsePinnedHtml(html: string, defaultOwner: string): GitHubPinnedRepo[] {
  const repos: GitHubPinnedRepo[] = [];

  // GitHub wraps each pinned card inside <li ... pinned-item-list-item ...>...</li>
  const liRe = /<li\b[^>]*pinned-item-list-item[^>]*>([\s\S]*?)<\/li>/gi;
  let match: RegExpExecArray | null;

  while ((match = liRe.exec(html)) !== null) {
    const block = match[1];

    const linkMatch = block.match(
      /<a\b[^>]*href="\/([a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+)"[^>]*>[\s\S]*?<span\b[^>]*class="[^"]*\brepo\b[^"]*"[^>]*>([\s\S]*?)<\/span>/i
    );
    const fullName = linkMatch ? linkMatch[1] : "";
    const repoName = linkMatch ? stripTags(linkMatch[2]) : "";

    if (!fullName || !repoName) continue;

    const [owner, name] = fullName.split("/");
    const descMatch = block.match(
      /<p\b[^>]*class="[^"]*pinned-item-desc[^"]*"[^>]*>([\s\S]*?)<\/p>/i
    );
    const description = descMatch
      ? stripTags(descMatch[1])
      : "Pinned GitHub repository.";

    const langMatch = block.match(
      /<span\b[^>]*itemprop="programmingLanguage"[^>]*>([\s\S]*?)<\/span>/i
    );
    const language = langMatch ? stripTags(langMatch[1]) : null;

    const colorMatch = block.match(
      /class="[^"]*repo-language-color[^"]*"[^>]*style="[^"]*background-color:\s*(#[0-9a-fA-F]{3,8})/i
    ) ||
      block.match(
        /style="[^"]*background-color:\s*(#[0-9a-fA-F]{3,8})[^"]*"[^>]*class="[^"]*repo-language-color/i
      );
    const languageColor = colorMatch ? colorMatch[1] : null;

    const starsMatch = block.match(
      /<a\b[^>]*href="[^"]+\/stargazers"[^>]*>([\s\S]*?)<\/a>/i
    );
    const forksMatch = block.match(
      /<a\b[^>]*href="[^"]+\/forks"[^>]*>([\s\S]*?)<\/a>/i
    );

    const stars = starsMatch ? parseCompactCount(stripTags(starsMatch[1])) : 0;
    const forks = forksMatch ? parseCompactCount(stripTags(forksMatch[1])) : 0;

    repos.push({
      id: name.toLowerCase(),
      name,
      owner: owner || defaultOwner,
      fullName,
      description,
      url: `https://github.com/${fullName}`,
      language,
      languageColor,
      stars,
      forks,
      topics: [],
    });
  }

  return repos;
}

const FALLBACK_PINNED: GitHubPinnedRepo[] = [
  {
    id: "indiabids",
    name: "INDIAbids",
    owner: DEFAULT_USERNAME,
    fullName: `${DEFAULT_USERNAME}/INDIAbids`,
    description:
      "Deterministic two-tier paid leaderboard across 23 industry sectors & 36 Indian states with PostgreSQL advisory locks, Redis ZSET rankings & Razorpay settlement.",
    url: `https://github.com/${DEFAULT_USERNAME}/INDIAbids`,
    language: "TypeScript",
    languageColor: "#3178c6",
    stars: 0,
    forks: 0,
    topics: ["nextjs", "typescript", "postgresql", "redis"],
  },
];

export async function GET(request: NextRequest) {
  const rawUsername =
    request.nextUrl.searchParams.get("username")?.trim() || DEFAULT_USERNAME;
  const username = GITHUB_USERNAME_RE.test(rawUsername)
    ? rawUsername
    : DEFAULT_USERNAME;

  try {
    const htmlRes = await fetch(
      `https://github.com/${encodeURIComponent(username)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 INDIAbids-Portfolio/1.0",
          Accept: "text/html,application/xhtml+xml",
        },
        next: { revalidate: 1800 },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (htmlRes.ok) {
      const html = await htmlRes.text();
      const pinned = parsePinnedHtml(html, username);

      if (pinned.length > 0) {
        const payload: GitHubPinnedResponse = {
          username,
          repos: pinned,
          source: "github-pinned",
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
    // Fall through to GitHub REST API repos endpoint
  }

  try {
    const apiRes = await fetch(
      `https://api.github.com/users/${encodeURIComponent(
        username
      )}/repos?sort=pushed&per_page=6&type=owner`,
      {
        headers: {
          "User-Agent": "INDIAbids-Portfolio/1.0",
          Accept: "application/vnd.github+json",
        },
        next: { revalidate: 1800 },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (apiRes.ok) {
      const list = (await apiRes.json()) as Array<{
        id: number;
        name: string;
        full_name: string;
        owner?: { login?: string };
        description: string | null;
        html_url: string;
        homepage: string | null;
        language: string | null;
        stargazers_count: number;
        forks_count: number;
        topics?: string[];
        pushed_at?: string;
        fork?: boolean;
      }>;

      const filtered = (Array.isArray(list) ? list : [])
        .filter((r) => !r.fork)
        .slice(0, 6);

      if (filtered.length > 0) {
        const repos: GitHubPinnedRepo[] = filtered.map((r) => ({
          id: r.name.toLowerCase(),
          name: r.name,
          owner: r.owner?.login || username,
          fullName: r.full_name,
          description: r.description || "Repository on GitHub.",
          url: r.html_url,
          homepage: r.homepage || undefined,
          language: r.language,
          languageColor: null,
          stars: r.stargazers_count || 0,
          forks: r.forks_count || 0,
          topics: Array.isArray(r.topics) ? r.topics : [],
          updatedAt: r.pushed_at,
        }));

        const payload: GitHubPinnedResponse = {
          username,
          repos,
          source: "github-repos",
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

  const payload: GitHubPinnedResponse = {
    username,
    repos: FALLBACK_PINNED.map((r) => ({
      ...r,
      owner: username,
      fullName: `${username}/${r.name}`,
      url: `https://github.com/${username}/${r.name}`,
    })),
    source: "fallback",
    fetchedAt: new Date().toISOString(),
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
