import { describe, expect, it } from "vitest";
import { STYLES } from "@/content/styles";
import { ENGINES } from "@/engine/registry";
import { makeRng } from "@/engine/rng";
import { avatarSvg, defaultPngSize, fileName, pngSizes } from "./export";

describe("export", () => {
  it("names files by style and seed, or by frame for a shared avatar", () => {
    const config = ENGINES.flat.defaults;
    expect(fileName("flat", { no: 1, seed: "4f2a9c", config }, "png")).toBe(
      "avatar-flat-4f2a9c.png",
    );
    expect(fileName("robots", { no: 2, seed: null, config }, "svg")).toBe(
      "avatar-robots-frame2.svg",
    );
  });

  it("offers Pixel Art only sizes its 20×20 grid divides", () => {
    for (const size of [...pngSizes("pixel"), defaultPngSize("pixel")])
      expect(size % 20).toBe(0);
    expect(pngSizes("flat")).toEqual([256, 512, 1024]);
    expect(defaultPngSize("flat")).toBe(512);
  });

  it("the SVG is self-contained and sized", () => {
    const svg = avatarSvg(
      {
        id: "robots",
        config: ENGINES.robots.defaults,
        frame: "squircle",
        flip: false,
      },
      { size: 512 },
    );
    expect(svg).toMatch(
      /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" width="512" height="512" viewBox="0 0 200 200"/,
    );
    expect(svg.match(/https?:\/\//g)).toEqual(["http://"]); // the namespace only
    expect(svg).not.toMatch(/<script|<image|<foreignObject|href=/);
    // Every url(#id) points inside the file.
    for (const [, ref] of svg.matchAll(/url\(#([\w-]+)\)/g))
      expect(svg).toContain(`id="${ref}"`);
  });

  it("ids are unique per avatar, so two exports can be pasted inline into one page", () => {
    const ids = (svg: string) =>
      [...svg.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
    const seen = new Map<string, string>();
    for (const { id, frame } of STYLES) {
      const r = makeRng(4); // one generator per style: decks are per generator
      for (let n = 0; n < 40; n++) {
        const avatar = {
          id,
          config: ENGINES[id].random(r),
          frame,
          flip: n % 2 === 1,
        };
        for (const transparent of [false, true]) {
          const svg = avatarSvg(avatar, { size: 512, transparent });
          const key = JSON.stringify([avatar, transparent]);
          for (const one of ids(svg)) {
            expect(one).toMatch(/^avatar-[0-9a-z]+-/);
            const owner = seen.get(one);
            if (owner) expect(owner, one).toBe(key); // only the same avatar reuses an id
            seen.set(one, key);
          }
          for (const [, ref] of svg.matchAll(/url\(#([\w-]+)\)/g))
            expect(ids(svg)).toContain(ref);
        }
      }
    }
    // The same avatar always exports the same bytes.
    const flat = {
      id: "flat" as const,
      config: ENGINES.flat.defaults,
      frame: "squircle" as const,
      flip: false,
    };
    expect(avatarSvg(flat, { size: 512 })).toBe(
      avatarSvg({ ...flat }, { size: 512 }),
    );
    expect(avatarSvg(flat, { size: 512 }).match(/ id="([^"]+)"/)![1]).not.toBe(
      avatarSvg({ ...flat, flip: true }, { size: 512 }).match(
        / id="([^"]+)"/,
      )![1],
    );
  });
});
