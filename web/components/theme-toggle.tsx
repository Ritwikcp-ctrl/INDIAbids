"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="sm"
        aria-label="Toggle theme"
        className={`h-9 w-9 p-0 rounded-lg border-border bg-card/60 ${className || ""}`}
      >
        <span className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  return (
    <Button
      variant="outline"
      size="sm"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`h-9 px-2.5 rounded-lg border-border bg-card/80 hover:bg-card text-foreground transition-all flex items-center gap-1.5 shadow-sm ${
        className || ""
      }`}
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4 text-[var(--butter-yellow)]" />
          <span className="text-[11px] font-medium hidden sm:inline">Light</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-[var(--burnt-coral)]" />
          <span className="text-[11px] font-medium hidden sm:inline">Dark</span>
        </>
      )}
    </Button>
  );
}
