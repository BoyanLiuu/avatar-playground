import { describe, expect, it } from "vitest";
import { STYLES } from "@/content/styles";
import { ENGINES } from "@/engine/registry";
import { makeRng } from "@/engine/rng";
import { colorName, colorNames, describeAvatar } from "./describe";

describe("words for screen readers", () => {
  it("names colours plainly", () => {
    expect(colorName("#FFFFFF")).toBe("white");
    expect(colorName("#1E1E1E")).toBe("black");
    expect(colorName("#D7263D")).toBe("red");
    expect(colorName("#FFD9DE")).toBe("pale pink");
    expect(colorName("#1F2A44")).toBe("dark blue");
    expect(colorName("#DDA586")).toBe("tan");
    expect(colorName("#2E8B7A")).toBe("teal");
  });

  it("every swatch of every palette has a distinct name", () => {
    for (const style of STYLES)
      for (const section of style.sections) {
        const colors =
          section.kind === "tiles" ? section.sub?.colors : section.colors;
        if (!colors) continue;
        const names = colorNames(colors);
        expect(new Set(names).size, `${style.id} ${section.key}`).toBe(
          colors.length,
        );
        for (const name of names) expect(name).toMatch(/^[a-z]+( [a-z0-9]+)*$/);
      }
  });

  it("describes every avatar by every part", () => {
    for (const style of STYLES) {
      const r = makeRng(2);
      for (let n = 0; n < 50; n++) {
        const text = describeAvatar(style, ENGINES[style.id].random(r));
        expect(text.split(", ")).toHaveLength(style.sections.length);
        expect(text).not.toMatch(/undefined|#|\b([a-z]+) \1\b/);
      }
    }
    expect(describeAvatar(STYLES[0], ENGINES.flat.defaults)).toBe(
      "pale purple background, tan skin, bun hair (dark blue), oval eyes, open mouth, round glasses",
    );
  });
});
