import { useMemo } from "react";
import {
  Easing,
  ReduceMotion,
  useReducedMotion,
  withDelay,
  withSpring,
  withTiming,
  type WithSpringConfig,
  type WithTimingConfig,
} from "react-native-reanimated";

/**
 * The motion language. Reanimated only — no animation wrapper library (D-014).
 *
 * ── Where these values come from ────────────────────────────────────────────
 * The design files describe motion mostly by describing its REMOVAL, on the
 * reduced-motion screen (`Accessibility`, X3):
 *
 *   "Tile tilt is removed, so patches sit square. The lock animation becomes an
 *    instant state change with a 120ms cross-fade, the Reveal resolves all
 *    leftover letters in one step, and the sew-in on the Shelf does not animate."
 *
 * Read forwards, that tells us there IS a lock animation when a word is found,
 * the Reveal resolves leftover letters progressively in reading order, and the
 * Shelf sews a square in. The Reveal caption adds the shape of the payoff:
 *
 *   "The three-second hold: the sheet drops away, unused letters resolve in
 *    reading order as cream patches, found words recede into the field."
 *
 * ── The rule that governs all of it ─────────────────────────────────────────
 * Motion in WordQuilt is MATERIAL, not decorative. Things are stitched, pressed
 * and laid down — they do not slide, bounce, or fly in. If an animation would
 * read as "an app being clever", it is wrong for this product: the whole point
 * is five quiet minutes that ask nothing of the player.
 *
 * Nothing animates on the Puzzle screen except in direct response to the
 * player's own finger (constraint 7: zero interruption budget).
 */

/** Durations in ms. */
export const duration = {
  /** Press down / release. Fast enough to feel like contact, not a transition. */
  press: 90,
  /** The reduced-motion substitute for any state change. Stated in the design. */
  reduced: 120,
  /** A tile locking into a found word. */
  lock: 220,
  /** Entry of a card or row. */
  enter: 260,
  /** A square sewing into the quilt on the Shelf. */
  sew: 420,
  /** The sheet dropping away at the start of the Reveal. */
  sheetDrop: 520,
} as const;

/**
 * The minimum time the Reveal holds before any control appears.
 *
 * A designed floor, not a guess — "minimum 3-second clear hold". The reveal is
 * the entire product; letting a button appear over it to hurry the player along
 * would undo the one moment everything else exists to produce.
 */
export const revealHoldMs = 3000;

/**
 * Stagger between leftover letters resolving in reading order on the Reveal.
 *
 * Kept small: across a 9×9 board the leftovers can run to ~20 cells, and at
 * 40ms that is 800ms of resolve inside the 3s hold, leaving the phrase legible
 * for over two seconds before anything else happens.
 */
export const revealStaggerMs = 40;

/**
 * Reanimated configs.
 *
 * `ReduceMotion.System` makes Reanimated itself honour the OS setting — a
 * spring collapses to an instant set rather than being skipped, which is the
 * behaviour the design asks for (degrade, never skip).
 */
export const timing = (ms: number): WithTimingConfig => ({
  duration: ms,
  easing: Easing.out(Easing.quad),
  reduceMotion: ReduceMotion.System,
});

/**
 * The stitch. A short, slightly springy settle for anything being sewn or
 * locked — damping high enough that it settles rather than wobbles.
 */
export const stitch: WithSpringConfig = {
  damping: 18,
  stiffness: 220,
  mass: 0.9,
  reduceMotion: ReduceMotion.System,
};

/**
 * How far a pressable travels when pressed.
 *
 * The press gesture is the control sitting DOWN onto its own offset edge — the
 * same material gesture as the elevation itself. It moves by exactly its own
 * edge depth, so at full press the edge is gone and the control is flat on the
 * page. An opacity fade instead reads as a web button.
 */
export const pressTravel = (edgeDepth: number) => edgeDepth;

/**
 * The delay before a cell animates, so a board resolves in reading order
 * rather than all at once.
 */
export const cellDelay = (row: number, col: number, cols: number, step = revealStaggerMs) =>
  (row * cols + col) * step;

/**
 * Respect the OS reduced-motion setting.
 *
 * Reduced motion is a DESIGNED screen here, not an afterthought — the
 * Accessibility file specifies exactly what each animation degrades to, and the
 * app's own switch only overrides the OS where the OS has an opinion. Every
 * animated component calls this and DEGRADES rather than skipping the state
 * change: a player with reduced motion still needs to see that a word locked in.
 */
export function useMotion() {
  const reduced = useReducedMotion();

  // Memoised on `reduced` alone. Without this the returned object is a new
  // identity every render, so any `useEffect([..., motion])` re-fires on every
  // render and re-triggers its animation — which on the grid means every tile
  // restarts its spring whenever anything above it re-renders.
  return useMemo(
    () => ({
      reduced,

    /** A timing animation, collapsed to the 120ms cross-fade when reduced. */
    time: <T extends number | string>(value: T, ms: number) =>
      withTiming(value as never, timing(reduced ? duration.reduced : ms)),

    /** The stitch spring. Becomes a timing when reduced — a spring is still motion. */
    settle: <T extends number | string>(value: T) =>
      reduced
        ? withTiming(value as never, timing(duration.reduced))
        : withSpring(value as never, stitch),

    /** The stitch spring, staggered. Stagger is removed entirely when reduced. */
    settleAfter: <T extends number | string>(value: T, delayMs: number) =>
      reduced
        ? withTiming(value as never, timing(duration.reduced))
        : withDelay(delayMs, withSpring(value as never, stitch)),

    /** Stagger, removed when reduced — the design says "resolves in one step". */
    stagger: (value: number = revealStaggerMs) => (reduced ? 0 : value),

    /**
     * Tile tilt. Removed under reduced motion — "patches sit square" — even
     * though it is static texture rather than animation, because a dense tilted
     * grid reads as unstable to some players.
     */
      tilt: (degrees: number) => (reduced ? 0 : degrees),
    }),
    [reduced],
  );
}
