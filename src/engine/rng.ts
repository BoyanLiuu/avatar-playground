// Seeded randomness (ported from the prototype). mulberry32, plus deck(): picks without repeats
// until the deck is empty, so one contact sheet shows every option.

export type Rng = {
  next: () => number;
  range: (a: number, b: number) => number;
  int: (a: number, b: number) => number;
  chance: (p: number) => boolean;
  pick: <const T>(list: readonly T[]) => T;
  shuffle: <T>(list: readonly T[]) => T[];
  deck: <const T>(key: string, list: readonly T[]) => T;
};

export const makeRng = (seed: number): Rng => {
  let s = seed >>> 0;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const shuffle = <T>(list: readonly T[]) => {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const decks = new Map<string, unknown[]>();
  return {
    next,
    range: (a, b) => a + next() * (b - a),
    int: (a, b) => Math.floor(a + next() * (b - a + 1)),
    chance: (p) => next() < p,
    pick: (list) => list[Math.floor(next() * list.length)],
    shuffle,
    deck: <const T>(key: string, list: readonly T[]) => {
      let d = decks.get(key) as T[] | undefined;
      if (!d?.length) {
        d = shuffle(list);
        decks.set(key, d);
      }
      return d.pop() as T;
    },
  };
};

/** A uint32 drawn from the rng: the stored seed of a part's texture (blob wobble, spots, bars). */
export const draw32 = (r: Rng) => Math.floor(r.next() * 2 ** 32);

/** A roll seed: six hex digits, shown as "seed 4f2a9c". Fresh unless drawn from `r`. */
export const newSeed = (r?: Rng) =>
  Math.floor((r ? r.next() : Math.random()) * 0x1000000)
    .toString(16)
    .padStart(6, "0");

export const seedNumber = (seed: string) => Number.parseInt(seed, 16) >>> 0;
