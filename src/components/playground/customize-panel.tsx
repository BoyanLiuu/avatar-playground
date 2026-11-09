import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import {
  CircleIcon,
  Dice5Icon,
  LockIcon,
  LockOpenIcon,
  SquareIcon,
  SquircleIcon,
} from "lucide-react";
import { useId } from "react";
import { AvatarImg } from "@/components/avatar-img";
import { PencilLoop, PencilUnderline } from "@/components/pencil/pencil";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  type Frame,
  type Section,
  type StyleDef,
  partsOf,
} from "@/content/styles";
import { type StyleFixture, optionLabel } from "@/lib/fixtures";
import { cn } from "@/lib/utils";
import { IconButton, WithTooltip, btnMini, btnSmall } from "./buttons";

// M1 is static: selections and locks show the fixture state; M2 wires them up.

const countLabel = (section: Section) => {
  if (section.kind === "frame")
    return `3 shapes · ${section.colors.length} ${section.key === "accent" ? "accents" : "colours"}`;
  return String(
    section.kind === "tiles" ? section.options.length : section.colors.length,
  );
};

const Swatches = ({
  label,
  colors,
  value,
  seed,
}: {
  label: string;
  colors: readonly string[];
  value: string;
  seed: number;
}) => (
  <RadioGroup
    aria-label={label}
    value={value}
    className="flex flex-wrap items-center gap-2"
  >
    {colors.map((color, k) => (
      <Radio.Root
        key={color}
        value={color}
        aria-label={color}
        className="relative block size-6 rounded-full shadow-[inset_0_0_0_1px_var(--swatch-ring)]"
        style={{ background: color }}
      >
        {color === value && (
          <PencilLoop w={24} h={24} pad={4} stroke={2.2} seed={seed + k} />
        )}
      </Radio.Root>
    ))}
  </RadioGroup>
);

const FRAMES: { value: Frame; label: string; Icon: typeof CircleIcon }[] = [
  { value: "circle", label: "Circle", Icon: CircleIcon },
  { value: "squircle", label: "Squircle", Icon: SquircleIcon },
  { value: "square", label: "Square", Icon: SquareIcon },
];

const FrameShapes = ({ value }: { value: Frame }) => (
  <RadioGroup
    aria-label="Frame shape"
    value={value}
    className="inline-flex shrink-0 gap-0.5 rounded-control border border-rule bg-tray p-[3px]"
  >
    {FRAMES.map(({ value: v, label, Icon }) => (
      <WithTooltip key={v} label={label}>
        <Radio.Root
          value={v}
          aria-label={label}
          className="grid h-[26px] w-[30px] place-items-center rounded-inner text-graphite aria-checked:bg-surface-on aria-checked:text-ink aria-checked:shadow-sm"
        >
          <Icon className="size-[15px]" />
        </Radio.Root>
      </WithTooltip>
    ))}
  </RadioGroup>
);

const Tiles = ({
  section,
  fx,
  seed,
}: {
  section: Extract<Section, { kind: "tiles" }>;
  fx: StyleFixture;
  seed: number;
}) => {
  const value = fx.selected[section.key];
  const [w, h] = section.wide ? [88, 40] : [56, 56];
  return (
    <RadioGroup
      aria-label={section.title}
      value={value}
      className={cn(
        "grid gap-2",
        section.wide
          ? "grid-cols-[repeat(4,88px)] max-sm:grid-cols-[repeat(4,80px)]"
          : "grid-cols-[repeat(6,56px)] max-sm:grid-cols-[repeat(5,56px)]",
      )}
    >
      {section.options.map((option, k) => (
        <Radio.Root
          key={option}
          value={option}
          aria-label={optionLabel(section, k)}
          className={cn(
            "relative block rounded-tile border border-rule bg-surface transition-colors duration-(--dur-fast) hover:border-control-edge",
            section.wide ? "h-10 w-[88px] max-sm:w-20" : "size-14",
          )}
        >
          <AvatarImg
            src={fx.tiles[section.key][k]}
            className="size-full rounded-[5px] object-cover"
          />
          {option === value && (
            <PencilLoop w={w} h={h} pad={5} seed={seed + k} fluid />
          )}
        </Radio.Root>
      ))}
    </RadioGroup>
  );
};

const LockToggle = ({ section }: { section: Section }) => (
  <WithTooltip
    label={section.locked ? `Unlock ${section.title}` : `Lock ${section.title}`}
  >
    <Toggle
      aria-label={`Lock ${section.title}`}
      pressed={!!section.locked}
      className={cn(
        btnMini,
        "min-w-0 p-0 aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper aria-pressed:hover:bg-ink",
      )}
    >
      {section.locked ? (
        <LockIcon className="size-[15px]" />
      ) : (
        <LockOpenIcon className="size-[15px]" />
      )}
    </Toggle>
  </WithTooltip>
);

/** The section's controls (everything below its header). */
const SectionBody = ({
  style,
  section,
  fx,
  index,
}: {
  style: StyleDef;
  section: Section;
  fx: StyleFixture;
  index: number;
}) => {
  const value = fx.selected[section.key];
  if (section.kind === "frame")
    return (
      <div className="flex items-center gap-3">
        <FrameShapes value={style.frame} />
        <Swatches
          label={
            section.key === "accent" ? "Accent colour" : "Background colour"
          }
          colors={section.colors}
          value={value}
          seed={11}
        />
      </div>
    );
  if (section.kind === "swatches")
    return (
      <Swatches
        label={section.title}
        colors={section.colors}
        value={value}
        seed={20 + index * 10}
      />
    );
  return (
    <>
      <Tiles section={section} fx={fx} seed={index * 10} />
      {section.sub && (
        <div className="mt-2.5 flex items-center gap-3">
          <span className="edge-label w-12 shrink-0">{section.sub.label}</span>
          <Swatches
            label={`${section.title} ${section.sub.label.toLowerCase()}`}
            colors={section.sub.colors}
            value={fx.selected[section.sub.key]}
            seed={70}
          />
        </div>
      )}
    </>
  );
};

