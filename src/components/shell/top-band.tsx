"use client";

import Link from "next/link";
import { GithubIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { usePlayground } from "@/store/playground";
import { writeLink } from "@/store/share";
import { bandButton } from "./band";
import { ThemeButton, ThemeToggle } from "./theme-toggle";

const REPO = "https://github.com/BoyanLiuu/avatar-playground";

/** Home starts over in place: every style on a fresh film, the address clean, locks kept. */
const goHome = (e: React.MouseEvent) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // new tab or window
  e.preventDefault();
  usePlayground.getState().startOver();
  writeLink();
};

/** The top film band: the wordmark (home), theme, GitHub. */
export const TopBand = () => (
  <header
    data-film
    className="flex h-14 shrink-0 items-center justify-between border-b border-band-edge bg-film px-6 text-band-fg max-sm:h-[52px] max-sm:px-4"
  >
    <Link
      href="/"
      onClick={goHome}
      className="rounded-inner font-edge text-[22px] leading-none font-bold tracking-[0.01em] max-sm:text-[20px]"
    >
      Avatar Playground
    </Link>
    <div className="flex items-center gap-2">
      <ThemeToggle className="max-sm:hidden" />
      <ThemeButton className="sm:hidden" />
      <a
        href={REPO}
        aria-label="GitHub repository"
        className={cn(bandButton, "max-sm:w-9 max-sm:px-0")}
      >
        <GithubIcon className="size-4" />
        <span className="max-sm:hidden">GitHub</span>
      </a>
    </div>
  </header>
);
