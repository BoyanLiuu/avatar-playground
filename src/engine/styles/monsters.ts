// 06 · Monsters: wobbly blob creatures with one to three eyes (ported from the prototype).
import { z } from "zod";
import { blobPath, f, shade } from "../geometry";
import { draw32, makeRng } from "../rng";
import { defineStyle } from "../types";

export const MONSTERS = {
  bg: [
    "#FFF1E6",
    "#E8F7FF",
    "#F0EBFF",
    "#E9FBEF",
    "#FFF8D6",
    "#FFE9EF",
    "#E6FAF8",
    "#F7EDE2",
  ],
  body: [
    "#7C5CFF",
    "#FF6B8B",
    "#2EC4B6",
    "#FFB703",
    "#8AC926",
    "#FF8C42",
    "#4CC9F0",
    "#C77DFF",
  ],
  eyes: ["one", "two", "three", "sleepy"],
  top: ["horns", "antennae", "sprout", "ears", "tuft", "none"],
  mouth: ["grin", "fang", "o", "w", "tongue"],
  pattern: ["spots", "belly", "none"],
} as const;

/** Eye IDs → how many eyes, and whether the lids are half closed. */
export const EYES = {
  one: { n: 1, lid: false },
  two: { n: 2, lid: false },
  three: { n: 3, lid: false },
  sleepy: { n: 2, lid: true },
} as const;

const LAYOUTS = {
  1: [[100, 96, 22]],
  2: [
    [78, 100, 14],
    [122, 100, 14],
  ],
  3: [
    [72, 104, 11],
    [100, 86, 12],
    [128, 104, 11],
  ],
};

const schema = z.strictObject({
  bg: z.enum(MONSTERS.bg),
  body: z.enum(MONSTERS.body),
  top: z.enum(MONSTERS.top),
  eyes: z.enum(MONSTERS.eyes),
  mouth: z.enum(MONSTERS.mouth),
  pattern: z.enum(MONSTERS.pattern),
  cheeks: z.boolean(),
  /** Seeds the body outline, the spots and where the pupils look. */
  wobble: z
    .int()
    .min(0)
    .max(2 ** 32 - 1),
});
export type MonstersConfig = z.infer<typeof schema>;

/** The blob, spots and gaze `wobble` decides. */
export const monstersTexture = (wobble: number) => {
  const t = makeRng(wobble);
  const bodyD = blobPath(100, 120, 62, 58, 9, 0.07, t);
  const spotR = Array.from({ length: 16 }, () => t.next());
  return { bodyD, spotR, dx: t.range(-3, 3), dy: t.range(0, 3) };
};

const INK = "#2B1B3F";

