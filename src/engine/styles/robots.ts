// 03 · Robots: boxy bots with glowing screen faces (ported from the prototype).
import { z } from "zod/mini";
import { f, heartD, shade } from "../geometry";
import { draw32, makeRng } from "../rng";
import { defineStyle } from "../types";

export const ROBOTS = {
  bg: [
    "#1F2A44",
    "#E8ECF4",
    "#FFE8D6",
    "#D9F2EC",
    "#2B2D42",
    "#EFE5FF",
    "#FFF4CC",
    "#DDEBFF",
  ],
  metal: [
    "#C9D1DC",
    "#F2C14E",
    "#F28F6B",
    "#7FC8C8",
    "#A99BF2",
    "#F25F5C",
    "#8E9AAF",
    "#9AD17D",
  ],
  glow: ["#5CF2FF", "#7CFF6B", "#FF5CA8", "#FFD23F", "#B18CFF", "#FF8A3D"],
  head: ["boxy", "soft", "round", "wide"],
  eyes: ["round", "pill", "arc", "cross", "visor", "ring", "heart"],
  mouth: ["eq", "line", "smile", "dots"],
  ant: ["ball", "double", "dish", "none"],
} as const;

/** Head IDs → the head box (width, height, corner radius). */
export const HEAD = {
  boxy: { w: 100, h: 84, rad: 6 },
  soft: { w: 100, h: 84, rad: 24 },
  round: { w: 104, h: 88, rad: 42 },
  wide: { w: 116, h: 76, rad: 14 },
};

const schema = z.strictObject({
  bg: z.enum(ROBOTS.bg),
  metal: z.enum(ROBOTS.metal),
  glow: z.enum(ROBOTS.glow),
  head: z.enum(ROBOTS.head),
  eyes: z.enum(ROBOTS.eyes),
  mouth: z.enum(ROBOTS.mouth),
  ant: z.enum(ROBOTS.ant),
  /** Seeds the equalizer mouth's bar heights. */
  wobble: z.int().check(z.minimum(0), z.maximum(2 ** 32 - 1)),
});
export type RobotsConfig = z.infer<typeof schema>;

/** The equalizer bar heights `wobble` decides. */
export const robotsTexture = (wobble: number) => {
  const t = makeRng(wobble);
  return { eqH: Array.from({ length: 7 }, () => f(t.range(3, 12))) };
};

const SCREEN = "#14161F";

