import type { Puzzle } from "@wordquilt/generator";
import { boardHeight, grid as G } from "@wordquilt/tokens";
import { View } from "react-native";

import { LetterTile, type LetterTileState } from "@/components/ui";
import { cellDelay } from "@/lib/motion";

/**
 * The puzzle board.
 *
 * Shared by the cold open (O1/O2), the Puzzle screen (S2) and the Reveal (S3),
 * because all three draw the same 49 tiles in different states — and the design
 * is explicit that a screen sharing a job must share its UI.
 *
 * Tiles are absolutely positioned inside a fixed box; see LetterTile for why
 * flex + gap does not work here.
 */

export interface PuzzleBoardProps {
  puzzle: Puzzle;
  /** Words the player has found so far. */
  found: readonly string[];
  /** Cells under the finger right now, as "row,col". */
  tracing?: ReadonlySet<string>;
  /**
   * Reveal mode inverts the board: leftover letters come forward as cream
   * patches and word letters recede into the field. That inversion is the
   * payoff of the entire product.
   */
  revealing?: boolean;
}

export const cellKey = (row: number, col: number) => `${row},${col}`;

export function PuzzleBoard({
  puzzle,
  found,
  tracing,
  revealing = false,
}: PuzzleBoardProps) {
  // Which cells belong to a word the player has already sewn.
  const sewn = new Set<string>();
  for (const p of puzzle.placements) {
    if (found.includes(p.word)) {
      for (const c of p.path) sewn.add(cellKey(c.row, c.col));
    }
  }

  const leftover = new Set(puzzle.leftover.map((c) => cellKey(c.row, c.col)));

  const stateFor = (row: number, col: number): LetterTileState => {
    const key = cellKey(row, col);
    if (revealing) return leftover.has(key) ? "leftover" : "used";
    if (tracing?.has(key)) return "tracing";
    if (sewn.has(key)) return "sewn";
    return "idle";
  };

  return (
    <View
      className="self-center"
      style={{ width: G.boxWidth, height: boardHeight(puzzle.rows) }}
    >
      {puzzle.grid.map((row, r) =>
        row.map((char, c) => (
          <LetterTile
            key={cellKey(r, c)}
            char={char}
            row={r}
            col={c}
            state={stateFor(r, c)}
            // Only the Reveal staggers. During play a tile responds to the
            // finger immediately — a delay there would feel like lag.
            delay={revealing ? cellDelay(r, c, puzzle.cols) : 0}
          />
        )),
      )}
    </View>
  );
}
