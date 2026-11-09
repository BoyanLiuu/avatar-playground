// 01 · Flat Cartoon: half-body flat illustration, no outlines (ported from the prototype).
import { z } from "zod";
import { shade } from "../geometry";
import { defineStyle } from "../types";
import { BEARD, BODY, HAIR } from "./human";

export const FLAT = {
  bg: [
    "#FFD9DE",
    "#D4EEFF",
    "#E6E0FF",
    "#FFF0C2",
    "#D5F5E3",
    "#FFE2CC",
    "#F3E0F7",
    "#DDF3F5",
  ],
  skin: ["#FAD7C4", "#F2C1A6", "#DDA586", "#B97A5A", "#8C5A43"],
  hairC: [
    "#2B2B3A",
    "#5A3825",
    "#C8743B",
    "#E9C46A",
    "#7B6CF6",
    "#E5637F",
    "#3E7CB1",
    "#3B2A20",
  ],
  hair: ["short", "long", "bun", "curly", "side", "bob", "beanie", "spiky"],
  eyes: ["dot", "oval", "happy", "wink"],
  mouth: ["smile", "open", "smirk", "o"],
  glasses: ["none", "round", "square"],
  // Not parts: rolled with the avatar.
  shirt: [
    "#5B8DEF",
    "#F28B82",
    "#43B883",
    "#F6B04B",
    "#9B7BEA",
    "#2F3A56",
    "#F06C9B",
    "#4FC3C8",
  ],
  collar: ["v", "crew", "shirt"],
  hat: ["#E5637F", "#3E7CB1", "#F6B04B", "#43B883"],
} as const;

const schema = z.strictObject({
  bg: z.enum(FLAT.bg),
  skin: z.enum(FLAT.skin),
  hairC: z.enum(FLAT.hairC),
  shirt: z.enum(FLAT.shirt),
  hair: z.enum(FLAT.hair),
  eyes: z.enum(FLAT.eyes),
  mouth: z.enum(FLAT.mouth),
  glasses: z.enum(FLAT.glasses),
  collar: z.enum(FLAT.collar),
  beard: z.boolean(),
  earrings: z.boolean(),
  /** The beanie's colour (never the shirt's). */
  hat: z.enum(FLAT.hat),
});
export type FlatConfig = z.infer<typeof schema>;

const INK = "#2B2B3A";

