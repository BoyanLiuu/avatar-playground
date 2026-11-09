// The playground's state (zustand). Each style keeps its own memory, so switching styles and back
// brings everything back:
// - `present`: the film, its circled frame, the frame shape and orientation. Every change to it is
//   an undo step; `past` and `future` hold up to 50 each.
// - `locks`: a setting, not an undo step; saved across reloads (./locks.ts).
// - the frame counter and the contact sheet.
// Every config that enters the store is rolled by the engine or validated by the style's schema.
import { create } from "zustand";
import { type Frame, STYLES, type StyleId, getStyle } from "@/content/styles";
import { ENGINES, SHEET_SIZE, keepOf, rollSheet } from "@/engine/registry";
import { makeRng, newSeed, seedNumber } from "@/engine/rng";
import type { Config } from "@/engine/types";
import type { SharedAvatar } from "./url";

export type View = "single" | "grid";
export type Scope = "style" | "any";

/** One exposed frame of film: a numbered avatar, with the seed that rolled it (none if shared). */
export type Shot = { no: number; seed: string | null; config: Config };

/** What undo steps through: the film, the circled frame, the frame shape and orientation. */
export type Present = {
  /** The film, oldest first, at most 50 frames. */
  shots: Shot[];
  /** The circled frame's number: the current avatar. */
  current: number;
  frame: Frame;
  flip: boolean;
};

export type StyleMemory = {
  present: Present;
  past: Present[];
  future: Present[];
  /** Locked section keys: Randomize keeps these parts. */
  locks: string[];
  /** The next frame number to expose (never reused, so a number names one avatar). */
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
  /** A fresh frame in style `id`, which becomes current (a bad link's fallback). */
  rollStyle: (id: StyleId) => void;
  /** Open a shared avatar: its style becomes current and the avatar a new frame of its film. */
  openShared: (avatar: SharedAvatar) => void;
  setPart: (key: string, value: string) => void;
  /** A part's dice: a different option (and colour), on the current frame. */
  rollPart: (sectionKey: string) => void;
  toggleLock: (sectionKey: string) => void;
  /** Saved locks, applied once after the page loads. */
  restoreLocks: (saved: Partial<Record<StyleId, string[]>>) => void;
  setFrame: (frame: Frame) => void;
  flip: () => void;
  /** Back to the style's first avatar, default locks, frame and orientation. */
  reset: () => void;
  /** Circle an earlier frame of the film: it becomes the current avatar. */
  restore: (no: number) => void;
  undo: () => void;
  redo: () => void;
  rollSheet: () => void;
  pickFrame: (index: number) => void;
  /** Adopt the circled sheet frame and return to Single view. */
  keepFrame: () => void;
};

/** Undo steps kept each way, and frames kept on the film. */
export const MAX_STEPS = 50;
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

export const currentShot = (m: StyleMemory) =>
  m.present.shots.find((s) => s.no === m.present.current) ??
  m.present.shots[m.present.shots.length - 1];

export const defaultLocks = (id: StyleId) =>
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
    present: {
      shots: [...earlier, first],
      current: first.no,
      frame: getStyle(id).frame,
      flip: false,
    },
    past: [],
    future: [],
    locks: defaultLocks(id),
    next: first.no + 1,
    sheet: null,
    pick: null,
  };
};

/** A new undo step: the old present goes onto `past`, and `future` is dropped. */
const commit = (m: StyleMemory, present: Present): StyleMemory => ({
  ...m,
  present,
  past: [...m.past, m.present].slice(-MAX_STEPS),
  future: [],
});

const withShot = (m: StyleMemory, shot: Shot): StyleMemory => ({
  ...commit(m, {
    ...m.present,
    shots: [...m.present.shots, shot].slice(-MAX_SHOTS),
    current: shot.no,
  }),
  next: Math.max(m.next, shot.no + 1),
});

const withConfig = (m: StyleMemory, config: Config): StyleMemory => {
  const { present } = m;
  if (JSON.stringify(currentShot(m).config) === JSON.stringify(config))
    return m;
  return commit(m, {
    ...present,
    shots: present.shots.map((s) =>
      s.no === present.current ? { ...s, config } : s,
    ),
  });
};

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

/** Locks in section order, known keys only (saved locks come from outside). */
const cleanLocks = (id: StyleId, keys: readonly string[]) =>
  getStyle(id)
    .sections.map((x) => x.key)
    .filter((k) => keys.includes(k));

