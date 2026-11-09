import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import fixtures from "@/fixtures/fixtures.json";
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

describe("M1 fixtures", () => {
  const publicFile = (url: string) => join(process.cwd(), "public", url);

  it.each(STYLES)(
    "$name: every fixture file exists and each part has a selection",
    (style) => {
      const fx = fixtures[style.id];
      [fx.hero, ...fx.history, ...fx.sheet].forEach((url) =>
        expect(existsSync(publicFile(url)), url).toBe(true),
      );
      expect(fx.history).toHaveLength(12);
      expect(fx.sheet).toHaveLength(12);
      for (const s of style.sections) {
        const selected = (fx.selected as Record<string, string>)[s.key];
        if (s.kind === "tiles") {
          expect(s.options).toContain(selected);
          const tiles = (fx.tiles as Record<string, string[]>)[s.key];
          expect(tiles).toHaveLength(s.options.length);
          tiles.forEach((url) =>
            expect(existsSync(publicFile(url)), url).toBe(true),
          );
        } else {
          expect(s.colors).toContain(selected);
        }
      }
    },
  );
});
