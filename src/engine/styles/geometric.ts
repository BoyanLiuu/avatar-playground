// 08 · Geometric: faces from circles, arcs and triangles in a Bauhaus palette (ported from the
// prototype).
import { z } from "zod/mini";
import { circleD, shade } from "../geometry";
import { defineStyle } from "../types";

export const BH = {
  cream: "#F1E9DA",
  black: "#1E1E1E",
  red: "#D7263D",
  blue: "#1B4F9C",
  yellow: "#F4B400",
  teal: "#2E8B7A",
  pink: "#F29CA3",
} as const;

const ALL = [
  BH.cream,
  BH.black,
  BH.red,
  BH.blue,
  BH.yellow,
  BH.teal,
  BH.pink,
] as const;

export const GEOMETRIC = {
  bg: [BH.yellow, BH.blue, BH.red, BH.cream, BH.teal, BH.pink],
  headC: [BH.cream, BH.yellow, BH.pink, BH.red, BH.teal],
  hairC: [BH.black, BH.blue, BH.red],
  headS: ["circle", "arch", "square", "pill"],
  hair: ["cap", "block", "triangle", "bun", "stripe", "arc", "none"],
  eyes: ["circle", "half", "square", "line"],
  mouth: ["semi", "bar", "circle", "arc"],
  nose: ["tri", "quarter", "circle", "none"],
  // Not parts: rolled with the avatar.
  splitC: [BH.cream, BH.yellow, BH.pink],
  deco: ["ring", "quarter", "stripes", "dots"],
  bodyS: ["semi", "trap", "tri"],
} as const;

const schema = z.strictObject({
  bg: z.enum(GEOMETRIC.bg),
  headC: z.enum(GEOMETRIC.headC),
  bodyC: z.enum(ALL),
  hairC: z.enum(GEOMETRIC.hairC),
  decoC: z.enum(ALL),
  splitC: z.enum(GEOMETRIC.splitC),
  headS: z.enum(GEOMETRIC.headS),
  hair: z.enum(GEOMETRIC.hair),
  eyes: z.enum(GEOMETRIC.eyes),
  nose: z.enum(GEOMETRIC.nose),
  mouth: z.enum(GEOMETRIC.mouth),
  deco: z.enum(GEOMETRIC.deco),
  bodyS: z.enum(GEOMETRIC.bodyS),
  split: z.boolean(),
  /** Where the pupils' highlights sit. */
  pupil: z.literal([-3, 0, 3]),
  cheek: z.boolean(),
});
export type GeometricConfig = z.infer<typeof schema>;

const HEAD = {
  circle: circleD(100, 92, 40),
  arch: "M62 136 V92 A38 38 0 0 1 138 92 V136 Z",
  square: "M62 52 H138 V136 H62 Z",
  pill: "M100 48 A36 36 0 0 1 136 84 V100 A36 36 0 0 1 64 100 V84 A36 36 0 0 1 100 48 Z",
};

const BODY = {
  semi: "M26 200 A74 74 0 0 1 174 200 Z",
  trap: "M36 200 L58 150 L142 150 L164 200 Z",
  tri: "M100 136 L178 200 L22 200 Z",
};

