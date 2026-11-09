import type { ReactNode } from "react";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

/** A key cap in edge print (DESIGN.md › Typography: Label, key caps 0.04em). */
export const KeyCap = ({
  children,
  onFilm = false,
  className,
}: {
  children: ReactNode;
  /** Inside the ink (primary) button. */
  onFilm?: boolean;
  className?: string;
}) => (
  <Kbd
    className={cn(
      "h-auto min-w-5 rounded-hero border border-b-2 px-1.5 py-[3px] font-edge text-[12px] leading-none font-semibold tracking-[0.04em]",
      onFilm
        ? "border-primary-kbd-edge bg-primary-kbd text-primary-kbd-fg"
        : "border-rule-2 bg-surface text-graphite",
      className,
    )}
  >
    {children}
  </Kbd>
);
