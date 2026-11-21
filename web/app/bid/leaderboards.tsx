"use client"

import { useMemo, useState } from "react"
import { ArrowUpRight, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useListings } from "@/components/ui/lib/leaderboard-store"
import { formatInr } from "@/components/ui/lib/money"
import { categories } from "@/components/ui/lib/mock"

export function Leaderboard() {
  const listings = useListings()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string>("all")

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      const matchQ =
        !query ||
        l.title.toLowerCase().includes(query.toLowerCase()) ||
        l.url.toLowerCase().includes(query.toLowerCase())
      const matchC = category === "all" || l.category === category
      return matchQ && matchC
    })
  }, [listings, query, category])

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base">All-time ladder</CardTitle>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 w-44 pl-8"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-9 w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 pl-6">#</TableHead>
              <TableHead>Listing</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Total paid</TableHead>
              <TableHead className="text-right">Today</TableHead>
              <TableHead className="w-12 pr-6" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="pl-6 font-black tabular-nums text-muted-foreground">
                  {l.rank}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{l.title}</span>
                    <span className="text-xs text-muted-foreground">{l.url}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{l.category}</Badge>
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatInr(l.totalPaidInr)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm">
                  {l.todayDeltaInr > 0 ? (
                    <span className="text-emerald-600">
                      +{formatInr(l.todayDeltaInr)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="pr-6">
                  <a
                    href="#bid-form"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    onClick={() =>
                      document.dispatchEvent(
                        new CustomEvent("indiabids:prefill-bid", {
                          detail: { url: l.url },
                        })
                      )
                    }
                  >
                    Raise <ArrowUpRight className="h-3 w-3" />
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">
            No listings match.
          </p>
        )}
      </CardContent>
    </Card>
  )
}