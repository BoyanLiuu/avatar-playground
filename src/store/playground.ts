// The playground's state (zustand). Each style keeps its own memory (film, locks, frame shape,
// flip, contact sheet), so switching styles and back brings everything back. Every config that
// enters the store is either rolled by the engine or validated by the style's schema.
import { create } from "zustand";
import { type Frame, STYLES, type StyleId, getStyle } from "@/content/styles";
import { ENGINES, SHEET_SIZE, keepOf, rollSheet } from "@/engine/registry";
import { makeRng, newSeed, seedNumber } from "@/engine/rng";
import type { Config } from "@/engine/types";

export type View = "single" | "grid";
export type Scope = "style" | "any";

/** One exposed frame of film: a numbered avatar. */
export type Shot = { no: number; seed: string; config: Config };

export type StyleMemory = {
  /** The film, oldest first; the last shot is the current avatar. */
  shots: Shot[];
  /** Locked section keys: Randomize keeps these parts. */
  locks: string[];
  frame: Frame;
  flip: boolean;
  /** The next frame number to expose. */
  next: number;
  /** Grid view: the contact sheet's seed (its frames derive from it and the locks). */
  sheet: string | null;
  /** The circled sheet frame. */
  pick: number | null;
};

type State = {
  styleId: StyleId;
  view: View;
  scope: Scope;
  /** Bumped by every roll; the stage replays the roll motion when it changes. */
  rollId: number;
  memory: Record<StyleId, StyleMemory>;
};

type Actions = {
  selectStyle: (id: StyleId) => void;
  setView: (view: View) => void;
  setScope: (scope: Scope) => void;
  /** Randomize: a new frame in this style, or in any style. */
  roll: () => void;
  /** Shuffle unlocked: a new frame, always in this style. */
  shuffle: () => void;
  setPart: (key: string, value: string) => void;
  /** A part's dice: a different option (and colour), on the current frame. */
  rollPart: (sectionKey: string) => void;
  toggleLock: (sectionKey: string) => void;
  setFrame: (frame: Frame) => void;
  flip: () => void;
  /** Back to the style's first avatar, default locks, frame and orientation. */
  reset: () => void;
  rollSheet: () => void;
  pickFrame: (index: number) => void;
  /** Adopt the circled sheet frame and return to Single view. */
  keepFrame: () => void;
};

const MAX_SHOTS = 50;
/** Sample rolls already on each style's film when the page opens. */
const STARTER_ROLLS = 8;
const FIRST_SEED: Record<StyleId, string> = {
  flat: "4f2a9c",
  pixel: "91c0de",
  robots: "b07a11",
  doodle: "3e8f02",
  monsters: "c4d915",
  geometric: "7a2e64",
};

export const currentShot = (m: StyleMemory) => m.shots[m.shots.length - 1];

const defaultLocks = (id: StyleId) =>
  getStyle(id)
    .sections.filter((s) => s.locked)
    .map((s) => s.key);

/** Deterministic, so the server render and the client agree. */
const firstMemory = (id: StyleId, index: number): StyleMemory => {
  const seeds = makeRng(9000 + index);
  const earlier = Array.from({ length: STARTER_ROLLS }, (_, k) => {
    const seed = newSeed(seeds);
    return {
      no: k + 1,
      seed,
      config: ENGINES[id].random(makeRng(seedNumber(seed))),
    };
  });
  const first = {
    no: STARTER_ROLLS + 1,
    seed: FIRST_SEED[id],
    config: ENGINES[id].defaults,
  };
  return {
    shots: [...earlier, first],
    locks: defaultLocks(id),
    frame: getStyle(id).frame,
    flip: false,
    next: first.no + 1,
    sheet: null,
    pick: null,
  };
};

const withShot = (m: StyleMemory, shot: Shot): StyleMemory => ({
  ...m,
  shots: [...m.shots, shot].slice(-MAX_SHOTS),
  next: Math.max(m.next, shot.no + 1),
});

const withConfig = (m: StyleMemory, config: Config): StyleMemory => ({
  ...m,
  shots: [...m.shots.slice(0, -1), { ...currentShot(m), config }],
});

const keepIn = (id: StyleId, m: StyleMemory) =>
  keepOf(id, currentShot(m).config, m.locks);

const ensureSheet = (m: StyleMemory) =>
  m.sheet ? m : { ...m, sheet: newSeed(), pick: null };

/** A new frame in style `id`: a fresh seed, keeping that style's locked parts. */
const rolled = (s: State, id: StyleId): Partial<State> => {
  const m = s.memory[id];
  const seed = newSeed();
  const config = ENGINES[id].random(makeRng(seedNumber(seed)), keepIn(id, m));
  return {
    styleId: id,
    rollId: s.rollId + 1,
    memory: { ...s.memory, [id]: withShot(m, { no: m.next, seed, config }) },
  };
};

