import {
  cellAt,
  defaultGeometry,
  extendTrace,
  matchTrace,
  type Cell,
  type Puzzle,
} from "@wordquilt/generator";
import { boardHeight, grid as G } from "@wordquilt/tokens";
import * as Haptics from "expo-haptics";
import { useCallback, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

import { LetterTile, type LetterTileState } from "@/components/ui";
import { useSettings } from "@/contexts/settings-context";
import { cellDelay } from "@/lib/motion";

/**
 * The board, with the trace gesture. THE core interaction of the product.
 *
 * The rules about what a legal trace is live in `@wordquilt/generator/trace` as
 * pure functions, tested directly. This component only turns finger positions
 * into cells and hands them over.
 *
 * ── Why a Pan and not a Long-press or a series of taps ──────────────────────
 * The design's gesture is "drag a finger across adjacent letters". A pan
 * beginning anywhere on the board starts a trace; lifting commits it. There is
 * deliberately no "submit" — the lift IS the submit.
 *
 * ── What happens on a wrong trace ───────────────────────────────────────────
 * Nothing. The trace simply clears. No shake, no red, no buzz, no "not quite" —
 * the product never tells a player they got something wrong (constraint 4). A
 * correct trace gets a light haptic tick; an incorrect one gets silence, which
 * is a very different thing from a rebuke.
 */

export interface TraceableBoardProps {
  puzzle: Puzzle;
  found: readonly string[];
  /** Called with the word when a trace completes one. */
  onFound: (word: string) => void;
  /** Reveal mode inverts the board and disables tracing. */
  revealing?: boolean;
  /** Cells the hint has opened — shown as tracing-coloured but not sewn. */
  hinted?: ReadonlySet<string>;
}

export const cellKey = (row: number, col: number) => `${row},${col}`;

export function TraceableBoard({
  puzzle,
  found,
  onFound,
  revealing = false,
  hinted,
}: TraceableBoardProps) {
  const { settings, reduceMotion } = useSettings();

  const geo = useMemo(
    () => defaultGeometry(puzzle.rows, puzzle.cols),
    [puzzle.rows, puzzle.cols],
  );

  const [trace, setTrace] = useState<Cell[]>([]);
  // The gesture callbacks run on the UI thread and cannot read React state, so
  // the live path is mirrored in a ref that runOnJS handlers mutate.
  const traceRef = useRef<Cell[]>([]);

  const moveTo = useCallback(
    (x: number, y: number) => {
      const cell = cellAt(x, y, geo);
      if (!cell) return;
      const next = extendTrace(traceRef.current, cell);
      if (next === traceRef.current) return; // no change, skip the render
      traceRef.current = next;
      setTrace(next);
    },
    [geo],
  );

  const commit = useCallback(() => {
    const path = traceRef.current;
    traceRef.current = [];
    setTrace([]);

    const match = matchTrace(path, puzzle.placements);
    if (!match || found.includes(match.word)) return;

    // A light tick for a found word. Nothing at all for a wrong trace —
    // silence is not a rebuke, and a buzz would be. Turning haptics off in
    // Settings silences WordQuilt and nothing else on the device.
    if (settings.haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onFound(match.word);
  }, [found, onFound, puzzle.placements, settings.haptics]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        // Fire from the first touch rather than after a drag threshold, so the
        // tile under the finger lights up immediately.
        .minDistance(0)
        .onBegin((e) => {
          runOnJS(moveTo)(e.x, e.y);
        })
        .onUpdate((e) => {
          runOnJS(moveTo)(e.x, e.y);
        })
        .onFinalize(() => {
          runOnJS(commit)();
        })
        .enabled(!revealing),
    [moveTo, commit, revealing],
  );

  const sewn = useMemo(() => {
    const set = new Set<string>();
    for (const p of puzzle.placements) {
      if (found.includes(p.word)) {
        for (const c of p.path) set.add(cellKey(c.row, c.col));
      }
    }
    return set;
  }, [puzzle.placements, found]);

  const leftover = useMemo(
    () => new Set(puzzle.leftover.map((c) => cellKey(c.row, c.col))),
    [puzzle.leftover],
  );

  const tracing = useMemo(
    () => new Set(trace.map((c) => cellKey(c.row, c.col))),
    [trace],
  );

  const stateFor = (row: number, col: number): LetterTileState => {
    const key = cellKey(row, col);
    if (revealing) return leftover.has(key) ? "leftover" : "used";
    if (tracing.has(key) || hinted?.has(key)) return "tracing";
    if (sewn.has(key)) return "sewn";
    return "idle";
  };

  return (
    <GestureDetector gesture={pan}>
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
              // Only the Reveal staggers. During play a tile must respond to
              // the finger immediately; a delay there reads as lag.
              delay={revealing && !reduceMotion ? cellDelay(r, c, puzzle.cols) : 0}
            />
          )),
        )}
      </View>
    </GestureDetector>
  );
}
