"use client";

import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

type ThemeMode = "light" | "dark";

type ThemeTransition = {
  theme: ThemeMode;
  phase: "cover" | "reveal";
};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [transition, setTransition] = useState<ThemeTransition | null>(null);

  function toggleTheme() {
    if (transition) return;

    const theme: ThemeMode = resolvedTheme === "dark" ? "light" : "dark";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTheme(theme);
      return;
    }

    setTransition({ theme, phase: "cover" });
  }

  function handleWipeAnimationEnd() {
    if (!transition) return;

    if (transition.phase === "cover") {
      setTheme(transition.theme);
      setTransition({ ...transition, phase: "reveal" });
      return;
    }

    setTransition(null);
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Toggle light and dark theme"
        title="Toggle light and dark theme"
        disabled={transition !== null}
        onClick={toggleTheme}
      >
        <span className="relative flex size-5 items-center justify-center">
          <Sun
            aria-hidden="true"
            className="absolute size-5 rotate-0 scale-100 transition-all duration-500 ease-in-out dark:-rotate-90 dark:scale-0 motion-reduce:transition-none"
          />
          <Moon
            aria-hidden="true"
            className="absolute size-5 rotate-90 scale-0 transition-all duration-500 ease-in-out dark:rotate-0 dark:scale-100 motion-reduce:transition-none"
          />
        </span>
      </Button>
      {transition && (
        <div
          aria-hidden="true"
          data-theme={transition.theme}
          className={`theme-wipe theme-wipe-${transition.phase}`}
          onAnimationEnd={handleWipeAnimationEnd}
        />
      )}
    </>
  );
}
