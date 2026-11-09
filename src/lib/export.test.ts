import { describe, expect, it } from "vitest";
import { ENGINES } from "@/engine/registry";
import { avatarSvg, defaultPngSize, fileName, pngSizes } from "./export";

describe("export", () => {
  it("names files by style and seed, or by frame for a shared avatar", () => {
    const config = ENGINES.flat.defaults;
    expect(fileName("flat", { no: 9, seed: "4f2a9c", config }, "png")).toBe(
      "avatar-flat-4f2a9c.png",
    );
    expect(fileName("robots", { no: 10, seed: null, config }, "svg")).toBe(
      "avatar-robots-frame10.svg",
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
});
