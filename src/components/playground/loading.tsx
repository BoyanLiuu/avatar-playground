import { LoaderCircleIcon } from "lucide-react";

/**
 * Shown until boot has applied the share link and saved locks (one short beat after the page
 * loads). It holds the playground's frame, so nothing jumps when the real one appears: the rail
 * and panel columns, and the stage with an empty print developing and an empty film strip. The
 * spinner fades in after a beat, so a fast load shows only the empty print.
 */
export const PlaygroundLoading = () => (
  <>
    <div
      aria-hidden="true"
      className="hidden w-[232px] shrink-0 border-r border-rule sm:block xl:w-[264px]"
    />
    {/* Phone: the style chips' row. */}
    <div aria-hidden="true" className="h-[70px] shrink-0 sm:hidden" />
    <section
      aria-label="Avatar"
      aria-busy="true"
      className="stage @container relative flex min-w-0 flex-1 flex-col items-center px-6 pt-5 pb-4 max-sm:px-4 max-sm:pt-1"
    >
      <div className="h-8 w-full" />
      <div className="relative mt-7 rounded-hero bg-print p-3 shadow-print max-sm:mt-6 max-sm:p-2">
        <div
          role="status"
          className="hero-avatar loading-in grid place-items-center content-center gap-3 text-graphite"
        >
          <LoaderCircleIcon
            aria-hidden="true"
            className="size-7 motion-safe:animate-spin"
          />
          <span className="edge-label">Developing</span>
        </div>
      </div>
      <div className="mt-auto w-full pt-4 max-sm:hidden">
        <div className="film-strip relative h-[127px] rounded-tile bg-film shadow-strip" />
      </div>
    </section>
    <div
      aria-hidden="true"
      className="hidden w-[424px] shrink-0 border-l border-rule bg-panel xl:block"
    />
  </>
);