export const monsters = defineStyle<MonstersConfig>({
  id: "monsters",
  schema,
  defaults: {
    bg: "#E8F7FF",
    body: "#7C5CFF",
    top: "horns",
    eyes: "two",
    mouth: "grin",
    pattern: "spots",
    cheeks: true,
    wobble: 198995,
  },

  random(r, keep = {}) {
    return {
      bg: r.deck("bg", MONSTERS.bg),
      body: r.deck("body", MONSTERS.body),
      top: r.deck("top", [
        "horns",
        "antennae",
        "sprout",
        "ears",
        "tuft",
        "none",
        "horns",
      ]),
      eyes: r.deck("eyes", ["one", "two", "three", "two", "one", "sleepy"]),
      mouth: r.deck("mouth", ["grin", "fang", "o", "w", "tongue", "grin"]),
      pattern: r.deck("pattern", ["spots", "belly", "none", "spots", "belly"]),
      wobble: draw32(r),
      cheeks: r.chance(0.5),
      ...keep,
    };
  },

  render(c, uid) {
    const { bodyD, spotR, dx, dy } = monstersTexture(c.wobble);
    const { body } = c;
    const D = shade(body, -0.22);
    const L = shade(body, 0.35);
    const o = [
      `<defs><clipPath id="${uid}-b"><path d="${bodyD}"/></clipPath><clipPath id="${uid}-m"><path d="M70 126 Q100 158 130 126 Z"/></clipPath></defs>`,
      `<rect width="200" height="200" fill="${c.bg}"/>`,
      `<ellipse cx="100" cy="184" rx="54" ry="7" fill="${shade(c.bg, -0.1)}"/>`,
    ];
    o.push(
      {
        horns: `<path d="M72 74 Q58 52 62 32 Q74 52 88 64 Z M128 74 Q142 52 138 32 Q126 52 112 64 Z" fill="#FFF4D6" stroke="#E0CFA6" stroke-width="2" stroke-linejoin="round"/>`,
        antennae: `<path d="M86 68 Q80 46 72 32 M114 68 Q120 46 128 32" fill="none" stroke="${D}" stroke-width="4.5" stroke-linecap="round"/><circle cx="72" cy="30" r="7" fill="#FFE066"/><circle cx="128" cy="30" r="7" fill="#FFE066"/>`,
        sprout: `<path d="M100 66 Q98 50 100 40" fill="none" stroke="#3FA34D" stroke-width="4" stroke-linecap="round"/><ellipse cx="90" cy="40" rx="11" ry="6" transform="rotate(-25 90 40)" fill="#59C267"/><ellipse cx="111" cy="36" rx="11" ry="6" transform="rotate(25 111 36)" fill="#59C267"/>`,
        ears: `<path d="M56 92 L60 50 L90 70 Z M144 92 L140 50 L110 70 Z" fill="${body}" stroke="${body}" stroke-width="8" stroke-linejoin="round"/><path d="M64 82 L66 60 L82 72 Z M136 82 L134 60 L118 72 Z" fill="${L}"/>`,
        tuft: `<path d="M88 66 Q90 44 98 56 Q100 36 106 56 Q112 44 114 66 Z" fill="${D}"/>`,
        none: "",
      }[c.top],
    );
    o.push(
      `<ellipse cx="42" cy="134" rx="10" ry="17" transform="rotate(28 42 134)" fill="${D}"/><ellipse cx="158" cy="134" rx="10" ry="17" transform="rotate(-28 158 134)" fill="${D}"/>`,
    );
    o.push(
      `<ellipse cx="80" cy="176" rx="14" ry="9" fill="${D}"/><ellipse cx="120" cy="176" rx="14" ry="9" fill="${D}"/>`,
    );
    o.push(`<path d="${bodyD}" fill="${body}"/>`);
    if (c.pattern === "spots") {
      const spots = Array.from({ length: 4 }, (_, k) => {
        const q = spotR.slice(k * 4, k * 4 + 4);
        const a = (k / 4) * Math.PI * 2 + (q[0] * 0.8 - 0.4);
        return `<circle cx="${f(100 + Math.cos(a) * (46 + q[1] * 12))}" cy="${f(122 + Math.sin(a) * (40 + q[2] * 12))}" r="${f(6 + q[3] * 5)}"/>`;
      }).join("");
      o.push(
        `<g clip-path="url(#${uid}-b)" fill="${L}" opacity=".7">${spots}</g>`,
      );
    }
    if (c.pattern === "belly")
      o.push(
        `<ellipse cx="100" cy="160" rx="30" ry="18" fill="${L}" opacity=".6"/>`,
      );
    const { n, lid } = EYES[c.eyes];
    for (const [x, y, R] of LAYOUTS[n]) {
      const p = R * 0.48;
      const px = x + (dx * R) / 14;
      const py = y + (dy * R) / 14;
      o.push(
        `<circle cx="${x}" cy="${y}" r="${R}" fill="#fff"/><circle cx="${f(px)}" cy="${f(py)}" r="${f(p)}" fill="${INK}"/><circle cx="${f(px - p * 0.35)}" cy="${f(py - p * 0.4)}" r="${f(p * 0.38)}" fill="#fff"/>`,
      );
      if (lid)
        o.push(
          `<path d="M${x - R - 1} ${y} A${R + 1} ${R + 1} 0 0 1 ${x + R + 1} ${y} Z" fill="${D}"/>`,
        );
    }
    const LS = `fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"`;
    o.push(
      {
        grin: `<path d="M70 126 Q100 158 130 126 Z" fill="${INK}"/><g clip-path="url(#${uid}-m)"><ellipse cx="100" cy="146" rx="16" ry="8" fill="#FF6B8B"/></g><path d="M80 126 L86 134 L92 126 Z M108 126 L114 134 L120 126 Z" fill="#fff"/>`,
        fang: `<path d="M82 128 Q100 142 118 128" ${LS}/><path d="M105 134.5 L112.5 131.8 L109.5 140.5 Z" fill="#fff"/>`,
        o: `<ellipse cx="100" cy="134" rx="8" ry="10" fill="${INK}"/><ellipse cx="100" cy="139" rx="5" ry="3.5" fill="#FF6B8B"/>`,
        w: `<path d="M86 128 Q93 138 100 128 Q107 138 114 128" ${LS}/>`,
        tongue: `<path d="M94 133.2 C94 150 108 150 108 132.5 Z" fill="#FF6B8B"/><path d="M84 128 Q100 140 116 128" ${LS}/>`,
      }[c.mouth],
    );
    if (c.cheeks)
      o.push(
        `<ellipse cx="60" cy="124" rx="9" ry="5.5" fill="#FF5C8A" opacity=".35"/><ellipse cx="140" cy="124" rx="9" ry="5.5" fill="#FF5C8A" opacity=".35"/>`,
      );
    return o.join("");
  },
});
