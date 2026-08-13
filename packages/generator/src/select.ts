import type { Rng } from "./rng.ts";

/**
 * Word-set selection.
 *
 * This runs BEFORE packing, and it is the binding constraint on the whole
 * product. Leftover cells must exactly equal the theme phrase length, so:
 *
 *   sum of chosen word lengths = rows × cols − phrase length
 *
 * Not "about". Exactly. A set one letter off is unusable, so selection is a
 * subset-sum problem with a fixed cardinality, run against a pool that also
 * has per-word usage budgets across the pack.
 */

export interface SelectOptions {
  /** The words available, already filtered to those still under budget. */
  pool: readonly string[];
  /** Exact total letters required. */
  targetLetters: number;
  /** Exact number of words required. */
  wordCount: number;
  rng: Rng;
  /**
   * Give up after this many backtracking steps. Selection failing is a normal,
   * expected outcome — some (grid, phrase) pairs have no valid set in a given
   * pool — so it must fail fast and say so rather than hanging.
   */
  maxSteps?: number;
  /** Words that may not be chosen (already used in this puzzle's pack run). */
  exclude?: ReadonlySet<string>;
  /**
   * How many times each word has been used so far in this pack.
   *
   * Without a budget the selector converges hard on whichever words happen to
   * fit the arithmetic: measured on a 187-word pool it used only 94 distinct
   * words across 50 puzzles, with one word appearing NINE times. That is
   * exactly the repetition the most engaged players notice.
   */
  usage?: ReadonlyMap<string, number>;
  /** Maximum times one word may appear across a pack. */
  maxUsesPerWord?: number;
  /**
   * Shortest word the puzzle will show.
   *
   * Defaults to 4, not 3. Hitting an exact total is easy if three-letter words
   * are allowed — the selector will happily return one 11-letter word and six
   * 3-letter ones, which is arithmetically perfect and a miserable puzzle. The
   * design's own reference board is six words averaging 5.5 letters.
   */
  minWordLength?: number;
  /**
   * Longest word the puzzle will show. Caps the "one giant word plus filler"
   * shape from the other end.
   */
  maxWordLength?: number;
  /**
   * How many words may sit at `minWordLength` or `minWordLength + 1`.
   *
   * Without this the selector satisfies the total with a pile of short words
   * even when longer ones are available, because short words give it the most
   * freedom to land on the exact number.
   */
  maxShortWords?: number;
}

export type SelectResult =
  | { ok: true; words: string[]; steps: number }
  | { ok: false; reason: string; steps: number };

/**
 * Pick `wordCount` distinct words from `pool` whose lengths total exactly
 * `targetLetters`.
 *
 * Randomised backtracking with feasibility pruning. The pruning is what makes
 * this fast: at each step we know the shortest and longest possible completion
 * from the remaining candidates, so a branch that cannot reach the target is
 * abandoned immediately instead of being explored to the leaf.
 */
export function selectWordSet(options: SelectOptions): SelectResult {
  const {
    pool,
    targetLetters,
    wordCount,
    rng,
    maxSteps = 200_000,
    exclude,
    minWordLength = 4,
    maxWordLength = 9,
    maxShortWords = 2,
    usage,
    maxUsesPerWord = 2,
  } = options;

  const candidates = pool.filter(
    (w) =>
      w.length >= minWordLength &&
      w.length <= maxWordLength &&
      !exclude?.has(w) &&
      (usage?.get(w) ?? 0) < maxUsesPerWord,
  );

  /** A word is "short" if it sits in the bottom two length bands. */
  const isShort = (len: number) => len <= minWordLength + 1;

  if (candidates.length < wordCount) {
    return {
      ok: false,
      steps: 0,
      reason: `pool has ${candidates.length} usable words, need ${wordCount}`,
    };
  }

  // Sorting by length lets us compute tight min/max completions from a
  // contiguous window, which is what makes the pruning cheap. The shuffle
  // first keeps equal-length words from always being tried in the same order,
  // so different seeds explore genuinely different sets.
  const words = rng.shuffle(candidates).sort((a, b) => a.length - b.length);
  const lengths = words.map((w) => w.length);
  const n = words.length;

  // suffixMin[i] / suffixMax[i]: the smallest and largest total obtainable by
  // taking `k` words from index i onward. Since `words` is length-sorted, the
  // k shortest from i are the next k, and the k longest are the final k.
  const prefixSum: number[] = [0];
  for (let i = 0; i < n; i++) prefixSum.push(prefixSum[i]! + lengths[i]!);

  const minFrom = (i: number, k: number) =>
    k === 0 ? 0 : prefixSum[i + k]! - prefixSum[i]!;
  // The k longest available are always the final k, regardless of where the
  // search currently is — so this deliberately ignores the start index.
  const maxFrom = (_start: number, k: number) =>
    k === 0 ? 0 : prefixSum[n]! - prefixSum[n - k]!;

  let steps = 0;
  let shortUsed = 0;
  const chosen: number[] = [];

  const search = (start: number, remaining: number, needed: number): boolean => {
    if (needed === 0) return remaining === 0;
    if (start >= n) return false;
    if (n - start < needed) return false;
    if (++steps > maxSteps) return false;

    // Unreachable in either direction — abandon without exploring.
    if (minFrom(start, needed) > remaining) return false;
    if (maxFrom(start, needed) < remaining) return false;

    for (let i = start; i <= n - needed; i++) {
      const len = lengths[i]!;
      if (len > remaining) break; // sorted, so everything after is worse

      // Cap the short words. Without this the search satisfies the total with a
      // pile of 4-letter words even when longer ones are available, because
      // short words give it the most freedom to land on the exact number.
      const short = isShort(len);
      if (short && shortUsed >= maxShortWords) continue;

      if (short) shortUsed++;
      chosen.push(i);
      if (search(i + 1, remaining - len, needed - 1)) return true;
      chosen.pop();
      if (short) shortUsed--;
      if (steps > maxSteps) return false;
    }
    return false;
  };

  const found = search(0, targetLetters, wordCount);

  if (!found) {
    return {
      ok: false,
      steps,
      reason:
        steps > maxSteps
          ? `gave up after ${maxSteps} steps`
          : `no ${wordCount}-word set in this pool totals exactly ${targetLetters} letters`,
    };
  }

  // Longest first. The packer places in this order and long words are the
  // hardest to fit — placing them into an empty board rather than into the
  // holes left by short ones roughly halves the restart rate.
  const selected = chosen.map((i) => words[i]!);
  selected.sort((a, b) => b.length - a.length);
  return { ok: true, words: selected, steps };
}

/**
 * Which phrase lengths a given grid can support, for a pool.
 *
 * Useful when authoring a theme: it answers "what length must my phrases be
 * for this to work at 8×8 with 8 words?" before anyone writes 50 of them.
 */
export function feasiblePhraseLengths(
  pool: readonly string[],
  rows: number,
  cols: number,
  wordCount: number,
  minWordLength = 3,
): { min: number; max: number } {
  const lengths = pool
    .filter((w) => w.length >= minWordLength)
    .map((w) => w.length)
    .sort((a, b) => a - b);

  if (lengths.length < wordCount) return { min: 0, max: 0 };

  const shortest = lengths.slice(0, wordCount).reduce((a, b) => a + b, 0);
  const longest = lengths.slice(-wordCount).reduce((a, b) => a + b, 0);
  const cells = rows * cols;

  // Longest words leave the fewest cells over, and vice versa.
  return { min: Math.max(0, cells - longest), max: Math.max(0, cells - shortest) };
}