export const usePlayground = create<State & Actions>()((set) => {
  /** Change the current style's memory. */
  const change = (fn: (m: StyleMemory, id: StyleId) => StyleMemory) =>
    set((s) => ({
      memory: { ...s.memory, [s.styleId]: fn(s.memory[s.styleId], s.styleId) },
    }));

  return {
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

    rollStyle: (id) => set((s) => rolled(s, id)),

    openShared: ({ id, config, frame, flip }) =>
      set((s) => {
        const m = s.memory[id];
        const same =
          JSON.stringify(currentShot(m).config) === JSON.stringify(config) &&
          m.present.frame === frame &&
          m.present.flip === flip;
        if (same) return { styleId: id };
        const opened = withShot(m, { no: m.next, seed: null, config });
        return {
          styleId: id,
          memory: {
            ...s.memory,
            [id]: { ...opened, present: { ...opened.present, frame, flip } },
          },
        };
      }),

    setPart: (key, value) =>
      change((m, id) => {
        const config = { ...currentShot(m).config, [key]: value };
        return ENGINES[id].schema.safeParse(config).success
          ? withConfig(m, config)
          : m;
      }),

    rollPart: (sectionKey) =>
      change((m, id) => {
        const section = getStyle(id).sections.find((x) => x.key === sectionKey);
        if (!section) return m;
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
        return withConfig(m, config);
      }),

    toggleLock: (sectionKey) =>
      change((m, id) => ({
        ...m,
        locks: m.locks.includes(sectionKey)
          ? m.locks.filter((k) => k !== sectionKey)
          : cleanLocks(id, [...m.locks, sectionKey]),
      })),

    restoreLocks: (saved) =>
      set((s) => ({
        memory: Object.fromEntries(
          STYLES.map(({ id }) => [
            id,
            saved[id]
              ? { ...s.memory[id], locks: cleanLocks(id, saved[id]) }
              : s.memory[id],
          ]),
        ) as Record<StyleId, StyleMemory>,
      })),

    setFrame: (frame) =>
      change((m) =>
        m.present.frame === frame ? m : commit(m, { ...m.present, frame }),
      ),

    flip: () =>
      change((m) => commit(m, { ...m.present, flip: !m.present.flip })),

    reset: () =>
      set((s) => {
        const id = s.styleId;
        const m = s.memory[id];
        const shot = {
          no: m.next,
          seed: FIRST_SEED[id],
          config: ENGINES[id].defaults,
        };
        const reset = withShot(m, shot);
        return {
          rollId: s.rollId + 1,
          memory: {
            ...s.memory,
            [id]: {
              ...reset,
              present: {
                ...reset.present,
                frame: getStyle(id).frame,
                flip: false,
              },
              locks: defaultLocks(id),
            },
          },
        };
      }),

    restore: (no) =>
      change((m) =>
        m.present.current === no ||
        !m.present.shots.some((shot) => shot.no === no)
          ? m
          : commit(m, { ...m.present, current: no }),
      ),

    undo: () =>
      change((m) =>
        m.past.length
          ? {
              ...m,
              present: m.past[m.past.length - 1],
              past: m.past.slice(0, -1),
              future: [m.present, ...m.future].slice(0, MAX_STEPS),
            }
          : m,
      ),

    redo: () =>
      change((m) =>
        m.future.length
          ? {
              ...m,
              present: m.future[0],
              past: [...m.past, m.present].slice(-MAX_STEPS),
              future: m.future.slice(1),
            }
          : m,
      ),

    rollSheet: () => change((m) => ({ ...m, sheet: newSeed(), pick: null })),

    pickFrame: (index) => change((m) => ({ ...m, pick: index })),

    keepFrame: () =>
      set((s) => {
        const id = s.styleId;
        const m = s.memory[id];
        if (!m.sheet || m.pick === null) return {};
        const config = rollSheet(id, m.sheet, keepIn(id, m))[m.pick];
        const kept = withShot(m, {
          no: m.next + m.pick,
          seed: m.sheet,
          config,
        });
        return {
          view: "single",
          rollId: s.rollId + 1,
          memory: {
            ...s.memory,
            [id]: {
              ...kept,
              next: m.next + SHEET_SIZE,
              sheet: null,
              pick: null,
            },
          },
        };
      }),
  };
});

/** The current style, its memory, its present and its current frame. */
export const useCurrent = () => {
  const id = usePlayground((s) => s.styleId);
  const memory = usePlayground((s) => s.memory[s.styleId]);
  return {
    id,
    style: getStyle(id),
    memory,
    present: memory.present,
    shot: currentShot(memory),
  };
};

/** The contact sheet's twelve frames: rolled from its seed, keeping the current locks. */
export const sheetOf = (id: StyleId, m: StyleMemory) =>
  m.sheet ? rollSheet(id, m.sheet, keepIn(id, m)) : [];
