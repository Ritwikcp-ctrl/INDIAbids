// app/providers.tsx
"use client";

import { ThemeProvider } from "next-themes";
import { SWRConfig } from "swr";
import { AuthProvider } from "@/auth/auth-provider";
import { api } from "@/api/client";

const fetcher = <T,>(path: string) => api.get<T>(path);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} themes={["light", "dark"]}>
      <AuthProvider>
        <SWRConfig value={{ fetcher, revalidateOnFocus: false }}>
          {children}
        </SWRConfig>
      </AuthProvider>
    </ThemeProvider>
  );
}
