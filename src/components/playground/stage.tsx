"use client";

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
import { type ReactNode, useEffect, useRef } from "react";
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
import type { StyleDef, StyleId } from "@/content/styles";
import { avatarSrc } from "@/lib/avatar";
import { develop, drawOn, redraw, swap } from "@/lib/motion";
import { cn } from "@/lib/utils";
import {
  type Present,
  type View,
  sheetOf,
  useCurrent,
  usePlayground,
} from "@/store/playground";
import {
  IconButton,
  btnGhost,
  btnIcon,
  btnPrimary,
  btnSecondary,
  segItem,
  segTrack,
} from "./buttons";
import { type FilmFrame, FilmStrip } from "./film-strip";
import { KeyCap } from "./key-cap";
import { ScopeToggle } from "./style-list";

// The share link (M3.2) and export (M4) are shown but not wired yet.

const PNG_SIZES = (style: StyleDef) =>
  style.id === "pixel" ? [200, 400, 800, 1000] : [256, 512, 1024];

const PngMenu = ({ style }: { style: StyleDef }) => (
  <DropdownMenu>
    <DropdownMenuTrigger
      disabled
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

const ViewToggle = () => {
  const view = usePlayground((s) => s.view);
  const setView = usePlayground((s) => s.setView);
  return (
    <ToggleGroup
      aria-label="View"
      spacing={0.5}
      value={[view]}
      onValueChange={(v) => v[0] && setView(v[0] as View)}
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
};

/** "Randomize keeps …": every locked part, each with its yellow pencil underline. */
const LockedLine = ({
  styleId,
  titles,
  verb,
}: {
  styleId: StyleId;
  titles: string[];
  verb: string;
}) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const last = useRef({ styleId, titles });
  // A part locked just now gets its underline drawn on; switching style draws nothing.
  useEffect(() => {
    const before = last.current;
    last.current = { styleId, titles };
    if (before.styleId !== styleId) return;
    for (const chip of ref.current?.querySelectorAll<HTMLElement>(
      "[data-chip]",
    ) ?? [])
      if (!before.titles.includes(chip.dataset.chip!))
        drawOn(chip.querySelector(".pencil-mark"));
  });
  return (
    <p
      ref={ref}
      className="mt-3.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[13px] text-graphite"
    >
      {titles.length ? verb : "Nothing locked: Randomize changes every part"}
      {titles.map((title, k) => (
        <span
          key={title}
          data-chip={title}
          className="relative inline-flex items-center gap-1 font-semibold text-ink"
        >
          <LockIcon className="size-[13px]" aria-hidden="true" />
          {title}
          <PencilUnderline seed={40 + k} offset={2} />
        </span>
      ))}
    </p>
  );
};

const Toolbar = ({ withExport = false }: { withExport?: boolean }) => {
  const { memory, present } = useCurrent();
  const undo = usePlayground((s) => s.undo);
  const redo = usePlayground((s) => s.redo);
  const flip = usePlayground((s) => s.flip);
  const reset = usePlayground((s) => s.reset);
  return (
    <>
      <IconButton
        label="Undo"
        className={btnIcon}
        disabled={!memory.past.length}
        onClick={undo}
      >
        <Undo2Icon className="size-[18px]" />
      </IconButton>
      <IconButton
        label="Redo"
        className={btnIcon}
        disabled={!memory.future.length}
        onClick={redo}
      >
        <Redo2Icon className="size-[18px]" />
      </IconButton>
      {/* A toggle: pressed (ink, like a lock) while the avatar is mirrored. */}
      <IconButton
        label="Flip"
        aria-pressed={present.flip}
        className={cn(
          btnIcon,
          "aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper aria-pressed:hover:bg-ink",
        )}
        onClick={flip}
      >
        <FlipHorizontal2Icon className="size-[18px]" />
      </IconButton>
      <IconButton label="Reset" className={btnIcon} onClick={reset}>
        <RotateCcwIcon className="size-[18px]" />
      </IconButton>
      {withExport && (
        <>
          <IconButton label="Download PNG" className={btnIcon} disabled>
            <DownloadIcon className="size-[18px]" />
          </IconButton>
          <IconButton label="Copy SVG" className={btnIcon} disabled>
            <CopyIcon className="size-[18px]" />
          </IconButton>
        </>
      )}
    </>
  );
};

const RandomizeButton = ({ className }: { className?: string }) => {
  const roll = usePlayground((s) => s.roll);
  return (
    <button type="button" className={cn(btnPrimary, className)} onClick={roll}>
      <Dice5Icon className="size-5" />
      Randomize
      <KeyCap onFilm className="max-sm:hidden">
        Space
      </KeyCap>
    </button>
  );
};

/** The history strip: the last `count` frames in the current frame shape, the current circled. */
const History = ({
  id,
  present,
  count,
  size,
  compact,
  roll,
}: {
  id: StyleId;
  present: Present;
  count: number;
  size: number;
  compact?: boolean;
  roll: number;
}) => {
  const restore = usePlayground((s) => s.restore);
  const frames: FilmFrame[] = present.shots.slice(-count).map((shot) => ({
    key: `${id}-${shot.no}`,
    no: shot.no,
    src: avatarSrc(id, shot.config, {
      frame: present.frame,
      flip: present.flip,
    }),
  }));
  const circled = frames.findIndex((f) => f.no === present.current);
  return (
    <FilmStrip
      frames={frames}
      circled={circled < 0 ? null : circled}
      size={size}
      compact={compact}
      label="Earlier rolls"
      onFrame={(i) => restore(frames[i].no)}
      roll={roll}
    />
  );
};

const SingleView = ({ locked }: { locked: string[] }) => {
  const { id, style, present, shot } = useCurrent();
  const rollId = usePlayground((s) => s.rollId);
  const scope = usePlayground((s) => s.scope);
  const setScope = usePlayground((s) => s.setScope);
  const src = avatarSrc(id, shot.config, {
    frame: present.frame,
    flip: present.flip,
  });

  // The roll develops the new print and redraws the crop marks; any other change swaps it.
  const print = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const last = useRef({ rollId, src });
  useEffect(() => {
    const before = last.current;
    last.current = { rollId, src };
    if (before.rollId !== rollId) {
      develop(img.current);
      redraw(print.current);
    } else if (before.src !== src) swap(img.current);
  }, [rollId, src]);

  return (
    <>
      <div
        ref={print}
        className="relative mt-7 rounded-hero bg-print p-3 shadow-print max-sm:mt-6 max-sm:p-2"
      >
        <AvatarImg
          ref={img}
          src={src}
          alt={`Current avatar: ${style.name}, frame ${shot.no}`}
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
        <RandomizeButton />
        <PngMenu style={style} />
        <button type="button" className={btnSecondary} disabled>
          <CopyIcon className="size-[18px]" />
          Copy SVG
        </button>
      </div>

      {/* Phone: Randomize spans the width over six equal tools; the scope moves here from the rail. */}
      <div className="mt-5 grid w-full gap-2 sm:hidden">
        <RandomizeButton className="w-full justify-center" />
        <div className="flex gap-2 [&>button]:w-auto [&>button]:flex-1">
          <Toolbar withExport />
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="edge-label">Randomize from</span>
          <ScopeToggle scope={scope} onScope={setScope} className="w-auto" />
        </div>
      </div>

      <LockedLine styleId={id} titles={locked} verb="Randomize keeps" />

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
          <History
            id={id}
            present={present}
            count={9}
            size={64}
            roll={rollId}
          />
        </div>
        <div className="sm:hidden">
          <History
            id={id}
            present={present}
            count={7}
            size={44}
            compact
            roll={rollId}
          />
        </div>
      </section>
    </>
  );
};

const GridView = ({ locked }: { locked: string[] }) => {
  const { id, memory } = useCurrent();
  const rollSheet = usePlayground((s) => s.rollSheet);
  const pickFrame = usePlayground((s) => s.pickFrame);
  const keepFrame = usePlayground((s) => s.keepFrame);
  const first = memory.next;
  const { pick } = memory;
  const frames = sheetOf(id, memory).map((config, i) => ({
    key: `${memory.sheet}-${i}`,
    no: first + i,
    src: avatarSrc(id, config, {
      frame: memory.present.frame,
      flip: memory.present.flip,
    }),
  }));
  return (
    <>
      <div
        key={memory.sheet}
        className="sheet-in mt-6 flex w-full flex-col items-center gap-3"
      >
        {[0, 1, 2].map((row) => (
          <FilmStrip
            key={row}
            frames={frames.slice(row * 4, row * 4 + 4)}
            circled={pick === null ? null : pick - row * 4}
            size={136}
            sheet
            label={`Contact sheet, strip ${row + 1}`}
            onFrame={(i) => pickFrame(row * 4 + i)}
          />
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        <button type="button" className={btnPrimary} onClick={rollSheet}>
          <Dice5Icon className="size-5" />
          Roll new sheet
          <KeyCap onFilm className="max-sm:hidden">
            Space
          </KeyCap>
        </button>
        <button
          type="button"
          className={btnSecondary}
          disabled={pick === null}
          onClick={keepFrame}
        >
          <CheckIcon className="size-[18px]" />
          {pick === null ? "Keep frame" : `Keep frame ${first + pick}`}
        </button>
        <p className="max-w-[22rem] text-[13px] text-graphite">
          Click a frame to pick it.
        </p>
      </div>
      <LockedLine styleId={id} titles={locked} verb="Every frame keeps" />
    </>
  );
};

/** The stage (DESIGN.md › Layout): the current avatar, its actions and the film-strip history. */
export const Stage = ({
  customize,
}: {
  /** The tablet customize-sheet trigger. */
  customize: ReactNode;
}) => {
  const { style, memory, shot } = useCurrent();
  const view = usePlayground((s) => s.view);
  const locked = style.sections
    .filter((s) => memory.locks.includes(s.key))
    .map((s) => s.title);
  return (
    <section
      aria-label="Avatar"
      className="stage @container relative flex min-w-0 flex-1 flex-col items-center px-6 pt-5 pb-4 max-sm:px-4 max-sm:pt-1"
    >
      <div className="flex h-8 w-full items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span className="edge-label">
            Frame <b className="font-bold text-ink">{shot.no}</b> · seed{" "}
            {shot.seed}
          </span>
          <IconButton label="Copy share link" className={btnGhost} disabled>
            <LinkIcon className="size-[15px]" />
          </IconButton>
        </div>
        <div className="flex items-center gap-2">
          {customize}
          <ViewToggle />
        </div>
      </div>
      {view === "single" ? (
        <SingleView locked={locked} />
      ) : (
        <GridView locked={locked} />
      )}
    </section>
  );
};
