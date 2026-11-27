"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

const emptySubscribe = () => () => {};

export function ThemeToggle({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label="Toggle theme"
        className={`${compact ? "h-7 w-7 rounded-full" : "h-8 w-8 rounded-lg"} p-0 border-border bg-card/60 ${className || ""}`}
      >
        <span className="h-3.5 w-3.5" />
      </Button>
    );
  }

  const isDark = (resolvedTheme ?? theme) === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`${
        compact
          ? "h-7 px-2 rounded-full text-[11px]"
          : "h-8 px-2.5 rounded-lg text-[11px]"
      } border-border bg-secondary/80 hover:bg-secondary text-foreground transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
        className || ""
      }`}
    >
      {isDark ? (
        <>
          <Sun className="h-3.5 w-3.5 text-amber-400" />
          {!compact && <span className="font-medium hidden sm:inline">Light</span>}
        </>
      ) : (
        <>
          <Moon className="h-3.5 w-3.5 text-[#FF4D1F]" />
          {!compact && <span className="font-medium hidden sm:inline">Dark</span>}
        </>
      )}
    </Button>
  );
}