export const geometric = defineStyle<GeometricConfig>({
  id: "geometric",
  schema,
  defaults: {
    bg: BH.yellow,
    headC: BH.teal,
    bodyC: BH.black,
    hairC: BH.red,
    decoC: BH.blue,
    splitC: BH.pink,
    headS: "circle",
    hair: "cap",
    eyes: "circle",
    nose: "tri",
    mouth: "semi",
    deco: "quarter",
    bodyS: "trap",
    split: false,
    pupil: 3,
    cheek: true,
  },

  random(r, keep = {}) {
    const c = {
      bg: r.deck("bg", [
        BH.yellow,
        BH.blue,
        BH.red,
        BH.cream,
        BH.teal,
        BH.pink,
        BH.blue,
        BH.yellow,
      ]),
      headS: r.deck("head", GEOMETRIC.headS),
      hair: r.deck("hair", [
        "cap",
        "block",
        "triangle",
        "bun",
        "stripe",
        "arc",
        "none",
        "cap",
      ]),
      eyes: r.deck("eyes", ["circle", "half", "square", "line", "circle"]),
      nose: r.deck("nose", GEOMETRIC.nose),
      mouth: r.deck("mouth", GEOMETRIC.mouth),
      deco: r.deck("deco", GEOMETRIC.deco),
      bodyS: r.deck("body", GEOMETRIC.bodyS),
    };
    // The colours are picked last so none repeats the background or the face.
    const rolls = Array.from({ length: 5 }, () => r.next());
    const flags = {
      split: r.chance(0.35),
      pupil: r.pick([-3, 0, 3]),
      cheek: r.chance(0.5),
    };
    const base = { ...c, ...flags, ...keep };
    const rp = <T extends string>(list: readonly T[], k: number) =>
      list[Math.floor(rolls[k] * list.length)] as T | undefined;
    const not =
      (...ex: string[]) =>
      (col: string) =>
        !ex.includes(col);
    const { bg } = base;
    const headC =
      keep.headC ?? rp(GEOMETRIC.headC.filter(not(bg)), 0) ?? BH.cream;
    const bodyC = keep.bodyC ?? rp(ALL.filter(not(bg, headC)), 1) ?? BH.black;
    const hairC =
      keep.hairC ??
      rp(GEOMETRIC.hairC.filter(not(bg, headC, bodyC)), 2) ??
      BH.black;
    const decoC =
      keep.decoC ?? rp(ALL.filter(not(bg, headC, BH.black)), 3) ?? BH.black;
    const splitC =
      keep.splitC ?? rp(GEOMETRIC.splitC.filter(not(headC, bg)), 4) ?? BH.cream;
    return { ...base, headC, bodyC, hairC, decoC, splitC };
  },

  render(c, uid, { transparent } = {}) {
    const { bg, headC, bodyC, hairC, decoC, splitC, hair } = c;
    const headD = HEAD[c.headS];
    const o = [
      `<defs><clipPath id="${uid}-h"><path d="${headD}"/></clipPath></defs>`,
      transparent ? "" : `<rect width="200" height="200" fill="${bg}"/>`,
    ];
    if (!transparent)
      o.push(
        {
          ring: `<circle cx="158" cy="42" r="20" fill="none" stroke="${decoC}" stroke-width="10"/>`,
          quarter: `<path d="M200 0 V92 A92 92 0 0 1 108 0 Z" fill="${decoC}"/>`,
          stripes: `<g fill="${decoC}">${[0, 1, 2].map((k) => `<rect x="18" y="${22 + k * 12}" width="34" height="6"/>`).join("")}</g>`,
          dots: `<g fill="${decoC}">${[0, 1, 2].flatMap((k) => [0, 1, 2].map((m) => `<circle cx="${152 + k * 12}" cy="${24 + m * 12}" r="3.2"/>`)).join("")}</g>`,
        }[c.deco],
      );
    o.push(`<path d="${BODY[c.bodyS]}" fill="${bodyC}"/>`);
    o.push(
      `<rect x="90" y="124" width="20" height="32" fill="${shade(headC, -0.15)}"/>`,
    );
    if (hair === "bun")
      o.push(`<circle cx="100" cy="40" r="15" fill="${hairC}"/>`);
    o.push(`<path d="${headD}" fill="${headC}"/>`);
    if (c.split)
      o.push(
        `<g clip-path="url(#${uid}-h)"><rect x="100" y="0" width="100" height="200" fill="${splitC}"/></g>`,
      );
    if (hair === "cap" || hair === "bun")
      o.push(`<path d="M58 82 A42 38 0 0 1 142 82 Z" fill="${hairC}"/>`);
    if (hair === "block")
      o.push(`<rect x="58" y="40" width="84" height="32" fill="${hairC}"/>`);
    if (hair === "triangle")
      o.push(`<path d="M54 80 L100 24 L146 80 Z" fill="${hairC}"/>`);
    if (hair === "stripe")
      o.push(`<rect x="88" y="22" width="24" height="52" fill="${hairC}"/>`);
    if (hair === "arc")
      o.push(
        `<path d="M56 96 A44 44 0 0 1 144 96" fill="none" stroke="${hairC}" stroke-width="14"/>`,
      );
    const k = BH.black;
    const wd = "#FBF7EF";
    for (const x of [84, 116]) {
      if (c.eyes === "circle")
        o.push(
          `<circle cx="${x}" cy="98" r="9" fill="${k}"/><circle cx="${x + c.pupil}" cy="96" r="3.4" fill="${wd}"/>`,
        );
      if (c.eyes === "half")
        o.push(`<path d="M${x - 9} 96 A9 9 0 0 0 ${x + 9} 96 Z" fill="${k}"/>`);
      if (c.eyes === "square")
        o.push(
          `<rect x="${x - 6}" y="92" width="12" height="12" fill="${k}"/>`,
        );
      if (c.eyes === "line")
        o.push(`<rect x="${x - 9}" y="96" width="18" height="5" fill="${k}"/>`);
    }
    const nc = decoC === headC ? bodyC : decoC;
    if (c.nose === "tri")
      o.push(`<path d="M100 100 L91 118 L103 118 Z" fill="${nc}"/>`);
    if (c.nose === "quarter")
      o.push(`<path d="M100 118 V104 A14 14 0 0 1 114 118 Z" fill="${nc}"/>`);
    if (c.nose === "circle")
      o.push(`<circle cx="100" cy="110" r="5" fill="${nc}"/>`);
    const mc = headC === BH.red ? k : BH.red;
    if (c.mouth === "semi")
      o.push(`<path d="M88 122 A12 12 0 0 0 112 122 Z" fill="${mc}"/>`);
    if (c.mouth === "bar")
      o.push(`<rect x="86" y="123" width="28" height="6" fill="${mc}"/>`);
    if (c.mouth === "circle")
      o.push(`<circle cx="100" cy="127" r="6.5" fill="${mc}"/>`);
    if (c.mouth === "arc")
      o.push(
        `<path d="M86 122 A14 10 0 0 0 114 122" fill="none" stroke="${k}" stroke-width="5"/>`,
      );
    if (c.cheek)
      o.push(
        `<circle cx="72" cy="117" r="7" fill="${headC === BH.pink ? BH.red : BH.pink}"/>`,
      );
    return o.join("");
  },
});
