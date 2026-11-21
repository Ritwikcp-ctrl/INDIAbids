"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {api} from "@/api/client"
import {loadRazorpay} from "@/api/razorpay"
import {useAuth} from "@/auth/auth-provider"
import {useRouter} from "next/navigation"
import type { CheckoutResponse,Scope } from "@/types/api"
import { formatInr } from "@/components/ui/lib/money"
import { categories } from "@/components/ui/lib/mock"
import type { Category } from "@/components/types/mock"

const MIN_BID = 499
const MAX_BID = 200_000

function extractTitle(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").split(".")[0]
  } catch {
    return url.slice(0, 24) || "Untitled"
  }
}

export function BidForm({scope = "NATIONAL", state}: {scope?:Scope; state?:string }) {
    const router = useRouter();
    const {user} = useAuth();
   const listings = useListings()
  const [url, setUrl] = useState("")
  const [category, setCategory] = useState<Category>("AI & Agents")
  const [amount, setAmount] = useState<number>(MIN_BID)

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ url: string }>).detail
      setUrl(detail.url)
      document
        .getElementById("bid-form")
        ?.scrollIntoView({ behavior: "smooth", block: "center" })
    }
    document.addEventListener("indiabids:prefill-bid", handler)
    return () =>
      document.removeEventListener("indiabids:prefill-bid", handler)
  }, [])

  const existing = useMemo(
    () =>
      listings.find(
        (l) => l.url.toLowerCase() === url.trim().toLowerCase()
      ),
    [listings, url]
  )

  const minAmount = existing ? existing.totalPaidInr + 100 : MIN_BID
  const charge = existing ? Math.max(0, amount - existing.totalPaidInr) : amount

  const projectedRank = useMemo(() => {
    const above = listings.filter(
      (l) => l.totalPaidInr >= amount && l.id !== existing?.id
    )
    return above.length + 1
  }, [listings, amount, existing])

 async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateListing(listing.id, {...});
    toast.success("Bid placed!");
    const trimmed = url.trim()
    if (!trimmed) return toast.error("Enter a URL or handle first");

   setBusy(true);
   try {
     const checkout = await api.post<CheckoutResponse>("/checkout", {
      name: extractTitle(trimmed),
       website: trimmed,
       contactEmail,
       contactPhone: "0000000000",
       categorySlug: category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      scope,
       state: scope === "STATE" ? state : undefined,
       amountPaise: String(amount * 100),
     });

     if (checkout.manageToken) {
       sessionStorage.setItem("manageToken", checkout.manageToken);
     }

     await loadRazorpay();
     const rzp = new window.Razorpay({
      key: checkout.keyId,
      amount: Number(checkout.amountPaise),
       currency: "INR",
       name: "IndiaBids",
       order_id: checkout.orderId,
       prefill: { email: contactEmail },
      handler: () => router.push(`/success/${checkout.paymentId}`),
      modal: { ondismiss: () => setBusy(false) },
     });
     rzp.open();
   } catch (err) {
     toast.error(err instanceof Error ? err.message : "Checkout failed.");
     setBusy(false);
    
    }

    setUrl("")
    setAmount(MIN_BID)
  }

  return (
    <Card id="bid-form" className="scroll-mt-20">
      <CardHeader>
        <CardTitle className="text-base">Place a bid</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="url">URL or handle</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yoursite.in"
            />
            {existing && (
              <p className="text-xs text-muted-foreground">
                Already listed at {formatInr(existing.totalPaidInr)} · rank #
                {existing.rank}
              </p>
            )}
          </div>

          {!existing && (
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as Category)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Bid amount</Label>
              <span className="text-2xl font-black tabular-nums">
                {formatInr(amount)}
              </span>
            </div>
            <Slider
              value={[amount]}
              min={minAmount}
              max={MAX_BID}
              step={100}
              onValueChange={(v) => setAmount(Array.isArray(v) ? v[0] : v)}
            />
            <div className="flex gap-2">
              {[
                minAmount,
                minAmount + 500,
                minAmount + 2_000,
                minAmount + 10_000,
              ].map((v) => (
                <Button
                  key={v}
                  type="button"
                  size="sm"
                  variant={amount === v ? "default" : "outline"}
                  onClick={() => setAmount(Math.min(v, MAX_BID))}
                  className="flex-1 text-xs"
                >
                  {formatInr(v)}
                </Button>
              ))}
            </div>
          </div>

          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">You'll pay</span>
              <span className="font-semibold tabular-nums">
                {formatInr(charge)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">New rank</span>
              <Badge variant="outline" className="tabular-nums">
                #{projectedRank}
              </Badge>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            {existing ? "Raise bid" : "Place bid"} →
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            Mock mode — real Razorpay checkout is the next step.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}