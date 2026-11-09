import type { ComponentProps, ReactElement } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// DESIGN.md › Buttons. Bordered controls use --control-edge (3:1), darkening on hover.
const press =
  "transition-[background-color,border-color,box-shadow] duration-(--dur-fast) active:translate-y-px disabled:opacity-45 disabled:active:translate-y-0";

export const btnPrimary = cn(
  "inline-flex h-12 items-center gap-2.5 whitespace-nowrap rounded-control bg-primary pr-4 pl-5 text-[15px] font-semibold text-primary-foreground shadow-primary hover:shadow-[var(--shadow-primary),0_0_0_3px_color-mix(in_srgb,var(--primary-bg)_22%,transparent)]",
  press,
);

export const btnSecondary = cn(
  "inline-flex h-12 items-center gap-2.5 whitespace-nowrap rounded-control border border-control-edge bg-surface px-[18px] text-[15px] font-semibold text-ink hover:border-control-edge-hover hover:bg-tray",
  press,
);

export const btnSmall = cn(
  "inline-flex h-8 items-center gap-[7px] whitespace-nowrap rounded-inner border border-control-edge bg-surface px-3 text-[13px] font-semibold text-ink hover:border-control-edge-hover hover:bg-tray",
  press,
);

export const btnIcon = cn(
  "grid size-10 place-items-center rounded-control border border-control-edge bg-surface text-ink-2 hover:border-control-edge-hover hover:bg-tray",
  press,
);

export const btnMini = cn(
  "grid size-7 place-items-center rounded-inner border border-control-edge bg-surface text-graphite hover:border-control-edge-hover hover:bg-tray",
  press,
);

export const btnGhost =
  "grid size-7 place-items-center rounded-inner text-graphite transition-colors hover:bg-tray hover:text-ink disabled:opacity-45 disabled:hover:bg-transparent";

/** A segmented control on paper (DESIGN.md › Segmented controls). */
export const segTrack = "rounded-control border border-rule bg-tray p-[3px]";
export const segItem =
  "h-[30px] rounded-inner px-3 text-[13px] font-semibold text-graphite hover:bg-transparent hover:text-ink aria-pressed:bg-surface-on aria-pressed:text-ink aria-pressed:shadow-sm";

/** An icon-only control: the label is its accessible name and its tooltip. */
export const WithTooltip = ({
  label,
  children,
}: {
  label: string;
  children: ReactElement;
}) => (
  <Tooltip>
    <TooltipTrigger render={children} />
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
);

export const IconButton = ({
  label,
  ...props
}: { label: string } & ComponentProps<"button">) => (
  <WithTooltip label={label}>
    <button type="button" aria-label={label} {...props} />
  </WithTooltip>
);
