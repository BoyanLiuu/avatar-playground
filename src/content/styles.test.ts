import { describe, expect, it } from "vitest";
import { STYLES, partsOf } from "./styles";

const HEX = /^#[0-9a-f]{6}$/i;

describe("style content", () => {
  it("defines the six v1 styles once each", () => {
    expect(STYLES.map((s) => s.id)).toEqual([
      "flat",
      "pixel",
      "robots",
      "doodle",
      "monsters",
      "geometric",
    ]);
  });

  it.each(STYLES)(
    "$name: one frame section, unique keys, valid options",
    (style) => {
      expect(style.sections.filter((s) => s.kind === "frame")).toHaveLength(1);
      const keys = style.sections.flatMap((s) =>
        s.kind === "tiles" && s.sub ? [s.key, s.sub.key] : [s.key],
      );
      expect(new Set(keys).size).toBe(keys.length);
      for (const s of style.sections) {
        if (s.kind === "tiles") {
          expect(s.options.length).toBeGreaterThan(1);
          expect(new Set(s.options).size).toBe(s.options.length);
          if (s.labels) expect(s.labels).toHaveLength(s.options.length);
          expect(s.crop.split(" ").map(Number)).toHaveLength(4);
          s.sub?.colors.forEach((c) => expect(c).toMatch(HEX));
        } else {
          expect(s.colors.length).toBeGreaterThan(1);
          s.colors.forEach((c) => expect(c).toMatch(HEX));
        }
      }
      expect(partsOf(style).length).toBeGreaterThanOrEqual(5);
    },
  );
});
