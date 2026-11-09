import { GithubIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { bandButton } from "./band";
import { ThemeButton, ThemeToggle } from "./theme-toggle";

const REPO = "https://github.com/BoyanLiuu/avatar-playground";

/** The top film band: wordmark, theme, GitHub. */
export const TopBand = () => (
  <header
    data-film
    className="flex h-14 shrink-0 items-center justify-between border-b border-band-edge bg-film px-6 text-band-fg max-sm:h-[52px] max-sm:px-4"
  >
    <span className="font-edge text-[22px] leading-none font-bold tracking-[0.01em] max-sm:text-[20px]">
      Avatar Playground
    </span>
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
