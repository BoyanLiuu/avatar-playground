"use client";

import {
  type RefObject,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { AvatarImg } from "@/components/avatar-img";
import { PencilLoop } from "@/components/pencil/pencil";
import { advance, drawOn } from "@/lib/motion";
import type { Frame } from "@/content/styles";
import { cn } from "@/lib/utils";

export type FilmFrame = {
  key: string;
  no: number;
  src: string;
  /** What the frame shows, for screen readers. */
  description?: string;
};

/** Corner rounding of an avatar's frame shape, for unexposed frames. */
const ROUND: Record<Frame, string> = {
  circle: "50%",
  squircle: "23%",
  square: "0",
};

/**
 * How many frames of `size` fit across the element (a strip padded `pad` each side, frames `gap`
 * apart), kept current as it resizes. Measured before paint, so the strip never shows a wrong
 * count first.
 */
export const useFit = (
  box: RefObject<HTMLElement | null>,
  {
    size,
    gap,
    pad,
    initial,
  }: { size: number; gap: number; pad: number; initial: number },
) => {
  const [count, setCount] = useState(initial);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      const width = el.clientWidth;
      if (width)
        setCount(
          Math.max(1, Math.floor((width - 2 * pad + gap) / (size + gap))),
        );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [box, size, gap, pad]);
  return count;
};

/**
 * A length of film (DESIGN.md › Film strip): sprocket rows, avatar frames with edge-print numbers,
 * the circled frame in red. Used for the history strip (as many frames as fit, centred, unexposed
 * frames first while the film is short) and, at sheet size, Grid view.
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
  blank = 0,
  shape = "square",
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
  /** Unexposed frames before the first one, filling a strip the film does not yet cover. */
  blank?: number;
  /** The avatars' frame shape, for the unexposed frames. */
  shape?: Frame;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const uid = useId();
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
          : "justify-center gap-3 px-4 py-5",
        compact && "compact gap-2 px-3 py-4",
      )}
    >
      {Array.from({ length: blank }, (_, k) => (
        <span
          key={`blank-${k}`}
          aria-hidden="true"
          data-blank
          className={cn(
            "flex shrink-0 flex-col items-center",
            sheet ? "gap-3" : "gap-1.5",
          )}
        >
          <span
            className="block bg-film-2"
            style={{ width: size, height: size, borderRadius: ROUND[shape] }}
          />
          <span className={cn("leading-none", sheet ? "h-3" : "h-[11px]")} />
        </span>
      ))}
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
            aria-describedby={frame.description ? `${uid}-${i}` : undefined}
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
            {frame.description && (
              <span id={`${uid}-${i}`} className="sr-only">
                {frame.description}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
