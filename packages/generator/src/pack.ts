import type { Rng } from "./rng.ts";
import { DIRECTIONS, type Cell, type Placement } from "./types.ts";

/**
 * The backtracking path packer.
 *
 * Places each word along a snaking path of 8-adjacent cells, with no cell
 * reused within a word AND no cell shared between words. The leftover cells —
 * wherever they happen to fall — become the theme phrase.
 *
 * ── Why leftover POSITIONS are unconstrained ────────────────────────────────
 * The theme fills leftover cells in reading order, so any set of leftover cells
 * works: the phrase is assigned to them after the fact. That is a large amount
 * of freedom and it is what makes this tractable. The packer only has to place
 * k disjoint paths totalling `cells − phraseLength`; it never has to steer the
 * holes anywhere in particular.
 *
 * ── What actually makes it succeed ──────────────────────────────────────────
 * Two heuristics do most of the work, and removing either one costs a lot:
 *
 *   1. Longest word first, into the emptiest board.
 *   2. Most-constrained start cells first — begin where there is least room,
 *      because those cells are the ones that strand if left to last.
 *
 * Plus randomised restarts. A restart is cheap; deep backtracking is not.
 */

export interface PackOptions {
  rows: number;
  cols: number;
  /** Longest first. `selectWordSet` already returns them this way. */
  words: readonly string[];
  rng: Rng;
  /** Whole-board restarts before giving up. */
  maxRestarts?: number;
  /** Path-search nodes per word before abandoning a start cell. */
  maxNodesPerWord?: number;
}

export type PackResult =
  | { ok: true; placements: Placement[]; restarts: number }
  | { ok: false; reason: string; restarts: number };

const key = (row: number, col: number) => row * 100 + col;

export function packWords(options: PackOptions): PackResult {
  const {
    rows,
    cols,
    words,
    rng,
    maxRestarts = 60,
    maxNodesPerWord = 20_000,
  } = options;

  const totalLetters = words.reduce((sum, w) => sum + w.length, 0);
  if (totalLetters > rows * cols) {
    return {
      ok: false,
      restarts: 0,
      reason: `words need ${totalLetters} cells, grid has ${rows * cols}`,
    };
  }

  for (let restart = 0; restart < maxRestarts; restart++) {
    const used = new Set<number>();
    const placements: Placement[] = [];

    if (placeAll(0)) {
      return { ok: true, placements, restarts: restart };
    }

    /** Place words[i..] into `used`. Returns true if all fit. */
    function placeAll(i: number): boolean {
      if (i >= words.length) return true;
      const word = words[i]!;

      for (const start of orderedStarts(rows, cols, used, rng)) {
        const path = findPath(word.length, start, used, rows, cols, maxNodesPerWord);
        if (!path) continue;

        for (const c of path) used.add(key(c.row, c.col));
        placements.push({ word, path });

        if (placeAll(i + 1)) return true;

        // Undo and try a different start for THIS word. One level of
        // backtracking per word; beyond that a restart is cheaper than
        // exhausting the tree.
        placements.pop();
        for (const c of path) used.delete(key(c.row, c.col));
      }
      return false;
    }
  }

  return {
    ok: false,
    restarts: maxRestarts,
    reason: `could not pack ${words.length} words into ${rows}×${cols} in ${maxRestarts} restarts`,
  };
}

/**
 * Free cells, most-constrained first, with ties broken randomly.
 *
 * Starting where there is least room is what stops the packer stranding
 * single free cells in corners that nothing can then reach.
 */
function orderedStarts(
  rows: number,
  cols: number,
  used: Set<number>,
  rng: Rng,
): Cell[] {
  const free: { cell: Cell; freedom: number; jitter: number }[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (used.has(key(row, col))) continue;
      let freedom = 0;
      for (const [dr, dc] of DIRECTIONS) {
        const r = row + dr;
        const c = col + dc;
        if (r >= 0 && r < rows && c >= 0 && c < cols && !used.has(key(r, c))) {
          freedom++;
        }
      }
      free.push({ cell: { row, col }, freedom, jitter: rng.next() });
    }
  }

  free.sort((a, b) => a.freedom - b.freedom || a.jitter - b.jitter);
  return free.map((f) => f.cell);
}

/**
 * Randomised DFS for a path of exactly `length` cells from `start`.
 *
 * Neighbours are visited most-constrained-first for the same reason starts are.
 * The node budget bounds the search: a word that will not fit from this start
 * should be abandoned quickly so another start can be tried.
 */
function findPath(
  length: number,
  start: Cell,
  used: Set<number>,
  rows: number,
  cols: number,
  maxNodes: number,
): Cell[] | null {
  const path: Cell[] = [];
  const local = new Set<number>();
  let nodes = 0;

  const step = (cell: Cell): boolean => {
    if (++nodes > maxNodes) return false;

    path.push(cell);
    local.add(key(cell.row, cell.col));

    if (path.length === length) return true;

    // No jitter here: neighbour order is a pure function of the board, so a
    // given seed always produces the same path. Randomness enters only through
    // the start-cell ordering, which is enough to vary boards between seeds.
    const neighbours: { cell: Cell; freedom: number }[] = [];
    for (const [dr, dc] of DIRECTIONS) {
      const r = cell.row + dr;
      const c = cell.col + dc;
      if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
      const k = key(r, c);
      if (used.has(k) || local.has(k)) continue;

      let freedom = 0;
      for (const [dr2, dc2] of DIRECTIONS) {
        const r2 = r + dr2;
        const c2 = c + dc2;
        if (r2 < 0 || r2 >= rows || c2 < 0 || c2 >= cols) continue;
        const k2 = key(r2, c2);
        if (!used.has(k2) && !local.has(k2)) freedom++;
      }
      neighbours.push({ cell: { row: r, col: c }, freedom });
    }

    neighbours.sort((a, b) => a.freedom - b.freedom);

    for (const n of neighbours) {
      if (step(n.cell)) return true;
    }

    path.pop();
    local.delete(key(cell.row, cell.col));
    return false;
  };

  return step(start) ? path : null;
}
