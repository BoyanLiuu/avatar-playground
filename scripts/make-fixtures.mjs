// Renders the static sample avatars the M1 UX shows, from the prototype engine:
//   public/fixtures/<style>/{hero,history-N,sheet-N,tiles/<key>-N}.svg  and  src/fixtures/fixtures.json
// Deterministic (fixed seeds). Generated, not committed; `pnpm dev/build/test` run it first.
// M2 replaces these with the real engine.
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { STYLES as ENGINE, makeRng } from "../prototype/generate.mjs";
import { STYLES } from "../src/content/styles.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public/fixtures");
const MANIFEST = join(ROOT, "src/fixtures/fixtures.json");

// Content style id → prototype engine slug.
const SLUG = {
  flat: "flat-cartoon",
  pixel: "pixel-art",
  robots: "robots",
  doodle: "line-doodle",
  monsters: "monsters",
  geometric: "geometric",
};

// The "current avatar" each style's screen shows (the mockups' configs).
const CURRENT = {
  flat: {
    bg: "#E6E0FF",
    skin: "#DDA586",
    hairC: "#2B2B3A",
    shirt: "#F6B04B",
    hair: "bun",
    eyes: "oval",
    mouth: "open",
    glasses: "round",
    collar: "crew",
    earRoll: true,
  },
  pixel: {
    bg: "#8EC5FF",
    skin: "#D1916A",
    hc: "#3B2A20",
    shirt: "#E84A5F",
    hair: "spiky",
    eyes: "big",
    mouth: "smile",
    stripe: true,
    blush: true,
    capRoll: 0.1,
    sp1: 3,
    sp2: 11,
  },
  robots: {
    bg: "#1F2A44",
    metal: "#F2C14E",
    glow: "#5CF2FF",
    w: 100,
    h: 84,
    rad: 24,
    eyes: "round",
    mouth: "eq",
    ant: "ball",
    eqH: [6, 10, 4, 12, 7, 9, 5],
  },
  doodle: {
    accent: "#A0C4FF",
    hair: "bob",
    eyes: "dot",
    brow: "raised",
    nose: "M99 99 C94 108 97 113 104 111",
    shirt: "stripes",
    beardRoll: false,
    mouth: "smile",
    glasses: false,
    ax: 118,
    ay: 88,
    blush: true,
  },
  monsters: {
    bg: "#E8F7FF",
    body: "#7C5CFF",
    top: "horns",
    eyesN: 2,
    mouth: "grin",
    pattern: "spots",
    lid: false,
    cheeks: true,
  },
  geometric: {
    bg: "#F4B400",
    headC: "#2E8B7A",
    bodyC: "#1E1E1E",
    hairC: "#D7263D",
    decoC: "#1B4F9C",
    splitC: "#F29CA3",
    headS: "circle",
    hair: "cap",
    eyes: "circle",
    nose: "tri",
    mouth: "semi",
    deco: "quarter",
    bodyS: "trap",
    split: false,
    pdx: 3,
    cheek: true,
  },
};

// String-ID options that the prototype draws from several config fields.
const EXPAND = {
  robots: {
    head: {
      boxy: { w: 100, h: 84, rad: 6 },
      soft: { w: 100, h: 84, rad: 24 },
      round: { w: 104, h: 88, rad: 42 },
      wide: { w: 116, h: 76, rad: 14 },
    },
  },
  monsters: {
    eyes: {
      one: { eyesN: 1, lid: false },
      two: { eyesN: 2, lid: false },
      three: { eyesN: 3, lid: false },
      sleepy: { eyesN: 2, lid: true },
    },
  },
  doodle: {
    nose: {
      angle: { nose: "M100 97 L95 110 L102 111" },
      hook: { nose: "M99 99 C94 108 97 113 104 111" },
      button: { nose: "M96 108 Q100 112 104 108" },
    },
  },
};