export const usePlayground = create<State & Actions>()((set) => ({
  styleId: "flat",
  view: "single",
  scope: "style",
  rollId: 0,
  memory: Object.fromEntries(
    STYLES.map((style, i) => [style.id, firstMemory(style.id, i)]),
  ) as Record<StyleId, StyleMemory>,

  selectStyle: (id) =>
    set((s) => ({
      styleId: id,
      memory:
        s.view === "grid"
          ? { ...s.memory, [id]: ensureSheet(s.memory[id]) }
          : s.memory,
    })),

  setView: (view) =>
    set((s) => ({
      view,
      memory:
        view === "grid"
          ? { ...s.memory, [s.styleId]: ensureSheet(s.memory[s.styleId]) }
          : s.memory,
    })),

  setScope: (scope) => set({ scope }),

  roll: () =>
    set((s) =>
      rolled(
        s,
        s.scope === "any"
          ? STYLES[Math.floor(Math.random() * STYLES.length)].id
          : s.styleId,
      ),
    ),

  shuffle: () => set((s) => rolled(s, s.styleId)),

  setPart: (key, value) =>
    set((s) => {
      const id = s.styleId;
      const m = s.memory[id];
      const config = { ...currentShot(m).config, [key]: value };
      if (!ENGINES[id].schema.safeParse(config).success) return {};
      return { memory: { ...s.memory, [id]: withConfig(m, config) } };
    }),

  rollPart: (sectionKey) =>
    set((s) => {
      const id = s.styleId;
      const section = getStyle(id).sections.find((x) => x.key === sectionKey);
      if (!section) return {};
      const m = s.memory[id];
      const r = makeRng(seedNumber(newSeed()));
      const now = currentShot(m).config;
      const other = (list: readonly string[], value: Config[string]) => {
        const pool = list.filter((v) => v !== value);
        return pool.length ? r.pick(pool) : value;
      };
      const config = { ...now };
      if (section.kind === "tiles") {
        config[section.key] = other(section.options, now[section.key]);
        if (section.sub)
          config[section.sub.key] = other(
            section.sub.colors,
            now[section.sub.key],
          );
      } else config[section.key] = other(section.colors, now[section.key]);
      return { memory: { ...s.memory, [id]: withConfig(m, config) } };
    }),

  toggleLock: (sectionKey) =>
    set((s) => {
      const id = s.styleId;
      const m = s.memory[id];
      const on = !m.locks.includes(sectionKey);
      const locks = getStyle(id)
        .sections.map((x) => x.key)
        .filter((k) => (k === sectionKey ? on : m.locks.includes(k)));
      return { memory: { ...s.memory, [id]: { ...m, locks } } };
    }),

  setFrame: (frame) =>
    set((s) => {
      const m = s.memory[s.styleId];
      return { memory: { ...s.memory, [s.styleId]: { ...m, frame } } };
    }),

  flip: () =>
    set((s) => {
      const m = s.memory[s.styleId];
      return {
        memory: { ...s.memory, [s.styleId]: { ...m, flip: !m.flip } },
      };
    }),

  reset: () =>
    set((s) => {
      const id = s.styleId;
      const m = s.memory[id];
      const shot = {
        no: m.next,
        seed: FIRST_SEED[id],
        config: ENGINES[id].defaults,
      };
      return {
        rollId: s.rollId + 1,
        memory: {
          ...s.memory,
          [id]: withShot(
            {
              ...m,
              locks: defaultLocks(id),
              frame: getStyle(id).frame,
              flip: false,
            },
            shot,
          ),
        },
      };
    }),

  rollSheet: () =>
    set((s) => {
      const m = s.memory[s.styleId];
      return {
        memory: {
          ...s.memory,
          [s.styleId]: { ...m, sheet: newSeed(), pick: null },
        },
      };
    }),

  pickFrame: (index) =>
    set((s) => {
      const m = s.memory[s.styleId];
      return {
        memory: { ...s.memory, [s.styleId]: { ...m, pick: index } },
      };
    }),

  keepFrame: () =>
    set((s) => {
      const id = s.styleId;
      const m = s.memory[id];
      if (!m.sheet || m.pick === null) return {};
      const config = rollSheet(id, m.sheet, keepIn(id, m))[m.pick];
      const kept = withShot(m, { no: m.next + m.pick, seed: m.sheet, config });
      return {
        view: "single",
        rollId: s.rollId + 1,
        memory: {
          ...s.memory,
          [id]: { ...kept, next: m.next + SHEET_SIZE, sheet: null, pick: null },
        },
      };
    }),
}));

/** The current style, its memory and its current frame. */
export const useCurrent = () => {
  const id = usePlayground((s) => s.styleId);
  const memory = usePlayground((s) => s.memory[s.styleId]);
  return { id, style: getStyle(id), memory, shot: currentShot(memory) };
};

/** The contact sheet's twelve frames: rolled from its seed, keeping the current locks. */
export const sheetOf = (id: StyleId, m: StyleMemory) =>
  m.sheet ? rollSheet(id, m.sheet, keepIn(id, m)) : [];