const PartSection = ({
  style,
  section,
  fx,
  index,
}: {
  style: StyleDef;
  section: Section;
  fx: StyleFixture;
  index: number;
}) => {
  const id = useId();
  return (
    <section aria-labelledby={id} className="py-2 pb-2.5">
      <div className="mb-1.5 flex h-7 items-center gap-2">
        <h3
          id={id}
          className="relative font-edge text-[13px] leading-none font-semibold tracking-[0.07em] text-ink uppercase"
        >
          {section.title}
          {section.locked && <PencilUnderline seed={index + 3} />}
        </h3>
        <span className="text-[12px] text-graphite">{countLabel(section)}</span>
        <div className="ml-auto flex gap-1">
          <IconButton label={`Randomize ${section.title}`} className={btnMini}>
            <Dice5Icon className="size-[15px]" />
          </IconButton>
          <LockToggle section={section} />
        </div>
      </div>
      <SectionBody style={style} section={section} fx={fx} index={index} />
    </section>
  );
};

/** Every section of the style, stacked (desktop column and tablet sheet). */
export const CustomizeSections = ({
  style,
  fx,
}: {
  style: StyleDef;
  fx: StyleFixture;
}) => (
  <div className="divide-y divide-rule">
    {style.sections.map((section, i) => (
      <PartSection
        key={section.key}
        style={style}
        section={section}
        fx={fx}
        index={i}
      />
    ))}
  </div>
);

export const subtitleOf = (style: StyleDef) =>
  `${style.name} · ${partsOf(style).length} parts`;

const ShuffleUnlocked = () => (
  <button type="button" className={btnSmall}>
    <Dice5Icon className="size-[15px]" />
    Shuffle unlocked
  </button>
);

/** Desktop (≥1280px): the third column. Fits 1440×900 without scrolling; scrolls when shorter. */
export const CustomizeColumn = ({
  style,
  fx,
}: {
  style: StyleDef;
  fx: StyleFixture;
}) => (
  <aside
    aria-label="Customize"
    className="hidden w-[424px] shrink-0 flex-col border-l border-rule bg-panel xl:flex"
  >
    <div className="flex items-center justify-between border-b border-rule px-5 py-3">
      <div>
        <h2 className="text-[17px] leading-tight font-semibold">Customize</h2>
        <p className="mt-0.5 text-[12.5px] text-graphite">
          {subtitleOf(style)}
        </p>
      </div>
      <ShuffleUnlocked />
    </div>
    <ScrollArea className="min-h-0 flex-1">
      <div className="px-5">
        <CustomizeSections style={style} fx={fx} />
      </div>
    </ScrollArea>
  </aside>
);

/** Phone: a sheet at the end of the page with one tab per part (DESIGN.md › Navigation). */
export const CustomizePhone = ({
  style,
  fx,
  tab,
  onTab,
}: {
  style: StyleDef;
  fx: StyleFixture;
  tab: string;
  onTab: (key: string) => void;
}) => {
  const index = Math.max(
    0,
    style.sections.findIndex((s) => s.key === tab),
  );
  const section = style.sections[index];
  return (
    <section
      aria-label="Customize"
      className="mt-6 rounded-t-sheet bg-surface px-4 pt-2 pb-8 shadow-[0_-1px_0_var(--rule),0_-12px_32px_-12px_rgb(0_0_0/0.25)] sm:hidden"
    >
      <div
        aria-hidden="true"
        className="mx-auto mb-2.5 h-1 w-10 rounded-full bg-rule-2"
      />
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-semibold">Customize</h2>
        <ShuffleUnlocked />
      </div>
      <ToggleGroup
        aria-label="Parts"
        spacing={1.5}
        value={[section.key]}
        onValueChange={(v) => v[0] && onTab(v[0] as string)}
        className="mt-2.5 mb-3 w-full flex-wrap"
      >
        {style.sections.map((s, k) => (
          <ToggleGroupItem
            key={s.key}
            value={s.key}
            className="h-[30px] rounded-full border border-control-edge bg-surface px-3 text-[13px] font-semibold text-graphite aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper dark:aria-pressed:bg-surface-on dark:aria-pressed:text-ink"
          >
            {s.locked && (
              <LockIcon className="size-[13px]" aria-hidden="true" />
            )}
            <span className="relative">
              {s.kind === "frame" ? "Frame" : s.title}
              {s.locked && (
                <PencilUnderline seed={60 + k} stroke={3.5} offset={1} />
              )}
            </span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div className="flex items-center justify-between pb-2">
        <span className="text-[12px] text-graphite">{countLabel(section)}</span>
        <div className="flex gap-1">
          <IconButton label={`Randomize ${section.title}`} className={btnMini}>
            <Dice5Icon className="size-[15px]" />
          </IconButton>
          <LockToggle section={section} />
        </div>
      </div>
      <div className="overflow-x-auto">
        <SectionBody style={style} section={section} fx={fx} index={index} />
      </div>
    </section>
  );
};
