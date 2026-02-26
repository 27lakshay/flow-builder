"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { HugeiconsIcon } from "@hugeicons/react";
import { Moon01Icon, Sun01Icon } from "@hugeicons/core-free-icons";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <TooltipWrapper content="Toggle theme">
        <Button variant="ghost" size="icon" className="size-8" aria-label="Toggle theme">
          <span className="size-4" />
        </Button>
      </TooltipWrapper>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <TooltipWrapper content={isDark ? "Switch to light mode" : "Switch to dark mode"}>
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <HugeiconsIcon
          icon={isDark ? Sun01Icon : Moon01Icon}
          strokeWidth={2}
          className="size-4"
        />
      </Button>
    </TooltipWrapper>
  );
}
