// Parity with the prototype the engine was ported from: the same avatar must draw the same SVG.
// The prototype takes raw geometry (head boxes, blob paths, roll numbers) where the engine stores
// string IDs and seeds, so each config is translated before the prototype draws it.
// Delete with prototype/ after M5.
import { describe, expect, it } from "vitest";
import {
  STYLES as PROTO,
  makeRng as protoRng,
} from "../../prototype/generate.mjs";
import type { StyleId } from "@/content/styles";
import { ENGINES } from "./registry";
import { makeRng } from "./rng";
import { NOSE, doodleTexture } from "./styles/doodle";
import { FLAT } from "./styles/flat";
import { EYES, monstersTexture } from "./styles/monsters";
import { PIXEL } from "./styles/pixel";
import { HEAD, robotsTexture } from "./styles/robots";
import type { Config } from "./types";

const SLUG: Record<StyleId, string> = {
  flat: "flat-cartoon",
  pixel: "pixel-art",
  robots: "robots",
  doodle: "line-doodle",
  monsters: "monsters",
  geometric: "geometric",
};

/** The roll number that makes the prototype pick `value` from `list` (which skips `not`). */
const rollFor = (
  list: readonly string[],
  value: Config[string],
  not: Config[string],
) => {
  const pool = list.filter((x) => x !== not);
  return (pool.indexOf(value as string) + 0.5) / pool.length;
};

const toProto: Record<StyleId, (c: Config) => Record<string, unknown>> = {
  flat: (c) => ({
    ...c,
    beardRoll: c.beard,
    earRoll: c.earrings,
    hatRoll: rollFor(FLAT.hat, c.hat, c.shirt),
  }),
  pixel: (c) => ({ ...c, capRoll: rollFor(PIXEL.cap, c.cap, c.shirt) }),
  robots: (c) => ({
    ...c,
    ...HEAD[c.head as keyof typeof HEAD],
    ...robotsTexture(c.wobble as number),
  }),
  doodle: (c) => ({
    ...c,
    nose: NOSE[c.nose as keyof typeof NOSE],
    beardRoll: c.beard,
    ...doodleTexture(c.wobble as number),
  }),
  monsters: (c) => {
    const eyes = EYES[c.eyes as keyof typeof EYES];
    return {
      ...c,
      eyesN: eyes.n,
      lid: eyes.lid,
      ...monstersTexture(c.wobble as number),
    };
  },
  geometric: (c) => ({ ...c, pdx: c.pupil }),
};

describe("parity with the prototype", () => {
  for (const id of Object.keys(ENGINES) as StyleId[]) {
    it(`${id}: the defaults and 300 random configs draw identically`, () => {
      const engine = ENGINES[id];
      const proto = PROTO.find((s) => s.slug === SLUG[id])!;
      const r = makeRng(31);
      const configs = [
        engine.defaults,
        ...Array.from({ length: 300 }, () => engine.random(r)),
      ];
      for (const c of configs) {
        const fixed = toProto[id](c);
        expect(engine.render(c, "p"), JSON.stringify(c)).toBe(
          proto.draw(protoRng(1), "p", fixed),
        );
      }
    });
  }
});
