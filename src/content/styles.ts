// The six v1 styles and their parts, as data: titles, crops, labels and default locks. The option
// IDs and palettes come from each engine style, so the panel and the renderer can never disagree.
import { DOODLE } from "@/engine/styles/doodle";
import { FLAT } from "@/engine/styles/flat";
import { GEOMETRIC } from "@/engine/styles/geometric";
import { MONSTERS } from "@/engine/styles/monsters";
import { PIXEL } from "@/engine/styles/pixel";
import { ROBOTS } from "@/engine/styles/robots";

export type StyleId =
  "flat" | "pixel" | "robots" | "doodle" | "monsters" | "geometric";

export type Frame = "circle" | "squircle" | "square";

type SectionBase = {
  /** Shown in the panel header, the phone tabs and the style list's part summary. */
  title: string;
  /** Config field this part controls. */
  key: string;
  /** Locked by default. */
  locked?: boolean;
};

/** Frame shape plus background colour (or the accent, for Line Doodle). */
export type FrameSection = SectionBase & {
  kind: "frame";
  colors: readonly string[];
};

export type SwatchSection = SectionBase & {
  kind: "swatches";
  colors: readonly string[];
};

export type TileSection = SectionBase & {
  kind: "tiles";
  options: readonly string[];
  /** Human labels for the options (defaults to the capitalised ID). */
  labels?: readonly string[];
  /** viewBox the option tiles crop to, in the 200-unit avatar space. */
  crop: string;
  /** 88x40 tiles in a 4-up grid instead of 56px squares in a 6-up grid. */
  wide?: boolean;
  /** A second colour row inside the section (e.g. hair colour). */
  sub?: { label: string; key: string; colors: readonly string[] };
};

export type Section = FrameSection | SwatchSection | TileSection;

export type StyleDef = {
  id: StyleId;
  name: string;
  frame: Frame;
  sections: readonly Section[];
};

const EYES_CROP = "66 83 68 34";

