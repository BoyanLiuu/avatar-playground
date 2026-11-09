import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getStyle } from "@/content/styles";
import { ENGINES, keepOf } from "@/engine/registry";
import { currentShot, sheetOf, usePlayground } from "./playground";

const store = () => usePlayground.getState();
const mem = (id = store().styleId) => store().memory[id];
const now = (id = store().styleId) => currentShot(mem(id));

beforeEach(() => usePlayground.setState(usePlayground.getInitialState(), true));
afterEach(() => vi.restoreAllMocks());

describe("playground store", () => {
  it("opens on each style's first avatar with its default locks", () => {
    expect(store().styleId).toBe("flat");
    for (const id of ["flat", "robots", "geometric"] as const) {
      expect(now(id).config).toEqual(ENGINES[id].defaults);
      expect(mem(id).locks).toEqual(
        getStyle(id)
          .sections.filter((s) => s.locked)
          .map((s) => s.key),
      );
    }
    expect(now().no).toBe(9);
    expect(mem().shots).toHaveLength(9);
  });

  it("Randomize adds a numbered frame and keeps the locked parts for 20 rolls", () => {
    const keep = keepOf("flat", now().config, mem().locks);
    expect(Object.keys(keep)).toEqual(["skin", "hair", "hairC", "hat"]);
    const seen = new Set<string>();
    for (let n = 0; n < 20; n++) {
      store().roll();
      expect(now().no).toBe(10 + n);
      expect(now().config).toMatchObject(keep);
      seen.add(JSON.stringify(now().config));
    }
    expect(seen.size).toBeGreaterThan(15);
    expect(store().rollId).toBe(20);
  });

  it("Any style rolls into another style's film", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.4); // STYLES[2]: robots
    store().setScope("any");
    store().roll();
    expect(store().styleId).toBe("robots");
    expect(now().no).toBe(10);
    expect(now("flat").no).toBe(9);
  });

  it("switching Flat → Robots → Flat brings back the same avatar and locks", () => {
    store().roll();
    store().toggleLock("eyes");
    store().setPart("mouth", "smirk");
    const before = { shot: now(), locks: mem().locks };
    store().selectStyle("robots");
    store().roll();
    store().toggleLock("head");
    store().selectStyle("flat");
    expect(now()).toEqual(before.shot);
    expect(mem().locks).toEqual(before.locks);
    expect(mem().locks).toEqual(["skin", "hair", "eyes"]);
  });

  it("picks change the current frame in place and ignore values off the palette", () => {
    store().setPart("hair", "curly");
    store().setPart("bg", "#FFD9DE");
    expect(now()).toMatchObject({
      no: 9,
      config: { hair: "curly", bg: "#FFD9DE" },
    });
    store().setPart("hair", "mullet");
    store().setPart("bg", '"/><script>');
    expect(now().config).toMatchObject({ hair: "curly", bg: "#FFD9DE" });
  });

  it("a part's dice picks a different option and colour, nothing else", () => {
    for (let n = 0; n < 10; n++) {
      const before = now().config;
      store().rollPart("hair");
      const after = now().config;
      expect(after.hair).not.toBe(before.hair);
      expect(after.hairC).not.toBe(before.hairC);
      expect({ ...after, hair: 0, hairC: 0 }).toEqual({
        ...before,
        hair: 0,
        hairC: 0,
      });
    }
  });

  it("frame, flip and reset", () => {
    store().setFrame("circle");
    store().flip();
    store().toggleLock("skin");
    store().roll();
    expect(mem()).toMatchObject({ frame: "circle", flip: true });
    store().reset();
    expect(mem()).toMatchObject({
      frame: "squircle",
      flip: false,
      locks: ["skin", "hair"],
    });
    expect(now()).toMatchObject({ no: 11, config: ENGINES.flat.defaults });
  });

  it("Grid: a sheet of twelve, keep the circled frame under its number", () => {
    store().setView("grid");
    const seed = mem().sheet;
    expect(seed).toMatch(/^[0-9a-f]{6}$/);
    const sheet = sheetOf("flat", mem());
    expect(sheet).toHaveLength(12);
    store().keepFrame(); // nothing circled: no-op
    expect(store().view).toBe("grid");
    store().pickFrame(3);
    store().keepFrame();
    expect(store().view).toBe("single");
    expect(now()).toEqual({ no: 13, seed, config: sheet[3] });
    expect(mem()).toMatchObject({ next: 22, sheet: null, pick: null });
  });

  it("Grid: switching style in Grid gives that style a sheet; a new sheet clears the pick", () => {
    store().setView("grid");
    store().pickFrame(5);
    const seed = mem().sheet;
    store().rollSheet();
    expect(mem().sheet).not.toBe(seed);
    expect(mem().pick).toBeNull();
    expect(mem("pixel").sheet).toBeNull();
    store().selectStyle("pixel");
    expect(mem("pixel").sheet).not.toBeNull();
  });
});
