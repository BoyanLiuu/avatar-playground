import { beforeEach, describe, expect, it } from "vitest";
import { STYLES, type StyleId, getStyle } from "@/content/styles";
import { ENGINES } from "@/engine/registry";
import { makeRng } from "@/engine/rng";
import { currentShot, usePlayground } from "./playground";
import { type SharedAvatar, decodeLink, linkSearch, withoutLink } from "./url";

const b64 = (text: string) => Buffer.from(text).toString("base64url");
const FRAMES = ["circle", "squircle", "square"] as const;

describe("share links", () => {
  it("round-trip every style: defaults and 200 random avatars, any frame, flipped or not", () => {
    for (const { id } of STYLES) {
      const r = makeRng(5);
      const configs = [
        ENGINES[id].defaults,
        ...Array.from({ length: 200 }, () => ENGINES[id].random(r)),
      ];
      configs.forEach((config, k) => {
        const avatar: SharedAvatar = {
          id,
          config,
          frame: FRAMES[k % 3],
          flip: k % 2 === 1,
        };
        const search = linkSearch(avatar);
        expect(search.length).toBeLessThan(600);
        expect(decodeLink(search)).toEqual({ kind: "ok", avatar });
      });
    }
  });

  it("writes the frame shape and flip only when they differ from the default", () => {
    const avatar = {
      id: "robots" as const,
      config: ENGINES.robots.defaults,
      frame: getStyle("robots").frame,
      flip: false,
    };
    const plain = new URLSearchParams(linkSearch(avatar));
    expect([...plain.keys()]).toEqual(["s", "v", "c"]);
    const odd = new URLSearchParams(
      linkSearch({ ...avatar, frame: "circle", flip: true }),
    );
    expect(odd.get("f")).toBe("circle");
    expect(odd.get("m")).toBe("1");
  });

  it("keeps unrelated parameters and ignores URLs without a link", () => {
    const avatar = {
      id: "flat" as const,
      config: ENGINES.flat.defaults,
      frame: "squircle" as const,
      flip: false,
    };
    const search = linkSearch(avatar, "?utm_source=x&s=robots&c=old");
    expect(new URLSearchParams(search).get("utm_source")).toBe("x");
    expect(decodeLink(search)).toEqual({ kind: "ok", avatar });
    expect(withoutLink(search)).toBe("?utm_source=x");
    expect(decodeLink("")).toEqual({ kind: "none" });
    expect(decodeLink("?utm_source=x")).toEqual({ kind: "none" });
  });

  it("rejects every broken, old or malicious link", () => {
    const good = new URLSearchParams(
      linkSearch({
        id: "monsters",
        config: ENGINES.monsters.defaults,
        frame: "squircle",
        flip: false,
      }),
    );
    const c = good.get("c")!;
    const config = ENGINES.monsters.defaults;
    const link = (params: Record<string, string>) =>
      `?${new URLSearchParams(params)}`;
    const cases: [string, StyleId][] = [
      [link({ s: "monsters" }), "monsters"],
      [link({ s: "monsters", v: "2", c }), "monsters"],
      [link({ s: "monsters", v: "1" }), "monsters"],
      [link({ s: "cats", v: "1", c }), "flat"],
      [link({ v: "1", c }), "flat"],
      [link({ s: "monsters", v: "1", c: "%%%" }), "monsters"],
      [link({ s: "monsters", v: "1", c: "not+base64/" }), "monsters"],
      [link({ s: "monsters", v: "1", c: b64("{oops") }), "monsters"],
      [link({ s: "monsters", v: "1", c: b64("[]") }), "monsters"],
      [link({ s: "monsters", v: "1", c: "A".repeat(3000) }), "monsters"],
      [link({ s: "monsters", v: "1", c: b64("\xff\xfe") }), "monsters"],
      [
        link({
          s: "monsters",
          v: "1",
          c: b64(
            JSON.stringify({ ...config, bg: '"/><script>alert(1)</script>' }),
          ),
        }),
        "monsters",
      ],
      [
        link({
          s: "monsters",
          v: "1",
          c: b64(JSON.stringify({ ...config, extra: 1 })),
        }),
        "monsters",
      ],
      [
        link({
          s: "monsters",
          v: "1",
          c: b64(JSON.stringify({ ...config, wobble: -1 })),
        }),
        "monsters",
      ],
      // A valid Flat config is not a valid Monster.
      [
        link({
          s: "monsters",
          v: "1",
          c: b64(JSON.stringify(ENGINES.flat.defaults)),
        }),
        "monsters",
      ],
      [link({ s: "monsters", v: "1", c, f: "hexagon" }), "monsters"],
      [link({ s: "monsters", v: "1", c, m: "yes" }), "monsters"],
    ];
    for (const [search, id] of cases)
      expect(decodeLink(search), search).toEqual({ kind: "bad", id });
  });
});

describe("opening a shared avatar", () => {
  beforeEach(() =>
    usePlayground.setState(usePlayground.getInitialState(), true),
  );
  const store = () => usePlayground.getState();

  it("selects its style and adds it as a new frame, with its frame shape and flip", () => {
    const config = ENGINES.robots.random(makeRng(3));
    store().openShared({ id: "robots", config, frame: "circle", flip: true });
    const m = store().memory.robots;
    expect(store().styleId).toBe("robots");
    expect(currentShot(m)).toEqual({ no: 10, seed: null, config });
    expect(m.present).toMatchObject({ frame: "circle", flip: true });
    store().undo();
    expect(currentShot(store().memory.robots).no).toBe(9);
  });

  it("opening the avatar that is already current adds nothing", () => {
    store().openShared({
      id: "flat",
      config: ENGINES.flat.defaults,
      frame: "squircle",
      flip: false,
    });
    expect(store().memory.flat.present.shots).toHaveLength(9);
    expect(store().memory.flat.past).toEqual([]);
  });
});
