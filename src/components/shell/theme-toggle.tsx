"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { bandButton, bandSeg, bandSegItem } from "./band";

type Theme = "light" | "dark";

const subscribe = () => () => {};

/**
 * The theme follows the OS until the visitor picks one. Picking the OS's own theme clears the
 * override (next-themes "system"), so the page follows the OS again.
 */
const useThemeChoice = () => {
  const { resolvedTheme, systemTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const current = mounted ? (resolvedTheme as Theme | undefined) : undefined;
  const choose = (next: Theme) =>
    setTheme(next === systemTheme ? "system" : next);
  return { current, choose };
};

/** Desktop: a sun/moon segmented control showing the current theme. */
export const ThemeToggle = ({ className }: { className?: string }) => {
  const { current, choose } = useThemeChoice();
  return (
    <ToggleGroup
      aria-label="Theme"
      spacing={0.5}
      value={current ? [current] : []}
      onValueChange={(value) => {
        const next = value[0] as Theme | undefined;
        if (next) choose(next);
      }}
      className={cn(bandSeg, className)}
    >
      <ToggleGroupItem
        value="light"
        aria-label="Light theme"
        className={bandSegItem}
      >
        <SunIcon />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="dark"
        aria-label="Dark theme"
        className={bandSegItem}
      >
        <MoonIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

/** Phone: one icon button that shows the current theme and switches to the other. */
export const ThemeButton = ({ className }: { className?: string }) => {
  const { current, choose } = useThemeChoice();
  const next: Theme = current === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => choose(next)}
      aria-label={
        current ? `Theme: ${current}. Switch to ${next}` : "Switch theme"
      }
      className={cn(bandButton, "w-9 px-0", className)}
    >
      {current === "dark" ? (
        <MoonIcon className="size-4" />
      ) : (
        <SunIcon className="size-4" />
      )}
    </button>
  );
};
