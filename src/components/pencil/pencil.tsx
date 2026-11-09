// Grease-pencil marks (DESIGN.md › Named Rules: One Job Per Pencil, Annotation).
// Red loop = the current pick; yellow underline = locked; red crop marks = the export frame.
// Marks are decoration over standard controls: always aria-hidden, never the only state signal.
import { cropCornerPaths, loopGeometry, underlinePaths } from "./marks";

/** The wax texture every mark shares; render once per page. */
export const WaxFilter = () => (
  <svg width="0" height="0" className="absolute" aria-hidden="true">
    <defs>
      <filter id="wax" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="1.4"
          numOctaves={2}
          seed={7}
          result="n"
        />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" />
      </filter>
    </defs>
  </svg>
);

/** A red loop around its (relative) parent box of w×h. */
export const PencilLoop = ({
  w,
  h,
  pad = 6,
  stroke = 2.6,
  seed = 1,
  fluid = false,
}: {
  w: number;
  h: number;
  pad?: number;
  stroke?: number;
  seed?: number;
  /** Stretch to a parent whose size is fluid (w×h is then the nominal size). */
  fluid?: boolean;
}) => {
  const g = loopGeometry(w, h, { pad, stroke, seed });
  const box = fluid
    ? {
        left: g.offset,
        top: g.offset,
        width: `calc(100% + ${-2 * g.offset}px)`,
        height: `calc(100% + ${-2 * g.offset}px)`,
      }
    : { left: g.offset, top: g.offset, width: g.width, height: g.height };
  return (
    <svg
      className="pencil-mark pointer-events-none absolute overflow-visible"
      style={box}
      viewBox={`0 0 ${g.width} ${g.height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        pathLength={1}
        d={g.d}
        fill="none"
        stroke="var(--pencil-red)"
        strokeWidth={stroke}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        filter="url(#wax)"
      />
    </svg>
  );
};

/** A yellow underline under its (relative) parent, stretched to the parent's width. */
export const PencilUnderline = ({
  seed = 1,
  stroke = 4,
  offset = 3,
}: {
  seed?: number;
  stroke?: number;
  offset?: number;
}) => (
  <svg
    className="pencil-mark pointer-events-none absolute left-0 h-4 w-full overflow-visible"
    style={{ bottom: -offset - 8 }}
    viewBox="-4 0 108 16"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    {underlinePaths(seed).map((d, k) => (
      <path
        key={d}
        pathLength={1}
        d={d}
        fill="none"
        stroke="var(--pencil-yellow)"
        strokeWidth={stroke - k}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        filter="url(#wax)"
      />
    ))}
  </svg>
);

/** Red crop corners just outside the corners of its (relative) parent print, at any size. */
export const CropMarks = ({
  gap = 14,
  len = 34,
  stroke = 3.2,
  seed = 3,
}: {
  gap?: number;
  len?: number;
  stroke?: number;
  seed?: number;
}) => {
  const half = len + 6;
  const at = -gap - half;
  const corners = [
    { left: at, top: at },
    { right: at, top: at },
    { left: at, bottom: at },
    { right: at, bottom: at },
  ];
  return cropCornerPaths({ len, seed }).map((d, i) => (
    <svg
      key={d}
      className="pencil-mark pointer-events-none absolute overflow-visible"
      style={corners[i]}
      width={half * 2}
      height={half * 2}
      viewBox={`${-half} ${-half} ${half * 2} ${half * 2}`}
      aria-hidden="true"
    >
      <path
        pathLength={1}
        d={d}
        fill="none"
        stroke="var(--pencil-red)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#wax)"
      />
    </svg>
  ));
};
