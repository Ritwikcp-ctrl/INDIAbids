"use client";

import useSWR from "swr";
import { api } from "./client";
import type {
  LeaderboardResponse,
  ScopedBoard,
  ManagedBusinessResponse,
  Category,
  Quote,
  PaymentVerifyResult,
} from "../types/api";

const getFetcher = <T>(path: string): Promise<T> => api.get<T>(path);

export function useLeaderboard(boardId: string | null) {
  return useSWR<LeaderboardResponse>(
    boardId ? `/bids/${boardId}/leaderboard` : null,
    getFetcher,
    { refreshInterval: 4000 }
  );
}

export function useBoardByKey(key: string | null) {
  return useSWR<{ board: ScopedBoard }>(
    key ? `/boards/${key}` : null,
    getFetcher
  );
}

export function useBoards(query?: { scope?: string; category?: string; state?: string }) {
  const params = new URLSearchParams();
  if (query?.scope) params.set("scope", query.scope);
  if (query?.category) params.set("category", query.category);
  if (query?.state) params.set("state", query.state);
  const qStr = params.toString();

  return useSWR<{ boards: ScopedBoard[] }>(
    `/boards${qStr ? `?${qStr}` : ""}`,
    getFetcher
  );
}

export function useCategories() {
  return useSWR<{ categories: Category[] }>(
    "/categories",
    getFetcher
  );
}

export function useQuote(
  boardId: string | null,
  body?: { businessId?: string; manageToken?: string }
) {
  return useSWR<{ quote: Quote }>(
    boardId ? [`/bids/${boardId}/quote`, body?.businessId, body?.manageToken] : null,
    ([path]) => api.post(path, body || {})
  );
}

export function useMyBusinesses() {
  return useSWR<{ businesses: ManagedBusinessResponse[] }>(
    "/businesses/mine",
    getFetcher
  );
}

export function useManagedBusiness(token: string | null) {
  return useSWR<{ business: ManagedBusinessResponse }>(
    token ? `/manage/${token}` : null,
    getFetcher
  );
}

export function usePaymentStatus(paymentId: string | null) {
  return useSWR<PaymentVerifyResult>(
    paymentId ? `/payments/status/${paymentId}` : null,
    getFetcher,
    { refreshInterval: 2500 }
  );
}
