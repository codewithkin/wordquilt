/**
 * A small seeded PRNG.
 *
 * Every stage of generation is seeded and deterministic, because a puzzle must
 * be REGENERABLE. Puzzle 7 of Kitchen Things has to come out identical on every
 * device and on every run, or:
 *
 *   - a player's progress cannot be stored as "puzzle 7 of pack X" (which is
 *     the whole on-device persistence model — constraint 2, no accounts),
 *   - the "never repeat a puzzle" rule (constraint 5) becomes unverifiable,
 *   - and a bug in a generated puzzle cannot be reproduced to fix it.
 *
 * `Math.random()` anywhere in this package is a bug.
 *
 * mulberry32 — small, fast, and good enough for puzzle layout. Not for
 * anything security-sensitive, which this is not.
 */
export interface Rng {
  /** Float in [0, 1). */
  next(): number;
  /** Integer in [0, max). */
  int(max: number): number;
  /** A new array, shuffled. Does not mutate the input. */
  shuffle<T>(items: readonly T[]): T[];
  /** One item, or undefined if empty. */
  pick<T>(items: readonly T[]): T | undefined;
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (max: number) => Math.floor(next() * max);

  return {
    next,
    int,
    shuffle<T>(items: readonly T[]): T[] {
      const out = items.slice();
      // Fisher-Yates, backwards.
      for (let i = out.length - 1; i > 0; i--) {
        const j = int(i + 1);
        [out[i], out[j]] = [out[j]!, out[i]!];
      }
      return out;
    },
    pick<T>(items: readonly T[]): T | undefined {
      return items.length === 0 ? undefined : items[int(items.length)];
    },
  };
}

/**
 * Derive a stable seed from a pack id and puzzle number.
 *
 * Deliberately NOT a hash of the content — the seed has to be knowable before
 * the puzzle exists, so that generation is a pure function of
 * (pack, index, config).
 */
export function puzzleSeed(packId: string, puzzleIndex: number): number {
  let h = 2166136261 >>> 0; // FNV-1a
  const key = `${packId}#${puzzleIndex}`;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