export const STYLES: readonly StyleDef[] = [
  {
    id: "flat",
    name: "Flat Cartoon",
    frame: "squircle",
    sections: [
      {
        kind: "frame",
        title: "Frame & background",
        key: "bg",
        colors: FLAT.bg,
      },
      {
        kind: "swatches",
        title: "Skin",
        key: "skin",
        locked: true,
        colors: FLAT.skin,
      },
      {
        kind: "tiles",
        title: "Hair",
        key: "hair",
        locked: true,
        options: FLAT.hair,
        crop: "34 18 132 132",
        sub: {
          label: "Colour",
          key: "hairC",
          colors: FLAT.hairC,
        },
      },
      {
        kind: "tiles",
        title: "Eyes",
        key: "eyes",
        options: FLAT.eyes,
        crop: EYES_CROP,
        wide: true,
      },
      {
        kind: "tiles",
        title: "Mouth",
        key: "mouth",
        options: FLAT.mouth,
        crop: "74 108 52 26",
        wide: true,
      },
      {
        kind: "tiles",
        title: "Glasses",
        key: "glasses",
        options: FLAT.glasses,
        crop: "58 80 84 42",
        wide: true,
      },
    ],
  },
  {
    id: "pixel",
    name: "Pixel Art",
    frame: "square",
    sections: [
      {
        kind: "frame",
        title: "Frame & background",
        key: "bg",
        colors: PIXEL.bg,
      },
      {
        kind: "swatches",
        title: "Skin",
        key: "skin",
        locked: true,
        colors: PIXEL.skin,
      },
      {
        kind: "tiles",
        title: "Hair",
        key: "hair",
        options: PIXEL.hair,
        crop: "20 0 160 160",
        sub: {
          label: "Colour",
          key: "hc",
          colors: PIXEL.hc,
        },
      },
      {
        kind: "tiles",
        title: "Eyes",
        key: "eyes",
        options: PIXEL.eyes,
        crop: "40 64 120 60",
        wide: true,
      },
      {
        kind: "tiles",
        title: "Mouth",
        key: "mouth",
        options: PIXEL.mouth,
        crop: "50 90 100 50",
        wide: true,
      },
      {
        kind: "swatches",
        title: "Shirt",
        key: "shirt",
        colors: PIXEL.shirt,
      },
    ],
  },
  {
    id: "robots",
    name: "Robots",
    frame: "squircle",
    sections: [
      {
        kind: "frame",
        title: "Frame & background",
        key: "bg",
        colors: ROBOTS.bg,
      },
      {
        kind: "swatches",
        title: "Body colour",
        key: "metal",
        locked: true,
        colors: ROBOTS.metal,
      },
      {
        kind: "tiles",
        title: "Head",
        key: "head",
        options: ROBOTS.head,
        crop: "36 40 128 128",
      },
      {
        kind: "tiles",
        title: "Eyes",
        key: "eyes",
        options: ROBOTS.eyes,
        crop: "56 66 88 44",
        wide: true,
      },
      {
        kind: "tiles",
        title: "Mouth",
        key: "mouth",
        options: ROBOTS.mouth,
        crop: "56 84 88 44",
        wide: true,
      },
      {
        kind: "tiles",
        title: "Antenna",
        key: "ant",
        options: ROBOTS.ant,
        crop: "40 4 120 60",
        wide: true,
      },
      {
        kind: "swatches",
        title: "Glow",
        key: "glow",
        colors: ROBOTS.glow,
      },
    ],
  },
  {
    id: "doodle",
    name: "Line Doodle",
    frame: "circle",
    sections: [
      {
        kind: "frame",
        title: "Frame & accent",
        key: "accent",
        colors: DOODLE.accent,
      },
      {
        kind: "tiles",
        title: "Hair",
        key: "hair",
        locked: true,
        options: DOODLE.hair,
        crop: "34 18 132 132",
      },
      {
        kind: "tiles",
        title: "Eyes",
        key: "eyes",
        options: DOODLE.eyes,
        crop: EYES_CROP,
        wide: true,
      },
      {
        kind: "tiles",
        title: "Brows",
        key: "brow",
        options: DOODLE.brow,
        crop: "68 70 64 32",
        wide: true,
      },
      {
        kind: "tiles",
        title: "Nose",
        key: "nose",
        options: DOODLE.nose,
        crop: "76 92 48 24",
        wide: true,
      },
      {
        kind: "tiles",
        title: "Mouth",
        key: "mouth",
        options: DOODLE.mouth,
        crop: "74 108 52 26",
        wide: true,
      },
      {
        kind: "tiles",
        title: "Shirt",
        key: "shirt",
        options: DOODLE.shirt,
        crop: "20 130 160 80",
        wide: true,
      },
    ],
  },
  {
    id: "monsters",
    name: "Monsters",
    frame: "squircle",
    sections: [
      {
        kind: "frame",
        title: "Frame & background",
        key: "bg",
        colors: MONSTERS.bg,
      },
      {
        kind: "swatches",
        title: "Body colour",
        key: "body",
        locked: true,
        colors: MONSTERS.body,
      },
      {
        kind: "tiles",
        title: "Eyes",
        key: "eyes",
        options: MONSTERS.eyes,
        labels: ["One eye", "Two eyes", "Three eyes", "Sleepy"],
        crop: "36 62 128 64",
        wide: true,
      },
      {
        kind: "tiles",
        title: "Top",
        key: "top",
        options: MONSTERS.top,
        crop: "30 18 140 70",
        wide: true,
      },
      {
        kind: "tiles",
        title: "Mouth",
        key: "mouth",
        options: MONSTERS.mouth,
        crop: "60 112 80 40",
        wide: true,
      },
      {
        kind: "tiles",
        title: "Pattern",
        key: "pattern",
        options: MONSTERS.pattern,
        crop: "34 104 132 66",
        wide: true,
      },
    ],
  },
  {
    id: "geometric",
    name: "Geometric",
    frame: "square",
    sections: [
      {
        kind: "frame",
        title: "Frame & background",
        key: "bg",
        colors: GEOMETRIC.bg,
      },
      {
        kind: "swatches",
        title: "Face colour",
        key: "headC",
        locked: true,
        colors: GEOMETRIC.headC,
      },
      {
        kind: "tiles",
        title: "Head",
        key: "headS",
        options: GEOMETRIC.headS,
        crop: "30 26 140 140",
      },
      {
        kind: "tiles",
        title: "Hair",
        key: "hair",
        options: GEOMETRIC.hair,
        crop: "30 12 140 140",
        sub: {
          label: "Colour",
          key: "hairC",
          colors: GEOMETRIC.hairC,
        },
      },
      {
        kind: "tiles",
        title: "Eyes",
        key: "eyes",
        options: GEOMETRIC.eyes,
        crop: EYES_CROP,
        wide: true,
      },
      {
        kind: "tiles",
        title: "Mouth",
        key: "mouth",
        options: GEOMETRIC.mouth,
        crop: "76 112 48 24",
        wide: true,
      },
      {
        kind: "tiles",
        title: "Nose",
        key: "nose",
        options: GEOMETRIC.nose,
        crop: "76 96 48 24",
        wide: true,
      },
    ],
  },
];

export const getStyle = (id: StyleId): StyleDef => {
  const style = STYLES.find((s) => s.id === id);
  if (!style) throw new Error(`Unknown style: ${id}`);
  return style;
};

/** An option's human label (defaults to the capitalised ID). */
export const optionLabel = (section: TileSection, index: number) => {
  const id = section.options[index];
  return section.labels?.[index] ?? id.charAt(0).toUpperCase() + id.slice(1);
};

/** The parts a style's customize panel lists (everything except the frame section). */
export const partsOf = (style: StyleDef): readonly Section[] =>
  style.sections.filter((s) => s.kind !== "frame");
