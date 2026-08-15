import { grid as GEO } from "@wordquilt/tokens";

import { DIRECTIONS, type Cell, type Placement } from "./types.ts";

/**
 * Tracing — the core gesture of the product.
 *
 * Kept here, as pure functions over coordinates, rather than inside the gesture
 * handler. The rules about what a legal trace IS are game rules, not UI
 * concerns, and they are the one piece of logic that absolutely must be right:
 * a trace that accepts a non-adjacent hop, or rejects a legitimate diagonal,
 * breaks the only interaction the product has. Pure functions mean CI can
 * actually test them.
 *
 * The gesture layer's whole job is to turn finger positions into cells and hand
 * them here.
 */

/** Where the board sits, so a touch can be mapped to a cell. */
export interface BoardGeometry {
  rows: number;
  cols: number;
  /** Distance between adjacent cell origins. */
  pitch: number;
  /** Drawn size of a cell. */
  cell: number;
  /** Left inset of the board inside its box. */
  pad: number;
}

export const defaultGeometry = (rows: number, cols: number): BoardGeometry => ({
  rows,
  cols,
  pitch: GEO.pitch,
  cell: GEO.cell,
  pad: GEO.pad,
});

/**
 * Which cell is under a point, in board-box coordinates.
 *
 * Hit targets are the full PITCH, not the drawn cell, so the 2px gutters
 * between tiles do not drop the trace mid-drag. A finger crossing the gap
 * between two tiles is still tracing; treating the gutter as a miss makes the
 * gesture feel broken even though the tiles are exactly where they look.
 */
export function cellAt(
  x: number,
  y: number,
  geo: BoardGeometry,
): Cell | null {
  const col = Math.floor((x - geo.pad) / geo.pitch);
  const row = Math.floor(y / geo.pitch);
  if (row < 0 || row >= geo.rows || col < 0 || col >= geo.cols) return null;
  return { row, col };
}

export const sameCell = (a: Cell, b: Cell) => a.row === b.row && a.col === b.col;

/** Orthogonally OR diagonally adjacent. Diagonals are legal — words snake. */
export function isAdjacent(a: Cell, b: Cell): boolean {
  return DIRECTIONS.some(([dr, dc]) => a.row + dr === b.row && a.col + dc === b.col);
}

/**
 * Can the trace be extended to `next`?
 *
 * Two rules, both from the design: the step must be to an adjacent cell, and no
 * cell may be reused within a single trace.
 */
export function canExtend(path: readonly Cell[], next: Cell): boolean {
  if (path.length === 0) return true;
  if (path.some((c) => sameCell(c, next))) return false;
  return isAdjacent(path[path.length - 1]!, next);
}

/**
 * Extend a trace, handling the backtrack case.
 *
 * Dragging back onto the previous cell UNDOES the last step rather than being
 * rejected. Players correct themselves constantly mid-drag, and a trace that
 * can only grow forces them to lift and start over — which on a 9×9 board is
 * genuinely annoying. Returns the same array reference when nothing changed, so
 * callers can skip re-rendering.
 */
export function extendTrace(path: readonly Cell[], next: Cell): Cell[] {
  if (path.length === 0) return [next];

  const last = path[path.length - 1]!;
  if (sameCell(last, next)) return path as Cell[];

  // Backtrack: the finger moved onto the cell before last.
  if (path.length >= 2 && sameCell(path[path.length - 2]!, next)) {
    return path.slice(0, -1);
  }

  if (!canExtend(path, next)) return path as Cell[];
  return [...path, next];
}

/** The letters a trace spells, in order. */
export function readTrace(path: readonly Cell[], grid: readonly string[][]): string {
  return path.map(({ row, col }) => grid[row]?.[col] ?? "").join("");
}

/**
 * Does this trace complete one of the puzzle's words?
 *
 * Matched against the PLACEMENTS, not just the word list — the trace has to
 * cover the cells the word actually occupies, not merely spell it. Two words
 * can share letters elsewhere on the board, and accepting a coincidental
 * spelling would leave the real placement unsewn and its cells wrongly counted
 * as used, which breaks the leftover arithmetic and therefore the reveal.
 *
 * Either direction counts: a player who traces KETTLE backwards has found it.
 */
export function matchTrace(
  path: readonly Cell[],
  placements: readonly Placement[],
): Placement | null {
  if (path.length < 2) return null;

  for (const placement of placements) {
    if (placement.path.length !== path.length) continue;
    const forward = placement.path.every((c, i) => sameCell(c, path[i]!));
    if (forward) return placement;
    const reversed = placement.path.every((c, i) =>
      sameCell(c, path[path.length - 1 - i]!),
    );
    if (reversed) return placement;
  }
  return null;
}

/**
 * Is this trace still a viable prefix of some unfound word?
 *
 * Used to keep the trace looking "live" while it could still become a word. It
 * deliberately does NOT drive any feedback that would tell the player they are
 * wrong — the product never says that (constraint 4). It exists so the UI can
 * stay neutral rather than celebrating a doomed path.
 */
export function isViablePrefix(
  path: readonly Cell[],
  placements: readonly Placement[],
  found: readonly string[],
): boolean {
  if (path.length === 0) return true;
  return placements.some((placement) => {
    if (found.includes(placement.word)) return false;
    if (placement.path.length < path.length) return false;
    const forward = path.every((c, i) => sameCell(c, placement.path[i]!));
    const backward = path.every((c, i) =>
      sameCell(c, placement.path[placement.path.length - 1 - i]!),
    );
    return forward || backward;
  });
}
