import { AvatarImg } from "@/components/avatar-img";
import { PencilLoop } from "@/components/pencil/pencil";
import { cn } from "@/lib/utils";

/**
 * A length of film (DESIGN.md › Film strip): sprocket rows, avatar frames with edge-print numbers,
 * the current frame circled in red. Used for the history strip and, at sheet size, Grid view.
 */
export const FilmStrip = ({
  frames,
  firstNo,
  current,
  size,
  sheet = false,
  compact = false,
  label,
}: {
  frames: string[];
  /** Frame number of the first frame. */
  firstNo: number;
  /** Index of the circled frame. */
  current: number;
  /** Frame size in px; `sheet` frames size from --sheet-frame instead. */
  size: number;
  sheet?: boolean;
  compact?: boolean;
  label: string;
}) => (
  <div
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
    {frames.map((src, i) => {
      const isCurrent = i === current;
      const no = firstNo + i;
      return (
        <button
          key={src}
          type="button"
          aria-label={`Frame ${no}`}
          aria-current={isCurrent ? "true" : undefined}
          className={cn(
            "group/frame flex shrink-0 flex-col items-center",
            sheet ? "gap-3" : "gap-1.5",
          )}
        >
          <span className="relative">
            <AvatarImg
              src={src}
              className={cn(
                "transition-[filter] duration-(--dur-fast) group-hover/frame:brightness-108",
                sheet && "size-(--sheet-frame)",
              )}
              style={sheet ? undefined : { width: size, height: size }}
            />
            {isCurrent && (
              <PencilLoop
                w={size}
                h={size}
                pad={sheet ? 4 : compact ? 4 : 5}
                stroke={sheet ? 3 : compact ? 2.2 : 2.6}
                seed={sheet ? 9 : 5}
                fluid={sheet}
              />
            )}
          </span>
          <span
            className={cn(
              "font-edge leading-none font-semibold tracking-[0.06em] tabular-nums",
              sheet ? "text-[12px]" : "text-[11px]",
              isCurrent ? "text-band-fg" : "text-edge",
            )}
          >
            {no}
          </span>
        </button>
      );
    })}
  </div>
);