export const robots = defineStyle<RobotsConfig>({
  id: "robots",
  schema,
  defaults: {
    bg: "#1F2A44",
    metal: "#F2C14E",
    glow: "#5CF2FF",
    head: "soft",
    eyes: "round",
    mouth: "eq",
    ant: "ball",
    wobble: 2483,
  },

  random(r, keep = {}) {
    return {
      bg: r.deck("bg", ROBOTS.bg),
      metal: r.deck("metal", ROBOTS.metal),
      glow: r.deck("glow", ROBOTS.glow),
      head: r.deck("head", ROBOTS.head),
      eyes: r.deck("eyes", ROBOTS.eyes),
      mouth: r.deck("mouth", ROBOTS.mouth),
      ant: r.deck("ant", ["ball", "double", "dish", "none", "ball"]),
      wobble: draw32(r),
      ...keep,
    };
  },

  render(c, uid, { transparent } = {}) {
    const { eqH } = robotsTexture(c.wobble);
    const dark = c.bg === "#1F2A44" || c.bg === "#2B2D42";
    const { metal, glow } = c;
    const { w, h, rad } = HEAD[c.head];
    const hx = 100 - w / 2;
    const hy = 52;
    const D = shade(metal, -0.3);
    const D2 = shade(metal, -0.45);
    const G = `filter="url(#${uid}-g)"`;
    const o = [
      `<defs><filter id="${uid}-g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><pattern id="${uid}-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="${dark ? "#fff" : "#000"}" stroke-opacity=".07"/></pattern></defs>`,
      transparent
        ? ""
        : `<rect width="200" height="200" fill="${c.bg}"/><rect width="200" height="200" fill="url(#${uid}-grid)"/>`,
    ];
    if (c.ant === "ball")
      o.push(
        `<path d="M100 ${hy} V${hy - 22}" stroke="${D}" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="${hy - 28}" r="7" fill="${glow}" ${G}/>`,
      );
    if (c.ant === "double")
      o.push(
        `<path d="M84 ${hy} L74 ${hy - 22} M116 ${hy} L126 ${hy - 22}" stroke="${D}" stroke-width="4" stroke-linecap="round"/><circle cx="73" cy="${hy - 25}" r="5" fill="${glow}" ${G}/><circle cx="127" cy="${hy - 25}" r="5" fill="${glow}" ${G}/>`,
      );
    if (c.ant === "dish")
      o.push(
        `<path d="M100 ${hy} V${hy - 14}" stroke="${D}" stroke-width="5"/><path d="M84 ${hy - 26} A16 12 0 0 0 116 ${hy - 26} Z" fill="${shade(metal, 0.2)}" stroke="${D}" stroke-width="3" stroke-linejoin="round"/><circle cx="100" cy="${hy - 26}" r="3" fill="${glow}" ${G}/>`,
      );
    o.push(
      `<rect x="86" y="${hy + h - 6}" width="28" height="${170 - (hy + h - 6)}" fill="${D}"/><path d="M86 ${hy + h + 6} H114 M86 ${hy + h + 13} H114" stroke="${D2}" stroke-width="2"/>`,
    );
    o.push(
      `<rect x="38" y="156" width="124" height="70" rx="24" fill="${metal}"/><rect x="74" y="170" width="52" height="22" rx="7" fill="${SCREEN}"/>`,
    );
    o.push(
      [glow, "#FF5C5C", "#FFD23F"]
        .map(
          (col, i) =>
            `<circle cx="${88 + i * 12}" cy="181" r="3.6" fill="${col}" ${G}/>`,
        )
        .join(""),
    );
    o.push(
      `<circle cx="52" cy="170" r="4" fill="${D}"/><circle cx="148" cy="170" r="4" fill="${D}"/>`,
    );
    o.push(
      `<rect x="${hx - 9}" y="${hy + h / 2 - 15}" width="12" height="30" rx="4" fill="${D}"/><rect x="${hx + w - 3}" y="${hy + h / 2 - 15}" width="12" height="30" rx="4" fill="${D}"/>`,
    );
    o.push(
      `<rect x="${hx}" y="${hy}" width="${w}" height="${h}" rx="${rad}" fill="${metal}"/><rect x="${hx + 12}" y="${hy + 5}" width="${f(w * 0.3)}" height="5" rx="2.5" fill="#fff" opacity=".45"/>`,
    );
    if (rad <= 16)
      o.push(
        `<circle cx="${hx + 7}" cy="${hy + h - 7}" r="2.6" fill="${D}"/><circle cx="${hx + w - 7}" cy="${hy + h - 7}" r="2.6" fill="${D}"/>`,
      );
    const sx = hx + 12;
    const sy = hy + 15;
    const sw = w - 24;
    const sh = h - 30;
    o.push(
      `<rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="${Math.max(rad - 10, 6)}" fill="${SCREEN}"/>`,
    );
    const ey = sy + sh / 2 - 7;
    const my = sy + sh / 2 + 12;
    const eye = {
      round: (x: number) =>
        `<circle cx="${x}" cy="${ey}" r="7" fill="${glow}"/>`,
      pill: (x: number) =>
        `<rect x="${x - 8}" y="${ey - 4.5}" width="16" height="9" rx="4.5" fill="${glow}"/>`,
      arc: (x: number) =>
        `<path d="M${x - 8} ${ey + 3} Q${x} ${ey - 8} ${x + 8} ${ey + 3}" fill="none" stroke="${glow}" stroke-width="4" stroke-linecap="round"/>`,
      cross: (x: number) =>
        `<path d="M${x - 6} ${ey - 6} L${x + 6} ${ey + 6} M${x + 6} ${ey - 6} L${x - 6} ${ey + 6}" stroke="${glow}" stroke-width="3.6" stroke-linecap="round"/>`,
      ring: (x: number) =>
        `<circle cx="${x}" cy="${ey}" r="7" fill="none" stroke="${glow}" stroke-width="3.4"/><circle cx="${x}" cy="${ey}" r="2.2" fill="${glow}"/>`,
      heart: (x: number) => `<path d="${heartD(x, ey, 7)}" fill="${glow}"/>`,
    };
    o.push(`<g ${G}>`);
    if (c.eyes === "visor")
      o.push(
        `<rect x="72" y="${ey - 5}" width="56" height="10" rx="5" fill="${glow}"/>`,
      );
    else o.push(eye[c.eyes](82), eye[c.eyes](118));
    const LS = `fill="none" stroke="${glow}" stroke-width="3.6" stroke-linecap="round"`;
    if (c.mouth === "eq")
      for (let i = 0; i < 7; i++) {
        const hh = eqH[i];
        o.push(
          `<rect x="${100 - 23.5 + i * 7}" y="${f(my - hh / 2)}" width="4" height="${hh}" rx="2" fill="${glow}"/>`,
        );
      }
    if (c.mouth === "line") o.push(`<path d="M88 ${my} L112 ${my}" ${LS}/>`);
    if (c.mouth === "smile")
      o.push(`<path d="M86 ${my - 4} Q100 ${my + 8} 114 ${my - 4}" ${LS}/>`);
    if (c.mouth === "dots")
      for (let i = 0; i < 5; i++)
        o.push(
          `<circle cx="${88 + i * 6}" cy="${my}" r="2.2" fill="${glow}"/>`,
        );
    o.push("</g>");
    return o.join("");
  },
});
