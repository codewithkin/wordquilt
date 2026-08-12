import { grid, tileTilt } from "@wordquilt/tokens";
import { cn } from "heroui-native";
import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { useMotion } from "@/lib/motion";

import { Text } from "./text";

/**
 * A single letter tile on the puzzle grid — the signature element of the app.
 *
 * ── Positioning ─────────────────────────────────────────────────────────────
 * Tiles are ABSOLUTELY positioned, not laid out with flex + gap. Each carries a
 * small rotation (±1.4°) so the board reads as hand-sewn, and rotated tiles in
 * a flex row clip each other's corners at the gaps. The design places them at
 * `left = col * pitch + pad`, `top = row * pitch`, and so do we.
 *
 * The tilt is deterministic from the cell's position (D-009) — the same board
 * always looks the same. A board that re-tilts on render reads as a rendering
 * fault, not as texture. Under reduced motion the tilt is removed entirely and
 * patches sit square, which the Accessibility design specifies by name.
 *
 * ── States ──────────────────────────────────────────────────────────────────
 * On the Puzzle screen:
 *   idle     tile ground, ink letter, lifts
 *   tracing  accent ground, on-accent letter, lifts — the live drag
 *   sewn     sewn ground, ink letter, lifts — part of a found word
 *
 * On the Reveal screen the board inverts: letters that belonged to a word
 * recede into the field, and the LEFTOVER letters — the ones that spell the
 * theme — come forward as cream patches. That inversion is the payoff of the
 * entire product, so `leftover` and `used` are first-class states here rather
 * than something the Reveal screen improvises.
 *
 * ── Motion ──────────────────────────────────────────────────────────────────
 * A tile locking into a found word settles with the stitch spring — it is being
 * sewn down, not fading. `delay` lets the Reveal resolve leftover letters in
 * reading order; pass `cellDelay(row, col, cols)` from lib/motion.
 *
 * Nothing here animates except in response to the player's own finger or to the
 * Reveal sequence. The Puzzle screen has a zero interruption budget.
 */

export type LetterTileState = "idle" | "tracing" | "sewn" | "leftover" | "used";

const TILE: Record<LetterTileState, string> = {
  idle: "bg-tile border-2 border-line shadow-tile",
  tracing: "bg-accent border-2 border-line shadow-tile",
  sewn: "bg-sewn border-2 border-line shadow-tile",
  // Reveal: an unused letter, now a cream patch on the terracotta field.
  leftover: "bg-field-ink border-2 border-field-edge shadow-tile-on-field",
  // Reveal: a letter that was part of a found word. No ground, no lift — it
  // recedes rather than disappearing, so the shape of the solved board reads.
  used: "",
};

const LETTER: Record<LetterTileState, string> = {
  idle: "text-ink",
  tracing: "text-on-accent",
  sewn: "text-ink",
  leftover: "text-field",
  used: "text-field-ink",
};

/** A tracing tile lifts very slightly under the finger. */
const SCALE: Record<LetterTileState, number> = {
  idle: 1,
  tracing: 1.06,
  sewn: 1,
  leftover: 1,
  used: 1,
};

const OPACITY: Record<LetterTileState, number> = {
  idle: 1,
  tracing: 1,
  sewn: 1,
  leftover: 1,
  used: 0.38,
};

export interface LetterTileProps {
  char: string;
  row: number;
  col: number;
  state?: LetterTileState;
  /** Stagger, for the Reveal's reading-order resolve. */
  delay?: number;
  className?: string;
}

export function LetterTile({
  char,
  row,
  col,
  state = "idle",
  delay = 0,
  className,
}: LetterTileProps) {
  const motion = useMotion();
  const tilt = motion.tilt(tileTilt(row, col));

  const scale = useSharedValue(SCALE[state]);
  const opacity = useSharedValue(OPACITY[state]);

  useEffect(() => {
    // The stitch spring: a tile being sewn down settles, it does not wobble.
    scale.value = motion.settleAfter(SCALE[state], delay);
    opacity.value = motion.settleAfter(OPACITY[state], delay);
  }, [state, delay, scale, opacity, motion]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${tilt}deg` }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      accessibilityRole="text"
      accessibilityLabel={`${char}, row ${row + 1}, column ${col + 1}`}
      className={cn(
        "absolute items-center justify-center rounded-tile",
        TILE[state],
        className,
      )}
      style={[
        {
          left: col * grid.pitch + grid.pad,
          top: row * grid.pitch,
          width: grid.cell,
          height: grid.cell,
        },
        style,
      ]}
    >
      <Text variant="letter" className={LETTER[state]}>
        {char}
      </Text>
    </Animated.View>
  );
}
