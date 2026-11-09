// The six v1 styles and their parts, as data. The UI renders from this file (M1); in M2 it becomes
// each engine style's `parts`. Options are string IDs or palette colours, never objects.

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

// Geometric's Bauhaus palette.
const BH = {
  cream: "#F1E9DA",
  black: "#1E1E1E",
  red: "#D7263D",
  blue: "#1B4F9C",
  yellow: "#F4B400",
  teal: "#2E8B7A",
  pink: "#F29CA3",
} as const;

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
        colors: [
          "#FFD9DE",
          "#D4EEFF",
          "#E6E0FF",
          "#FFF0C2",
          "#D5F5E3",
          "#FFE2CC",
          "#F3E0F7",
          "#DDF3F5",
        ],
      },
      {
        kind: "swatches",
        title: "Skin",
        key: "skin",
        locked: true,
        colors: ["#FAD7C4", "#F2C1A6", "#DDA586", "#B97A5A", "#8C5A43"],
      },
      {
        kind: "tiles",
        title: "Hair",
        key: "hair",
        locked: true,
        options: [
          "short",
          "long",
          "bun",
          "curly",
          "side",
          "bob",
          "beanie",
          "spiky",
        ],
        crop: "34 18 132 132",
        sub: {
          label: "Colour",
          key: "hairC",
          colors: [
            "#2B2B3A",
            "#5A3825",
            "#C8743B",
            "#E9C46A",
            "#7B6CF6",
            "#E5637F",
            "#3E7CB1",
            "#3B2A20",
          ],
        },
      },
      {
        kind: "tiles",
        title: "Eyes",
        key: "eyes",
        options: ["dot", "oval", "happy", "wink"],
        crop: EYES_CROP,
        wide: true,
      },
      {
        kind: "tiles",
        title: "Mouth",
        key: "mouth",
        options: ["smile", "open", "smirk", "o"],
        crop: "74 108 52 26",
        wide: true,
      },
      {
        kind: "tiles",
        title: "Glasses",
        key: "glasses",
        options: ["none", "round", "square"],
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
        colors: [
          "#8EC5FF",
          "#FFB3C7",
          "#B8F2C2",
          "#FFE08A",
          "#C9B6FF",
          "#FFC59E",
          "#9FE7E0",
          "#F4B8E4",
        ],
      },
      {
        kind: "swatches",
        title: "Skin",
        key: "skin",
        locked: true,
        colors: ["#FFD8B8", "#F1B48C", "#D1916A", "#A86B4C", "#7A4A33"],
      },
      {
        kind: "tiles",
        title: "Hair",
        key: "hair",
        options: ["flat", "spiky", "long", "cap", "bun", "mohawk", "bald"],
        crop: "20 0 160 160",
        sub: {
          label: "Colour",
          key: "hc",
          colors: [
            "#3B2A20",
            "#1E1E2E",
            "#E6B655",
            "#D9573B",
            "#6C4AB6",
            "#3E9C8C",
            "#F2F2F2",
            "#E85D9A",
          ],
        },
      },
      {
        kind: "tiles",
        title: "Eyes",
        key: "eyes",
        options: ["normal", "big", "shades", "happy"],
        crop: "40 64 120 60",
        wide: true,
      },
      {
        kind: "tiles",
        title: "Mouth",
        key: "mouth",
        options: ["smile", "flat", "open"],
        crop: "50 90 100 50",
        wide: true,
      },
      {
        kind: "swatches",
        title: "Shirt",
        key: "shirt",
        colors: [
          "#3D7BF7",
          "#E84A5F",
          "#2EB872",
          "#F5A623",
          "#8E44AD",
          "#22313F",
          "#FF7F50",
        ],
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
        colors: [
          "#1F2A44",
          "#E8ECF4",
          "#FFE8D6",
          "#D9F2EC",
          "#2B2D42",
          "#EFE5FF",
          "#FFF4CC",
          "#DDEBFF",
        ],
      },
      {
        kind: "swatches",
        title: "Body colour",
        key: "metal",
        locked: true,
        colors: [
          "#C9D1DC",
          "#F2C14E",
          "#F28F6B",
          "#7FC8C8",
          "#A99BF2",
          "#F25F5C",
          "#8E9AAF",
          "#9AD17D",
        ],
      },
      {
        kind: "tiles",
        title: "Head",
        key: "head",
        options: ["boxy", "soft", "round", "wide"],
        crop: "36 40 128 128",
      },
      {
        kind: "tiles",
        title: "Eyes",
        key: "eyes",
        options: ["round", "pill", "arc", "cross", "visor", "ring", "heart"],
        crop: "56 66 88 44",
        wide: true,
      },
      {
        kind: "tiles",
        title: "Mouth",
        key: "mouth",
        options: ["eq", "line", "smile", "dots"],
        crop: "56 84 88 44",
        wide: true,
      },
      {
        kind: "tiles",
        title: "Antenna",
        key: "ant",
        options: ["ball", "double", "dish", "none"],
        crop: "40 4 120 60",
        wide: true,
      },
      {
        kind: "swatches",
        title: "Glow",
        key: "glow",
        colors: [
          "#5CF2FF",
          "#7CFF6B",
          "#FF5CA8",
          "#FFD23F",
          "#B18CFF",
          "#FF8A3D",
        ],
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
        colors: [
          "#FFB4A2",
          "#A0C4FF",
          "#FDE68A",
          "#B9F3C8",
          "#F5B8FF",
          "#9BF6FF",
          "#FFD6A5",
          "#C7B8FF",
        ],
      },
      {
        kind: "tiles",
        title: "Hair",
        key: "hair",
        locked: true,
        options: [
          "short",
          "bob",
          "bun",
          "curly",
          "long",
          "side",
          "spiky",
          "beanie",
        ],
        crop: "34 18 132 132",
      },
      {
        kind: "tiles",
        title: "Eyes",
        key: "eyes",
        options: ["dot", "line", "closed"],
        crop: EYES_CROP,
        wide: true,
      },
      {
        kind: "tiles",
        title: "Brows",
        key: "brow",
        options: ["flat", "raised", "angry"],
        crop: "68 70 64 32",
        wide: true,
      },
      {
        kind: "tiles",
        title: "Nose",
        key: "nose",
        options: ["angle", "hook", "button"],
        crop: "76 92 48 24",
        wide: true,
      },
      {
        kind: "tiles",
        title: "Mouth",
        key: "mouth",
        options: ["smile", "flat", "open", "smirk"],
        crop: "74 108 52 26",
        wide: true,
      },
      {
        kind: "tiles",
        title: "Shirt",
        key: "shirt",
        options: ["plain", "stripes", "collar", "pocket"],
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
        colors: [
          "#FFF1E6",
          "#E8F7FF",
          "#F0EBFF",
          "#E9FBEF",
          "#FFF8D6",
          "#FFE9EF",
          "#E6FAF8",
          "#F7EDE2",
        ],
      },
      {
        kind: "swatches",
        title: "Body colour",
        key: "body",
        locked: true,
        colors: [
          "#7C5CFF",
          "#FF6B8B",
          "#2EC4B6",
          "#FFB703",
          "#8AC926",
          "#FF8C42",
          "#4CC9F0",
          "#C77DFF",
        ],
      },
      {
        kind: "tiles",
        title: "Eyes",
        key: "eyes",
        options: ["one", "two", "three", "sleepy"],
        labels: ["One eye", "Two eyes", "Three eyes", "Sleepy"],
        crop: "36 62 128 64",
        wide: true,
      },
      {
        kind: "tiles",
        title: "Top",
        key: "top",
        options: ["horns", "antennae", "sprout", "ears", "tuft", "none"],
        crop: "30 18 140 70",
        wide: true,
      },
      {
        kind: "tiles",
        title: "Mouth",
        key: "mouth",
        options: ["grin", "fang", "o", "w", "tongue"],
        crop: "60 112 80 40",
        wide: true,
      },
      {
        kind: "tiles",
        title: "Pattern",
        key: "pattern",
        options: ["spots", "belly", "none"],
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
        colors: [BH.yellow, BH.blue, BH.red, BH.cream, BH.teal, BH.pink],
      },
      {
        kind: "swatches",
        title: "Face colour",
        key: "headC",
        locked: true,
        colors: [BH.cream, BH.yellow, BH.pink, BH.red, BH.teal],
      },
      {
        kind: "tiles",
        title: "Head",
        key: "headS",
        options: ["circle", "arch", "square", "pill"],
        crop: "30 26 140 140",
      },
      {
        kind: "tiles",
        title: "Hair",
        key: "hair",
        options: ["cap", "block", "triangle", "bun", "stripe", "arc", "none"],
        crop: "30 12 140 140",
        sub: {
          label: "Colour",
          key: "hairC",
          colors: [BH.black, BH.blue, BH.red],
        },
      },
      {
        kind: "tiles",
        title: "Eyes",
        key: "eyes",
        options: ["circle", "half", "square", "line"],
        crop: EYES_CROP,
        wide: true,
      },
      {
        kind: "tiles",
        title: "Mouth",
        key: "mouth",
        options: ["semi", "bar", "circle", "arc"],
        crop: "76 112 48 24",
        wide: true,
      },
      {
        kind: "tiles",
        title: "Nose",
        key: "nose",
        options: ["tri", "quarter", "circle", "none"],
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

/** The parts a style's customize panel lists (everything except the frame section). */
export const partsOf = (style: StyleDef): readonly Section[] =>
  style.sections.filter((s) => s.kind !== "frame");
