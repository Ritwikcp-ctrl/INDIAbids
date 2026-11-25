import type { ApiEnvelope, AuthResponse } from "@/types/api";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

// Access token lives here — NOT localStorage
let accessToken: string | null = null;
let refreshing: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}
export function getAccessToken() {
  return accessToken;
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    try {
      const res = await fetch(`${BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include", // refresh cookie is HttpOnly + path=/api/v1/auth
      });
      if (!res.ok) return null;
      const json = (await res.json()) as ApiEnvelope<AuthResponse>;
      if (!json.success) return null;
      accessToken = json.data.accessToken;
      return accessToken;
    } catch {
      return null;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  retryOn401 = true,
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });

  if (res.status === 401 && retryOn401) {
    const newToken = await refreshAccessToken();
    if (newToken) return apiFetch<T>(path, init, false);
  }

  const json = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!json) {
    throw new ApiError("EMPTY_RESPONSE", `Request failed (${res.status}).`, res.status);
  }
  if (!json.success) {
    throw new ApiError(json.error.code, json.error.message, res.status);
  }
  return json.data;
}


export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  postForm: <T>(path: string) => apiFetch<T>(path, { method: "POST" }),
};