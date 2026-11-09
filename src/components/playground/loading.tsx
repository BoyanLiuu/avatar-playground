import { LoaderCircleIcon } from "lucide-react";
import { AvatarImg } from "@/components/avatar-img";
import { CropMarks } from "@/components/pencil/pencil";
import { getStyle } from "@/content/styles";
import { ENGINES } from "@/engine/registry";
import { avatarSrc } from "@/lib/avatar";
import { describeAvatar } from "@/lib/describe";

/**
 * Shown until boot has applied the share link and saved locks (one short beat after the page
 * loads). It holds the playground's frame, so nothing jumps when the real one appears: the rail
 * and panel columns, the stage's print with its crop marks, and an empty film strip.
 * - Opened plainly (no link), nothing can change the first avatar, so the print shows it at once.
 * - Opened from a share link (src/lib/link-script.ts marks <html data-link>), the print shows
 *   "developing" instead, so the default avatar never flashes before the shared one. The spinner
 *   fades in after a beat, so a fast load shows only the blank print.
 */
export const PlaygroundLoading = () => {
  const style = getStyle("flat");
  const config = ENGINES.flat.defaults;
  return (
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
          <AvatarImg
            src={avatarSrc("flat", config, { frame: style.frame })}
            alt={`Current avatar: ${style.name}, frame 9. ${describeAvatar(style, config)}`}
            className="hero-avatar in-data-link:hidden"
          />
          <div
            role="status"
            className="hero-avatar loading-in hidden place-items-center content-center gap-3 text-graphite in-data-link:grid"
          >
            <LoaderCircleIcon
              aria-hidden="true"
              className="size-7 motion-safe:animate-spin"
            />
            <span className="edge-label">Developing</span>
          </div>
          <span className="contents max-sm:hidden">
            <CropMarks />
          </span>
          <span className="contents sm:hidden">
            <CropMarks gap={10} len={24} stroke={2.8} />
          </span>
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
};
