// 02 · Pixel Art: a 20×20 sprite with an auto-generated outline (ported from the prototype).
import { z } from "zod/mini";
import { shade } from "../geometry";
import { defineStyle } from "../types";

export const PIXEL = {
  bg: [
    "#8EC5FF",
    "#FFB3C7",
    "#B8F2C2",
    "#FFE08A",
    "#C9B6FF",
    "#FFC59E",
    "#9FE7E0",
    "#F4B8E4",
  ],
  skin: ["#FFD8B8", "#F1B48C", "#D1916A", "#A86B4C", "#7A4A33"],
  hc: [
    "#3B2A20",
    "#1E1E2E",
    "#E6B655",
    "#D9573B",
    "#6C4AB6",
    "#3E9C8C",
    "#F2F2F2",
    "#E85D9A",
  ],
  shirt: [
    "#3D7BF7",
    "#E84A5F",
    "#2EB872",
    "#F5A623",
    "#8E44AD",
    "#22313F",
    "#FF7F50",
  ],
  hair: ["flat", "spiky", "long", "cap", "bun", "mohawk", "bald"],
  eyes: ["normal", "big", "shades", "happy"],
  mouth: ["smile", "flat", "open"],
  // Not a part: the cap's colour (never the shirt's).
  cap: ["#E84A5F", "#3D7BF7", "#2EB872", "#F5A623"],
} as const;

const schema = z.strictObject({
  bg: z.enum(PIXEL.bg),
  skin: z.enum(PIXEL.skin),
  hc: z.enum(PIXEL.hc),
  shirt: z.enum(PIXEL.shirt),
  hair: z.enum(PIXEL.hair),
  eyes: z.enum(PIXEL.eyes),
  mouth: z.enum(PIXEL.mouth),
  stripe: z.boolean(),
  blush: z.boolean(),
  cap: z.enum(PIXEL.cap),
  /** Rows of the two background sparkles. */
  sp1: z.int().check(z.minimum(2), z.maximum(4)),
  sp2: z.int().check(z.minimum(10), z.maximum(12)),
});
export type PixelConfig = z.infer<typeof schema>;

const N = 20;
const C = 10;
const DARK = "#1B1B2F";