export const flat = defineStyle<FlatConfig>({
  id: "flat",
  schema,
  defaults: {
    bg: "#E6E0FF",
    skin: "#DDA586",
    hairC: "#2B2B3A",
    shirt: "#F6B04B",
    hair: "bun",
    eyes: "oval",
    mouth: "open",
    glasses: "round",
    collar: "crew",
    beard: false,
    earrings: true,
    hat: "#E5637F",
  },
  linked: { hair: ["hat"] },
  preview: { eyes: { glasses: "none" }, mouth: { glasses: "none" } },

  random(r, keep = {}) {
    const c = {
      bg: r.deck("bg", FLAT.bg),
      skin: r.deck("skin", FLAT.skin),
      hairC: r.deck("hairC", FLAT.hairC),
      shirt: r.deck("shirt", FLAT.shirt),
      hair: r.deck("hair", FLAT.hair),
      eyes: r.deck("eyes", [
        "dot",
        "oval",
        "happy",
        "wink",
        "oval",
        "dot",
        "oval",
        "happy",
      ]),
      mouth: r.deck("mouth", ["smile", "open", "smirk", "o", "smile", "open"]),
      glasses: r.deck("glasses", [
        "none",
        "none",
        "round",
        "none",
        "square",
        "none",
        "none",
        "round",
      ]),
      collar: r.deck("collar", FLAT.collar),
      beard: r.chance(0.45),
      earrings: r.chance(0.35),
      ...keep,
    };
    const hats = FLAT.hat.filter((h) => h !== c.shirt);
    const hatRoll = r.next();
    return { ...c, hat: keep.hat ?? hats[Math.floor(hatRoll * hats.length)] };
  },

  render(c) {
    const beard =
      ["short", "spiky", "side", "beanie"].includes(c.hair) && c.beard;
    const H = HAIR[c.hair];
    const paths = (ds: readonly string[], fill: string) =>
      ds.map((d) => `<path d="${d}" fill="${fill}"/>`).join("");
    const neck = shade(c.skin, -0.1);
    const o = [
      `<rect width="200" height="200" fill="${c.bg}"/>`,
      `<circle cx="100" cy="108" r="80" fill="#fff" opacity=".45"/>`,
      paths(H.back, c.hairC),
      `<rect x="87" y="112" width="26" height="48" rx="12" fill="${neck}"/>`,
      `<path d="${BODY}" fill="${c.shirt}"/>`,
    ];
    if (c.collar === "v")
      o.push(`<path d="M85 152 L100 172 L115 152 Z" fill="${neck}"/>`);
    if (c.collar === "crew")
      o.push(
        `<path d="M84 153 Q100 166 116 153" fill="none" stroke="${shade(c.shirt, -0.18)}" stroke-width="5" stroke-linecap="round"/>`,
      );
    if (c.collar === "shirt")
      o.push(
        `<path d="M86 151 L100 166 L92 176 L80 156 Z M114 151 L100 166 L108 176 L120 156 Z" fill="#fff"/>`,
      );
    o.push(
      `<circle cx="63" cy="97" r="9" fill="${c.skin}"/><circle cx="137" cy="97" r="9" fill="${c.skin}"/>`,
    );
    o.push(`<ellipse cx="100" cy="92" rx="38" ry="44" fill="${c.skin}"/>`);
    if (beard) o.push(`<path d="${BEARD}" fill="${c.hairC}"/>`);
    o.push(
      `<path d="M79 86 Q86 81 93 85 M107 85 Q114 81 121 86" fill="none" stroke="${shade(c.hairC, -0.15)}" stroke-width="3.5" stroke-linecap="round"/>`,
    );
    o.push(paths(H.front, c.hairC));
    if (c.hair === "beanie")
      o.push(
        `<path d="M58 86 C56 34 144 34 142 86 Z" fill="${c.hat}"/><rect x="54" y="72" width="92" height="18" rx="9" fill="${shade(c.hat, -0.15)}"/><circle cx="100" cy="38" r="9" fill="${shade(c.hat, 0.35)}"/>`,
      );
    const dot = (x: number) =>
      `<circle cx="${x}" cy="99" r="4.5" fill="${INK}"/>`;
    const oval = (x: number) =>
      `<ellipse cx="${x}" cy="99" rx="4.6" ry="6" fill="${INK}"/><circle cx="${x + 1.6}" cy="96.6" r="1.7" fill="#fff"/>`;
    const arc = (x: number) =>
      `<path d="M${x - 6} 101 Q${x} 93 ${x + 6} 101" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
    const E = {
      dot: [dot, dot],
      oval: [oval, oval],
      happy: [arc, arc],
      wink: [oval, arc],
    }[c.eyes];
    o.push(E[0](86), E[1](114));
    o.push(
      `<path d="M100 102 Q95 110 101 112" fill="none" stroke="${shade(c.skin, -0.3)}" stroke-width="2.6" stroke-linecap="round"/>`,
    );
    o.push(
      {
        smile: `<path d="M90 119 Q100 128 110 119" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`,
        open: `<path d="M88 117 Q100 136 112 117 Z" fill="${INK}"/><path d="M93 122.5 Q100 117 107 122.5 Q100 128 93 122.5 Z" fill="#FF7A8A"/>`,
        smirk: `<path d="M91 121 Q103 125 111 115" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`,
        o: `<ellipse cx="100" cy="121" rx="4.5" ry="5.5" fill="${INK}"/>`,
      }[c.mouth],
    );
    o.push(
      `<ellipse cx="76" cy="111" rx="7" ry="4.5" fill="#FF6B81" opacity=".28"/><ellipse cx="124" cy="111" rx="7" ry="4.5" fill="#FF6B81" opacity=".28"/>`,
    );
    if (c.glasses === "round")
      o.push(
        `<g fill="#fff" fill-opacity=".18" stroke="${INK}" stroke-width="3"><circle cx="86" cy="99" r="11"/><circle cx="114" cy="99" r="11"/></g><path d="M97 98 Q100 95 103 98 M75 97 L64 94 M125 97 L136 94" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
      );
    if (c.glasses === "square")
      o.push(
        `<g fill="#fff" fill-opacity=".18" stroke="${INK}" stroke-width="3"><rect x="74" y="90" width="24" height="18" rx="5"/><rect x="102" y="90" width="24" height="18" rx="5"/></g><path d="M98 97 L102 97 M74 96 L64 94 M126 96 L136 94" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
      );
    if (!["long", "curly", "bob"].includes(c.hair) && c.earrings)
      o.push(
        `<circle cx="63" cy="108" r="3.2" fill="#F6C343"/><circle cx="137" cy="108" r="3.2" fill="#F6C343"/>`,
      );
    return o.join("");
  },
});
