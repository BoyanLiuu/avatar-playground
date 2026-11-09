"use client";

import { useLayoutEffect, useRef } from "react";
import { AvatarImg } from "@/components/avatar-img";
import { PencilLoop } from "@/components/pencil/pencil";
import { advance, drawOn } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type FilmFrame = { key: string; no: number; src: string };

/**
 * A length of film (DESIGN.md › Film strip): sprocket rows, avatar frames with edge-print numbers,
 * the circled frame in red. Used for the history strip and, at sheet size, Grid view.
 */
export const FilmStrip = ({
  frames,
  circled,
  size,
  sheet = false,
  compact = false,
  label,
  onFrame,
  roll,
}: {
  frames: FilmFrame[];
  /** Index of the circled frame, if any. */
  circled: number | null;
  /** Frame size in px; `sheet` frames size from --sheet-frame instead. */
  size: number;
  sheet?: boolean;
  compact?: boolean;
  label: string;
  /** Makes frames buttons: restore (history) or pick (Grid). Without it frames are inert. */
  onFrame?: (index: number) => void;
  /** The roll counter: when it moves and a new frame arrives, the strip advances. */
  roll?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const newest = frames.at(-1)?.key;
  const last = useRef({ roll, newest });
  useLayoutEffect(() => {
    const before = last.current;
    last.current = { roll, newest };
    if (roll === undefined || before.roll === roll || before.newest === newest)
      return;
    const els = [...ref.current!.querySelectorAll("[data-frame]")];
    const landed = els.at(-1) as HTMLElement | undefined;
    const prev = els.at(-2) as HTMLElement | undefined;
    if (!landed) return;
    advance(
      els.slice(0, -1),
      landed,
      prev ? landed.offsetLeft - prev.offsetLeft : 0,
    );
    drawOn(landed.querySelector(".pencil-mark"));
  }, [roll, newest]);

  return (
    <div
      ref={ref}
      data-film
      role="group"
      aria-label={label}
      className={cn(
        "film-strip relative flex overflow-hidden rounded-tile bg-film shadow-strip",
        sheet
          ? "justify-center gap-4 px-6 pt-[22px] pb-5"
          : "justify-end gap-3 px-4 py-5",
        compact && "compact gap-2 px-3 py-4",
      )}
    >
      {frames.map((frame, i) => {
        const isCircled = i === circled;
        return (
          <button
            key={frame.key}
            data-frame
            type="button"
            disabled={!onFrame}
            onClick={onFrame && (() => onFrame(i))}
            aria-label={`Frame ${frame.no}`}
            aria-current={!sheet && isCircled ? "true" : undefined}
            aria-pressed={sheet ? isCircled : undefined}
            className={cn(
              "group/frame flex shrink-0 flex-col items-center",
              sheet ? "gap-3" : "gap-1.5",
            )}
          >
            <span className="relative">
              <AvatarImg
                src={frame.src}
                className={cn(
                  "transition-[filter] duration-(--dur-fast)",
                  onFrame && "group-hover/frame:brightness-108",
                  sheet && "size-(--sheet-frame)",
                )}
                style={sheet ? undefined : { width: size, height: size }}
              />
              <PencilLoop
                on={isCircled}
                w={size}
                h={size}
                pad={sheet ? 4 : compact ? 4 : 5}
                stroke={sheet ? 3 : compact ? 2.2 : 2.6}
                seed={sheet ? 9 : 5}
                fluid={sheet}
              />
            </span>
            <span
              className={cn(
                "font-edge leading-none font-semibold tracking-[0.06em] tabular-nums",
                sheet ? "text-[12px]" : "text-[11px]",
                isCircled ? "text-band-fg" : "text-edge",
              )}
            >
              {frame.no}
            </span>
          </button>
        );
      })}
    </div>
  );
};
