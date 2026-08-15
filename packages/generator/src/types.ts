/**
 * The shapes the generator works in.
 *
 * A note on the arithmetic that governs everything here:
 *
 *   rows × cols − (sum of placed word lengths) = theme phrase length
 *
 * Words are placed on DISJOINT paths — no two words share a cell. That is
 * forced by the arithmetic, not a stylistic choice: if words could cross, the
 * used-cell count would be less than the sum of their lengths and the leftover
 * count would stop being predictable. It is also what makes the reveal
 * trustworthy — every cell belongs to exactly one word, or to the theme.
 */

/** Zero-indexed grid position. */
export interface Cell {
  row: number;
  col: number;
}

/** A word and the snaking path it occupies, in letter order. */
export interface Placement {
  word: string;
  path: Cell[];
}

export interface Puzzle {
  rows: number;
  cols: number;
  /** Row-major letters. `grid[row][col]`. */
  grid: string[][];
  placements: Placement[];
  /** Cells not used by any word, in reading order. Spells the theme. */
  leftover: Cell[];
  /**
   * The theme, as shown on the Reveal screen — real punctuation and spacing.
   * Its letters-only form is what fills `leftover`.
   */
  theme: string;
  /** The oblique hint shown DURING play. Never the theme itself. */
  obliqueTitle: string;
  seed: number;
}

export interface GridSpec {
  rows: number;
  cols: number;
  /** How many words to place. */
  wordCount: number;
}

/**
 * The difficulty ramp, from the handover: "Grid sizes ramp from 6×6 with 6
 * words up to 9×9 with 10 words."
 *
 * Difficulty comes from grid size and path tangling, NEVER from vocabulary
 * obscurity. A harder puzzle is a bigger, more tangled board of ordinary words.
 */
export const DIFFICULTY_RAMP: readonly GridSpec[] = [
  // 6x6 carries FIVE words, not the six the handover sketches. Measured: six is
  // arithmetically impossible. 36 cells minus a 9-20 letter phrase leaves ~27
  // letters, but six words with at most two short ones needs 4+5+6+6+6+6 = 33.
  // Five words fit (4+5+6+6+6 = 27) and the board still reads as a full puzzle.
  { rows: 6, cols: 6, wordCount: 5 },
  { rows: 7, cols: 7, wordCount: 7 },
  { rows: 8, cols: 8, wordCount: 8 },
  { rows: 8, cols: 8, wordCount: 9 },
  { rows: 9, cols: 9, wordCount: 10 },
];

/** The eight directions a trace may step. Diagonals included. */
export const DIRECTIONS: readonly [number, number][] = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1],
];

/** Strip a display phrase to the letters that occupy grid cells. */
export const lettersOnly = (phrase: string): string =>
  phrase.toUpperCase().replace(/[^A-Z]/g, "");

export interface Theme {
  id: string;
  /** Display name, e.g. "Kitchen Things". */
  name: string;
  /**
   * The phrases revealed at the end. One is chosen per puzzle; its
   * letters-only length sets the leftover count and therefore the word budget.
   */
  phrases: readonly string[];
  /** The curated, on-theme, common-usage word pool. */
  words: readonly string[];
}
