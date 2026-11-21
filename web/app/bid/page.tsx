import { Leaderboard } from "./leaderboards"
import { BidChart } from "./bid-chart"
import { BidForm } from "./bid-form"

export default async function BidPage({searchParams,}: {
    searchParams:Promise<{scope?:string; state?: string; boardId?:string}>;
}) {

    const params = await searchParams;
    const scope = params.scope === "state" ? "STATE" : "NATIONAL";
    const state = params.state ?? null;
    const boardId = params.boardId ?? "demo-board";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sand-dim">
          The board
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">
          Every bid. Every rank.
        </h1>
        <p className="mt-2 max-w-lg text-muted-foreground">
          Raise your bid to climb. Raise again to stay. Nothing expires.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.8fr_1fr]">
        <div className="space-y-8">
          <BidChart />
          <Leaderboard />
        </div>
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <BidForm scope={scope} state={state ?? undefined} />
        </aside>
      </div>
    </div>
  )
}