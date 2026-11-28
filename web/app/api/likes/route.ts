import { NextResponse } from "next/server";

declare global {
  var __tejasPortfolioLikes: number | undefined;
}

function getCount(): number {
  return typeof globalThis.__tejasPortfolioLikes === "number"
    ? globalThis.__tejasPortfolioLikes
    : 0;
}

export async function GET() {
  return NextResponse.json({ count: getCount() });
}

export async function POST(req: Request) {
  let delta = 1;
  try {
    const body = (await req.json()) as { delta?: number };
    if (body?.delta === -1) delta = -1;
  } catch {
    // default +1
  }
  const next = Math.max(0, getCount() + delta);
  globalThis.__tejasPortfolioLikes = next;
  return NextResponse.json({ count: next });
}