// What a tile preview hides so its part reads clearly.
const PREVIEW = {
  flat: { eyes: { glasses: "none" }, mouth: { glasses: "none" } },
  geometric: { headS: { hair: "none" } },
};

const RX = { circle: 100, squircle: 46, square: 0 };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const overrides = (style, key, value) =>
  EXPAND[style]?.[key]?.[value] ?? { [key]: value };
const valueOf = (style, key, config) => {
  const table = EXPAND[style]?.[key];
  if (!table) return config[key];
  return Object.keys(table).find((id) =>
    Object.entries(table[id]).every(([k, v]) => same(config[k], v)),
  );
};

let uid = 0;
const svg = (
  engine,
  frame,
  config,
  { rng, viewBox = "0 0 200 200", clip = true },
) => {
  const id = `f${uid++}`;
  const inner = engine.draw(rng, id, config);
  const body = clip
    ? `<defs><clipPath id="${id}-c"><rect width="200" height="200" rx="${RX[frame]}"/></clipPath></defs><g clip-path="url(#${id}-c)">${inner}</g>`
    : inner;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" preserveAspectRatio="xMidYMid slice">${body}</svg>`;
};

rmSync(PUBLIC, { recursive: true, force: true });
const manifest = {};

for (const style of STYLES) {
  const index = ENGINE.findIndex((e) => e.slug === SLUG[style.id]);
  const engine = ENGINE[index];
  const seed = 7000 + index + 1;
  const current = CURRENT[style.id];
  const dir = join(PUBLIC, style.id);
  mkdirSync(join(dir, "tiles"), { recursive: true });
  const url = (file) => `/fixtures/${style.id}/${file}`;
  const write = (file, markup) => {
    writeFileSync(join(dir, file), markup);
    return url(file);
  };
  const fresh = () => makeRng(seed);

  const selected = {};
  const tiles = {};
  const pinned = {};
  for (const sec of style.sections) {
    selected[sec.key] = valueOf(style.id, sec.key, current);
    if (sec.kind === "tiles" && sec.sub)
      selected[sec.sub.key] = current[sec.sub.key];
    if (sec.locked) {
      Object.assign(pinned, overrides(style.id, sec.key, selected[sec.key]));
      if (sec.kind === "tiles" && sec.sub)
        pinned[sec.sub.key] = current[sec.sub.key];
    }
    if (sec.kind !== "tiles") continue;
    tiles[sec.key] = sec.options.map((option, k) =>
      write(
        `tiles/${sec.key}-${k}.svg`,
        svg(
          engine,
          style.frame,
          {
            ...current,
            ...PREVIEW[style.id]?.[sec.key],
            ...overrides(style.id, sec.key, option),
          },
          { rng: fresh(), viewBox: sec.crop, clip: false },
        ),
      ),
    );
  }

  const hero = write(
    "hero.svg",
    svg(engine, style.frame, current, { rng: fresh() }),
  );
  const historyRng = makeRng(seed + 40);
  const history = Array.from({ length: 11 }, (_, n) =>
    write(
      `history-${n}.svg`,
      svg(engine, style.frame, {}, { rng: historyRng }),
    ),
  );
  const sheetRng = makeRng(seed + 90);
  const sheet = Array.from({ length: 12 }, (_, n) =>
    write(
      `sheet-${n}.svg`,
      svg(engine, style.frame, pinned, { rng: sheetRng }),
    ),
  );

  manifest[style.id] = {
    seed: ["4f2a9c", "91c0de", "b07a11", "3e8f02", "c4d915", "7a2e64"][
      STYLES.indexOf(style)
    ],
    frameNo: 24,
    hero,
    selected,
    tiles,
    history: [...history, hero],
    sheet,
  };
}

mkdirSync(dirname(MANIFEST), { recursive: true });
writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  `fixtures: ${STYLES.length} styles → public/fixtures, src/fixtures/fixtures.json`,
);
