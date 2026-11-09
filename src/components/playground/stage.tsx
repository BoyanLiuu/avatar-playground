import {
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  Dice5Icon,
  DownloadIcon,
  FlipHorizontal2Icon,
  Grid2x2Icon,
  LinkIcon,
  LockIcon,
  Redo2Icon,
  RotateCcwIcon,
  SquareIcon,
  Undo2Icon,
} from "lucide-react";
import type { ReactNode } from "react";
import { AvatarImg } from "@/components/avatar-img";
import { CropMarks, PencilUnderline } from "@/components/pencil/pencil";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { StyleDef } from "@/content/styles";
import type { StyleFixture } from "@/lib/fixtures";
import { cn } from "@/lib/utils";
import {
  IconButton,
  btnGhost,
  btnIcon,
  btnPrimary,
  btnSecondary,
  segItem,
  segTrack,
} from "./buttons";
import { FilmStrip } from "./film-strip";
import { KeyCap } from "./key-cap";
import { type Scope, ScopeToggle } from "./style-list";

export type View = "single" | "grid";

const PNG_SIZES = (style: StyleDef) =>
  style.id === "pixel" ? [200, 400, 800, 1000] : [256, 512, 1024];

const PngMenu = ({ style }: { style: StyleDef }) => (
  <DropdownMenu>
    <DropdownMenuTrigger
      render={<button type="button" className={btnSecondary} />}
    >
      <DownloadIcon className="size-[18px]" />
      PNG
      <ChevronDownIcon className="size-4" />
    </DropdownMenuTrigger>
    <DropdownMenuContent className="min-w-48">
      {PNG_SIZES(style).map((px) => (
        <DropdownMenuItem key={px}>
          PNG · {px} × {px}
        </DropdownMenuItem>
      ))}
      <DropdownMenuCheckboxItem>
        Transparent background
      </DropdownMenuCheckboxItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>SVG</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const ViewToggle = ({
  view,
  onView,
}: {
  view: View;
  onView: (v: View) => void;
}) => (
  <ToggleGroup
    aria-label="View"
    spacing={0.5}
    value={[view]}
    onValueChange={(v) => v[0] && onView(v[0] as View)}
    className={segTrack}
  >
    <ToggleGroupItem
      value="single"
      aria-label="Single view"
      className={cn(segItem, "max-sm:w-[34px] max-sm:px-0")}
    >
      <SquareIcon className="size-3.5" />
      <span className="max-sm:hidden">Single</span>
    </ToggleGroupItem>
    <ToggleGroupItem
      value="grid"
      aria-label="Grid view"
      className={cn(segItem, "max-sm:w-[34px] max-sm:px-0")}
    >
      <Grid2x2Icon className="size-3.5" />
      <span className="max-sm:hidden">Grid</span>
    </ToggleGroupItem>
  </ToggleGroup>
);

/** "Randomize keeps …": every locked part, each with its yellow pencil underline. */
const LockedLine = ({ titles, verb }: { titles: string[]; verb: string }) => (
  <p className="mt-3.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[13px] text-graphite">
    {titles.length ? verb : "Nothing locked: Randomize changes every part"}
    {titles.map((title, k) => (
      <span
        key={title}
        className="relative inline-flex items-center gap-1 font-semibold text-ink"
      >
        <LockIcon className="size-[13px]" aria-hidden="true" />
        {title}
        <PencilUnderline seed={40 + k} offset={2} />
      </span>
    ))}
  </p>
);

const Toolbar = ({ withExport = false }: { withExport?: boolean }) => (
  <>
    <IconButton label="Undo" className={btnIcon}>
      <Undo2Icon className="size-[18px]" />
    </IconButton>
    <IconButton label="Redo" className={btnIcon}>
      <Redo2Icon className="size-[18px]" />
    </IconButton>
    <IconButton label="Flip" className={btnIcon}>
      <FlipHorizontal2Icon className="size-[18px]" />
    </IconButton>
    <IconButton label="Reset" className={btnIcon}>
      <RotateCcwIcon className="size-[18px]" />
    </IconButton>
    {withExport && (
      <>
        <IconButton label="Download PNG" className={btnIcon}>
          <DownloadIcon className="size-[18px]" />
        </IconButton>
        <IconButton label="Copy SVG" className={btnIcon}>
          <CopyIcon className="size-[18px]" />
        </IconButton>
      </>
    )}
  </>
);

const SingleView = ({
  style,
  fx,
  locked,
  scope,
  onScope,
}: {
  style: StyleDef;
  fx: StyleFixture;
  locked: string[];
  scope: Scope;
  onScope: (scope: Scope) => void;
}) => (
  <>
    <div className="relative mt-7 rounded-hero bg-print p-3 shadow-print max-sm:mt-6 max-sm:p-2">
      <AvatarImg
        src={fx.hero}
        alt={`Current avatar: ${style.name}, frame ${fx.frameNo}`}
        className="hero-avatar"
      />
      <span className="contents max-sm:hidden">
        <CropMarks />
      </span>
      <span className="contents sm:hidden">
        <CropMarks gap={10} len={24} stroke={2.8} />
      </span>
    </div>

    {/* Desktop and tablet: toolbar, then the primary action and export. */}
    <div className="mt-7 flex flex-wrap items-center justify-center gap-3 max-sm:hidden">
      <div className="flex gap-1 @max-[44rem]:basis-full @max-[44rem]:justify-center">
        <Toolbar />
      </div>
      <span
        aria-hidden="true"
        className="h-7 w-px bg-rule-2 @max-[44rem]:hidden"
      />
      <button type="button" className={btnPrimary}>
        <Dice5Icon className="size-5" />
        Randomize
        <KeyCap onFilm>Space</KeyCap>
      </button>
      <PngMenu style={style} />
      <button type="button" className={btnSecondary}>
        <CopyIcon className="size-[18px]" />
        Copy SVG
      </button>
    </div>

    {/* Phone: Randomize spans the width over six equal tools; the scope moves here from the rail. */}
    <div className="mt-5 grid w-full gap-2 sm:hidden">
      <button type="button" className={cn(btnPrimary, "w-full justify-center")}>
        <Dice5Icon className="size-5" />
        Randomize
      </button>
      <div className="flex gap-2 [&>button]:w-auto [&>button]:flex-1">
        <Toolbar withExport />
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="edge-label">Randomize from</span>
        <ScopeToggle scope={scope} onScope={onScope} className="w-auto" />
      </div>
    </div>

    <LockedLine titles={locked} verb="Randomize keeps" />

    <section aria-label="History" className="mt-auto w-full pt-4 max-sm:mt-4">
      <div className="mb-2 flex items-baseline justify-between gap-3 text-[12.5px] text-graphite">
        <h2 className="edge-label">History</h2>
        <span className="max-sm:hidden">
          Click a frame to restore · Undo <KeyCap>⌘Z</KeyCap> · Redo{" "}
          <KeyCap>⇧⌘Z</KeyCap>
        </span>
        <span className="sm:hidden">Tap to restore</span>
      </div>
      <div className="max-sm:hidden">
        <FilmStrip
          frames={fx.history.slice(-9)}
          firstNo={fx.frameNo - 8}
          current={8}
          size={64}
          label="Earlier rolls"
        />
      </div>
      <div className="sm:hidden">
        <FilmStrip
          frames={fx.history.slice(-7)}
          firstNo={fx.frameNo - 6}
          current={6}
          size={44}
          compact
          label="Earlier rolls"
        />
      </div>
    </section>
  </>
);

const GridView = ({ fx, locked }: { fx: StyleFixture; locked: string[] }) => {
  const first = fx.frameNo + 1;
  const pick = 6;
  return (
    <>
      <div className="mt-6 flex w-full flex-col items-center gap-3">
        {[0, 1, 2].map((row) => (
          <FilmStrip
            key={row}
            frames={fx.sheet.slice(row * 4, row * 4 + 4)}
            firstNo={first + row * 4}
            current={pick - row * 4}
            size={136}
            sheet
            label={`Contact sheet, strip ${row + 1}`}
          />
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        <button type="button" className={btnPrimary}>
          <Dice5Icon className="size-5" />
          Roll new sheet
          <KeyCap onFilm className="max-sm:hidden">
            Space
          </KeyCap>
        </button>
        <button type="button" className={btnSecondary}>
          <CheckIcon className="size-[18px]" />
          Keep frame {first + pick}
        </button>
        <p className="max-w-[22rem] text-[13px] text-graphite">
          Click a frame to keep it.
        </p>
      </div>
      <LockedLine titles={locked} verb="Every frame keeps" />
    </>
  );
};

/** The stage (DESIGN.md › Layout): the current avatar, its actions and the film-strip history. */
export const Stage = ({
  style,
  fx,
  view,
  onView,
  scope,
  onScope,
  customize,
}: {
  style: StyleDef;
  fx: StyleFixture;
  view: View;
  onView: (v: View) => void;
  scope: Scope;
  onScope: (scope: Scope) => void;
  /** The tablet customize-sheet trigger. */
  customize: ReactNode;
}) => {
  const locked = style.sections.filter((s) => s.locked).map((s) => s.title);
  return (
    <section
      aria-label="Avatar"
      className="stage @container relative flex min-w-0 flex-1 flex-col items-center px-6 pt-5 pb-4 max-sm:px-4 max-sm:pt-1"
    >
      <div className="flex h-8 w-full items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span className="edge-label">
            Frame <b className="font-bold text-ink">{fx.frameNo}</b> · seed{" "}
            {fx.seed}
          </span>
          <IconButton label="Copy share link" className={btnGhost}>
            <LinkIcon className="size-[15px]" />
          </IconButton>
        </div>
        <div className="flex items-center gap-2">
          {customize}
          <ViewToggle view={view} onView={onView} />
        </div>
      </div>
      {view === "single" ? (
        <SingleView
          style={style}
          fx={fx}
          locked={locked}
          scope={scope}
          onScope={onScope}
        />
      ) : (
        <GridView fx={fx} locked={locked} />
      )}
    </section>
  );
};
