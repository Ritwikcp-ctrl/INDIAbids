// components/auth/auth-provider.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { api, setAccessToken } from "@/api/client";
import type { AuthResponse, LoginInput, RegisterInput } from "@/types/api";

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const booted = useRef(false);

  const refreshUser = useCallback(async () => {
    try {
      const data = await api.postForm<AuthResponse>("/auth/refresh");
      setAccessToken(data.accessToken);
      setUser(data.user);
    } catch {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (input: LoginInput) => {
    const data = await api.post<AuthResponse>("/auth/login", input);
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const data = await api.post<AuthResponse>("/auth/register", input);
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await api.postForm("/auth/logout").catch(() => {});
    setAccessToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}