export const pixel = defineStyle<PixelConfig>({
  id: "pixel",
  schema,
  defaults: {
    bg: "#8EC5FF",
    skin: "#D1916A",
    hc: "#3B2A20",
    shirt: "#E84A5F",
    hair: "spiky",
    eyes: "big",
    mouth: "smile",
    stripe: true,
    blush: true,
    cap: "#3D7BF7",
    sp1: 3,
    sp2: 11,
  },
  linked: { hair: ["cap"] },

  random(r, keep = {}) {
    const c = {
      bg: r.deck("bg", PIXEL.bg),
      skin: r.deck("skin", PIXEL.skin),
      hc: r.deck("hc", PIXEL.hc),
      shirt: r.deck("shirt", PIXEL.shirt),
      hair: r.deck("hair", [
        "flat",
        "spiky",
        "long",
        "cap",
        "bun",
        "mohawk",
        "bald",
        "long",
      ]),
      eyes: r.deck("eyes", [
        "normal",
        "big",
        "shades",
        "happy",
        "big",
        "normal",
      ]),
      mouth: r.deck("mouth", ["smile", "flat", "open", "smile"]),
      stripe: r.chance(0.5),
    };
    const capRoll = r.next();
    const rest = {
      blush: r.chance(0.6),
      sp1: r.int(2, 4),
      sp2: r.int(10, 12),
    };
    const merged = { ...c, ...rest, ...keep };
    const caps = PIXEL.cap.filter((x) => x !== merged.shirt);
    return {
      ...merged,
      cap: keep.cap ?? caps[Math.floor(capRoll * caps.length)],
    };
  },

  render(c, _uid, { transparent } = {}) {
    const g: (string | null)[] = new Array(N * N).fill(null);
    const set = (x: number, y: number, col: string | null) => {
      if (x >= 0 && x < N && y >= 0 && y < N) g[y * N + x] = col;
    };
    const box = (
      x0: number,
      y0: number,
      x1: number,
      y1: number,
      col: string,
    ) => {
      for (let y = y0; y <= y1; y++)
        for (let x = x0; x <= x1; x++) set(x, y, col);
    };
    const { skin, hc, shirt, hair, eyes, mouth } = c;
    const skinS = shade(skin, -0.12);
    box(5, 16, 14, 16, shirt);
    box(3, 17, 16, 19, shirt);
    if (c.stripe) box(3, 18, 16, 18, shade(shirt, 0.3));
    box(8, 14, 11, 15, skinS);
    box(9, 16, 10, 16, skinS);
    box(5, 4, 14, 13, skin);
    for (const [x, y] of [
      [5, 4],
      [14, 4],
      [5, 13],
      [14, 13],
    ])
      set(x, y, null);
    for (let y = 5; y <= 12; y++) set(14, y, skinS);
    box(4, 8, 4, 9, skin);
    box(15, 8, 15, 9, skinS);
    const flatTop = () => {
      box(6, 2, 13, 2, hc);
      box(5, 3, 14, 4, hc);
      box(5, 5, 7, 5, hc);
      box(11, 5, 14, 5, hc);
      set(5, 6, hc);
      set(14, 6, hc);
    };
    if (hair === "flat") flatTop();
    if (hair === "spiky") {
      for (const x of [6, 9, 12]) {
        set(x, 1, hc);
        box(x, 2, x + 1, 2, hc);
      }
      set(9, 0, hc);
      box(5, 3, 14, 4, hc);
      box(5, 5, 6, 5, hc);
      box(13, 5, 14, 5, hc);
    }
    if (hair === "long") {
      flatTop();
      box(4, 5, 5, 15, hc);
      box(14, 5, 15, 15, hc);
    }
    if (hair === "cap") {
      const cap = c.cap;
      box(6, 2, 13, 2, cap);
      box(5, 3, 14, 4, cap);
      box(5, 5, 17, 5, shade(cap, -0.25));
      box(9, 3, 10, 3, "#FFFFFF");
      set(5, 6, hc);
      set(14, 6, hc);
    }
    if (hair === "bun") {
      flatTop();
      box(8, 0, 11, 1, hc);
    }
    if (hair === "mohawk") {
      box(9, 0, 10, 4, hc);
      box(8, 2, 11, 3, hc);
    }
    if (hair === "bald") {
      const shine = shade(skin, 0.4);
      set(7, 5, shine);
      set(8, 5, shine);
      set(7, 6, shine);
    }
    if (eyes === "normal") {
      box(7, 8, 7, 9, DARK);
      box(12, 8, 12, 9, DARK);
    }
    if (eyes === "big") {
      box(7, 8, 8, 9, DARK);
      set(7, 8, "#fff");
      box(11, 8, 12, 9, DARK);
      set(11, 8, "#fff");
    }
    if (eyes === "shades") {
      box(6, 8, 13, 8, "#111");
      box(6, 9, 8, 9, "#111");
      box(11, 9, 13, 9, "#111");
      set(7, 8, "#5AC8FA");
      set(12, 8, "#5AC8FA");
    }
    if (eyes === "happy")
      for (const [x, y] of [
        [6, 9],
        [7, 8],
        [8, 9],
        [11, 9],
        [12, 8],
        [13, 9],
      ])
        set(x, y, DARK);
    if (mouth === "smile") {
      set(8, 11, DARK);
      set(11, 11, DARK);
      box(9, 12, 10, 12, DARK);
    }
    if (mouth === "flat") box(9, 12, 10, 12, DARK);
    if (mouth === "open") {
      box(9, 11, 10, 11, DARK);
      box(9, 12, 10, 12, "#FF6B81");
    }
    if (c.blush) {
      set(6, 10, "#FF8FA3");
      set(13, 10, "#FF8FA3");
    }
    // The outline: every empty cell that touches a filled one.
    const out = g.slice();
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++) {
        if (g[y * N + x]) continue;
        const near = [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ].some(([dx, dy]) => {
          const X = x + dx;
          const Y = y + dy;
          return X >= 0 && X < N && Y >= 0 && Y < N && g[Y * N + X];
        });
        if (near) out[y * N + x] = DARK;
      }
    const spark = (cx: number, cy: number) =>
      [
        [0, 0],
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]
        .map(
          ([dx, dy]) =>
            `<rect x="${(cx + dx) * C}" y="${(cy + dy) * C}" width="${C}" height="${C}"/>`,
        )
        .join("");
    let s = transparent
      ? ""
      : `<rect width="200" height="200" fill="${c.bg}"/><g fill="#fff" opacity=".65" shape-rendering="crispEdges">${spark(2, c.sp1)}${spark(18, c.sp2)}</g>`;
    s += '<g shape-rendering="crispEdges">';
    // One rect per horizontal run of the same colour.
    for (let y = 0; y < N; y++) {
      let x = 0;
      while (x < N) {
        const col = out[y * N + x];
        if (!col) {
          x++;
          continue;
        }
        let x2 = x;
        while (x2 + 1 < N && out[y * N + x2 + 1] === col) x2++;
        s += `<rect x="${x * C}" y="${y * C}" width="${(x2 - x + 1) * C}" height="${C}" fill="${col}"/>`;
        x = x2 + 1;
      }
    }
    return `${s}</g>`;
  },
});
