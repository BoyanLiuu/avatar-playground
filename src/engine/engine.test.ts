import { describe, expect, it } from "vitest";
import { STYLES, type StyleId, getStyle } from "@/content/styles";
import {
  ENGINES,
  SHEET_SIZE,
  fieldsOf,
  keepOf,
  renderAvatar,
  rollSheet,
  withOption,
} from "./registry";
import { makeRng } from "./rng";
import type { Config } from "./types";

const IDS = Object.keys(ENGINES) as StyleId[];

/**
 * A strict check of the SVG the engine emits: well-nested tags, quoted attributes with no raw
 * `<`, `&` or `"` inside, no duplicate attribute on a tag and no stray text. Returns the problem.
 */
const xmlProblem = (svg: string) => {
  const tag =
    /<(\/?)([a-zA-Z][\w:-]*)((?:\s+[a-zA-Z][\w:-]*="[^"<&]*")*)\s*(\/?)>/y;
  const stack: string[] = [];
  let i = 0;
  while (i < svg.length) {
    const lt = svg.indexOf("<", i);
    if (svg.slice(i, lt === -1 ? undefined : lt).trim())
      return `text at ${i}: ${svg.slice(i, i + 40)}`;
    if (lt === -1) break;
    tag.lastIndex = lt;
    const m = tag.exec(svg);
    if (!m) return `bad tag: ${svg.slice(lt, lt + 80)}`;
    const [, close, name, attrs, self] = m;
    const names = [...attrs.matchAll(/([a-zA-Z][\w:-]*)=/g)].map((a) => a[1]);
    if (new Set(names).size !== names.length)
      return `duplicate attribute: ${m[0].slice(0, 80)}`;
    if (close) {
      if (attrs || self || stack.pop() !== name) return `stray </${name}>`;
    } else if (!self) stack.push(name);
    i = tag.lastIndex;
  }
  if (stack.length) return `unclosed <${stack.at(-1)}>`;
  return svg.startsWith("<svg ") ? null : "not an <svg>";
};

const svgOf = (id: StyleId, c: Config) =>
  renderAvatar(id, c, { frame: getStyle(id).frame, flip: true });

describe("engine", () => {
  it("covers every v1 style", () => {
    expect(IDS.sort()).toEqual(STYLES.map((s) => s.id).sort());
  });

  for (const id of IDS) {
    const engine = ENGINES[id];
    const style = getStyle(id);

    describe(id, () => {
      it("defaults are valid and well-formed", () => {
        expect(engine.schema.parse(engine.defaults)).toEqual(engine.defaults);
        expect(xmlProblem(svgOf(id, engine.defaults))).toBeNull();
      });

      it("same seed, same avatar", () => {
        const a = engine.random(makeRng(42));
        const b = engine.random(makeRng(42));
        expect(a).toEqual(b);
        expect(engine.render(a, "x")).toBe(engine.render(b, "x"));
        expect(engine.random(makeRng(43))).not.toEqual(a);
      });

      it("every option and colour of every part renders valid XML", () => {
        for (const section of style.sections) {
          const values =
            section.kind === "tiles"
              ? [
                  ...section.options.map((v) => [section.key, v]),
                  ...(section.sub?.colors.map((v) => [section.sub!.key, v]) ??
                    []),
                ]
              : section.colors.map((v) => [section.key, v]);
          for (const [key, value] of values) {
            const c = withOption(id, engine.defaults, key, value);
            expect(engine.schema.safeParse(c).success, `${key}=${value}`).toBe(
              true,
            );
            expect(xmlProblem(svgOf(id, c)), `${key}=${value}`).toBeNull();
            if (section.kind === "tiles")
              expect(
                xmlProblem(
                  renderAvatar(id, c, {
                    frame: style.frame,
                    crop: section.crop,
                  }),
                ),
              ).toBeNull();
          }
        }
      });

      it("1,000 random configs are valid and render without error", () => {
        const r = makeRng(7);
        for (let n = 0; n < 1000; n++) {
          const c = engine.random(r);
          expect(engine.schema.safeParse(c).success, JSON.stringify(c)).toBe(
            true,
          );
          expect(xmlProblem(svgOf(id, c))).toBeNull();
        }
      });

      it("random() never changes a locked part", () => {
        const r = makeRng(99);
        for (const section of style.sections) {
          const base = engine.random(r);
          const keep = keepOf(id, base, [section.key]);
          expect(Object.keys(keep)).toEqual(fieldsOf(id, section));
          for (let n = 0; n < 20; n++)
            expect(engine.random(r, keep)).toMatchObject(keep);
        }
        const all = keepOf(
          id,
          engine.defaults,
          style.sections.map((s) => s.key),
        );
        expect(engine.random(r, all)).toMatchObject(all);
      });

      it("a sheet is twelve rolls that keep the locks, the same for the same seed", () => {
        const keep = keepOf(
          id,
          engine.defaults,
          style.sections.filter((s) => s.locked).map((s) => s.key),
        );
        const sheet = rollSheet(id, "4f2a9c", keep);
        expect(sheet).toHaveLength(SHEET_SIZE);
        for (const c of sheet) expect(c).toMatchObject(keep);
        expect(rollSheet(id, "4f2a9c", keep)).toEqual(sheet);
        expect(new Set(sheet.map((c) => JSON.stringify(c))).size).toBe(
          SHEET_SIZE,
        );
      });

      it("the schema rejects unknown options, foreign colours, injection and junk", () => {
        const d = engine.defaults;
        const key = style.sections.find((s) => s.kind === "tiles")!.key;
        const colour = style.sections[0].key;
        const bad: unknown[] = [
          { ...d, [key]: "mullet" },
          { ...d, [colour]: "#123456" },
          { ...d, [colour]: "red" },
          { ...d, [colour]: '"/><script>alert(1)</script>' },
          { ...d, [key]: '"><image href=x onerror=alert(1)>' },
          { ...d, extra: 1 },
          { ...d, [key]: 3 },
          Object.fromEntries(Object.entries(d).slice(1)),
          null,
          "flat",
        ];
        if ("wobble" in d)
          bad.push(
            { ...d, wobble: -1 },
            { ...d, wobble: 1.5 },
            { ...d, wobble: "7" },
            { ...d, wobble: 2 ** 32 },
          );
        for (const c of bad)
          expect(engine.schema.safeParse(c).success, JSON.stringify(c)).toBe(
            false,
          );
      });
    });
  }
});
