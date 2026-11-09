// 05 · Line Doodle: hand-drawn monoline, solid black hair, one accent colour (ported from the
// prototype).
import { z } from "zod";
import { blobPath, f, shade } from "../geometry";
import { draw32, makeRng } from "../rng";
import { defineStyle } from "../types";
import { BODY, FULL_BEARD, HAIR } from "./human";

export const DOODLE = {
  accent: [
    "#FFB4A2",
    "#A0C4FF",
    "#FDE68A",
    "#B9F3C8",
    "#F5B8FF",
    "#9BF6FF",
    "#FFD6A5",
    "#C7B8FF",
  ],
  hair: ["short", "bob", "bun", "curly", "long", "side", "spiky", "beanie"],
  eyes: ["dot", "line", "closed"],
  brow: ["flat", "raised", "angry"],
  nose: ["angle", "hook", "button"],
  mouth: ["smile", "flat", "open", "smirk"],
  shirt: ["plain", "stripes", "collar", "pocket"],
} as const;

export const NOSE = {
  angle: "M100 97 L95 110 L102 111",
  hook: "M99 99 C94 108 97 113 104 111",
  button: "M96 108 Q100 112 104 108",
};

const BROW = {
  flat: "M80 85 L92 84 M108 84 L120 85",
  raised: "M80 87 Q86 80 92 84 M108 84 Q114 80 120 87",
  angry: "M80 82 L92 87 M108 87 L120 82",
};

const schema = z.strictObject({
  accent: z.enum(DOODLE.accent),
  hair: z.enum(DOODLE.hair),
  eyes: z.enum(DOODLE.eyes),
  brow: z.enum(DOODLE.brow),
  nose: z.enum(DOODLE.nose),
  shirt: z.enum(DOODLE.shirt),
  beard: z.boolean(),
  mouth: z.enum(DOODLE.mouth),
  glasses: z.boolean(),
  blush: z.boolean(),
  /** Seeds the hand-drawn head outline and where the accent blob sits. */
  wobble: z
    .int()
    .min(0)
    .max(2 ** 32 - 1),
});
export type DoodleConfig = z.infer<typeof schema>;

/** The hand-drawn parts `wobble` decides. */
export const doodleTexture = (wobble: number) => {
  const t = makeRng(wobble);
  const ax = f(t.range(112, 124));
  const ay = f(t.range(82, 96));
  return { ax, ay, headD: blobPath(100, 92, 38, 44, 12, 0.02, t) };
};

