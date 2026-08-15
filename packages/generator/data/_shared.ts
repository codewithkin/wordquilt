import type { TitleBank } from "../src/titles.ts";

/**
 * Helpers shared by every theme's data file.
 *
 * Vocabulary rules, from the handover:
 *   - 4–9 letters (the selector's window; shorter reads as filler, longer
 *     rarely packs)
 *   - within roughly the top 30,000 lemmas — difficulty comes from grid size
 *     and path tangling, NEVER from vocabulary obscurity
 *   - no duplicates within a pool: a duplicate lets one word be picked twice
 *   - locale-locked, not mixed
 *
 * `pool()` dedupes and sorts so the files stay readable while the data stays
 * clean. `packages/generator/bench/vocabulary.mjs` enforces the rest.
 */
export const pool = (...words: string[]): string[] =>
  [...new Set(words.map((w) => w.toUpperCase().trim()))].sort();

/**
 * Build a title bank from frames + fillers + standalone lines.
 *
 * Capacity is frames × fillers + standalone, and it must comfortably exceed the
 * pack size or the generator runs out of non-repeating titles. 8 × 8 + 10 = 74,
 * which covers a 30-puzzle pack with room to spare.
 */
export const titles = (
  frames: string[],
  fillers: string[],
  standalone: string[],
): TitleBank => ({ frames, fillers, standalone });