const INK = "#1D1D1F";
const S = (w = 3.2) =>
  `stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;

export const doodle = defineStyle<DoodleConfig>({
  id: "doodle",
  schema,
  defaults: {
    accent: "#A0C4FF",
    hair: "bob",
    eyes: "dot",
    brow: "raised",
    nose: "hook",
    shirt: "stripes",
    beard: false,
    mouth: "smile",
    glasses: false,
    blush: true,
    wobble: 18072,
  },

  random(r, keep = {}) {
    return {
      accent: r.deck("accent", DOODLE.accent),
      hair: r.deck("hair", DOODLE.hair),
      eyes: r.deck("eyes", ["dot", "line", "closed", "dot", "line"]),
      brow: r.deck("brow", ["flat", "raised", "angry", "raised"]),
      nose: r.deck("nose", DOODLE.nose),
      shirt: r.deck("shirt", DOODLE.shirt),
      beard: r.chance(0.45),
      mouth: r.deck("mouth", DOODLE.mouth),
      glasses: r.chance(0.3),
      wobble: draw32(r),
      blush: r.chance(0.5),
      ...keep,
    };
  },

  render(c, uid) {
    const { ax, ay, headD } = doodleTexture(c.wobble);
    const beard = ["short", "side", "spiky"].includes(c.hair) && c.beard;
    const mouth = beard ? "smile" : c.mouth;
    const H = HAIR[c.hair];
    const inked = (ds: readonly string[]) =>
      ds.map((d) => `<path d="${d}" fill="${INK}" ${S()}/>`).join("");
    const o = [
      `<rect width="200" height="200" fill="#F7F4EE"/>`,
      `<circle cx="${ax}" cy="${ay}" r="62" fill="${c.accent}"/>`,
      inked(H.back),
      `<path d="M90 124 L89 158 M110 124 L111 158" fill="none" ${S()}/>`,
      `<defs><clipPath id="${uid}-body"><path d="${BODY}"/></clipPath></defs><path d="${BODY}" fill="#fff"/>`,
    ];
    if (c.shirt === "stripes")
      o.push(
        `<g clip-path="url(#${uid}-body)" ${S(5)}>${[170, 182, 194].map((y) => `<path d="M20 ${y} L180 ${y}"/>`).join("")}</g>`,
      );
    o.push(`<path d="${BODY}" fill="none" ${S()}/>`);
    if (c.shirt === "collar")
      o.push(`<path d="M86 153 L100 168 L114 153" fill="none" ${S()}/>`);
    else o.push(`<path d="M86 154 Q100 163 114 154" fill="none" ${S()}/>`);
    if (c.shirt === "pocket")
      o.push(
        `<path d="M124 176 L142 176 L142 190 Q133 195 124 190 Z" fill="none" ${S()}/>`,
      );
    o.push(
      `<circle cx="63" cy="98" r="8.5" fill="#fff" ${S()}/><circle cx="137" cy="98" r="8.5" fill="#fff" ${S()}/>`,
    );
    o.push(`<path d="${headD}" fill="#fff" ${S()}/>`);
    if (beard) o.push(`<path d="${FULL_BEARD}" fill="${INK}" ${S()}/>`);
    o.push(`<path d="${BROW[c.brow]}" fill="none" ${S(4.2)}/>`);
    o.push(inked(H.front));
    if (c.hair === "beanie")
      o.push(
        `<path d="M58 86 C56 34 144 34 142 86 Z" fill="${c.accent}" ${S()}/><rect x="54" y="72" width="92" height="18" rx="9" fill="#fff" ${S()}/><circle cx="100" cy="38" r="9" fill="#fff" ${S()}/>`,
      );
    if (c.eyes === "dot")
      o.push(
        `<circle cx="86" cy="99" r="3.6" fill="${INK}"/><circle cx="114" cy="99" r="3.6" fill="${INK}"/>`,
      );
    if (c.eyes === "line")
      o.push(
        `<path d="M86 95 L86 102 M114 95 L114 102" fill="none" ${S(4.2)}/>`,
      );
    if (c.eyes === "closed")
      o.push(
        `<path d="M80 99 Q86 104 92 99 M108 99 Q114 104 120 99" fill="none" ${S()}/>`,
      );
    o.push(`<path d="${NOSE[c.nose]}" fill="none" ${S()}/>`);
    const mc = beard ? "#fff" : INK;
    const MS = `stroke="${mc}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"`;
    o.push(
      {
        smile: `<path d="M90 121 Q100 129 110 121" fill="none" ${MS}/>`,
        flat: `<path d="M93 123 L107 123" fill="none" ${MS}/>`,
        open: `<path d="M90 119 Q100 134 110 119 Z" fill="${mc}" ${MS}/>`,
        smirk: `<path d="M92 123 Q103 126 110 117" fill="none" ${MS}/>`,
      }[mouth],
    );
    if (c.blush)
      o.push(
        `<path d="M70 116 L74 110 M75 116 L79 110 M121 116 L125 110 M126 116 L130 110" stroke="${shade(c.accent, -0.35)}" stroke-width="2.5" stroke-linecap="round"/>`,
      );
    if (c.glasses)
      o.push(
        `<circle cx="86" cy="99" r="11.5" fill="${c.accent}" fill-opacity=".45" ${S()}/><circle cx="114" cy="99" r="11.5" fill="${c.accent}" fill-opacity=".45" ${S()}/><path d="M97.5 97 Q100 94 102.5 97 M74.5 97 L64 94 M125.5 97 L136 94" fill="none" ${S()}/>`,
      );
    return o.join("");
  },
});
