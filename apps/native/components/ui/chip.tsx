import { cn } from "heroui-native";
import { useEffect } from "react";
import { View, type ViewProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { duration, useMotion } from "@/lib/motion";

import { Text } from "./text";

/**
 * A status chip on the terracotta band — pack progress, hint count.
 *
 * Non-interactive, which is why 36px is allowed to sit under the 44px touch
 * floor. If a chip ever becomes tappable it has to grow.
 */
export interface ChipProps extends ViewProps {
  label: string;
  className?: string;
}

export function Chip({ label, className, children, ...props }: ChipProps) {
  return (
    <View
      className={cn("wq-chip-on-field flex-row items-center gap-2", className)}
      {...props}
    >
      {children}
      <Text variant="chip">{label}</Text>
    </View>
  );
}

/**
 * A word slot on the Puzzle screen.
 *
 * Empty slots show LENGTH ONLY — an outline sized to the word, no letters, no
 * count, no first-letter hint. That is the whole game: the slot tells you how
 * long the word is and nothing else. Filling one in is the reward.
 *
 * The empty slot's width is derived the way the design derives it:
 * `length * 13 + 18`. That is a drawn approximation of the found chip's width,
 * not a measurement, so slots stay put when a word locks in rather than
 * re-flowing the row — which matters because the row sits above the grid and
 * the grid must not move.
 *
 * ── Motion: the lock ────────────────────────────────────────────────────────
 * Finding a word is the small reward the whole loop runs on, so the slot
 * filling in is the one moment on this screen allowed a flourish. Both layers
 * are always mounted and cross-fade against each other — that keeps the row
 * height fixed, which an enter/exit swap would not.
 *
 * The found chip stitches down over the outline. Under reduced motion this
 * degrades to a 120ms cross-fade with no scale — stated verbatim in the
 * Accessibility design, not invented here.
 */
export interface WordSlotProps {
  /** The word. Rendered only once found. */
  word: string;
  found?: boolean;
  className?: string;
}

export function WordSlot({ word, found = false, className }: WordSlotProps) {
  const motion = useMotion();
  const width = word.length * 13 + 18;
  const lock = useSharedValue(found ? 1 : 0);

  useEffect(() => {
    lock.value = found ? motion.settle(1) : motion.time(0, duration.reduced);
  }, [found, lock, motion]);

  const emptyStyle = useAnimatedStyle(() => ({ opacity: 1 - lock.value }));

  const foundStyle = useAnimatedStyle(() => ({
    opacity: lock.value,
    // Stitched down onto the outline, not faded in over it.
    transform: [{ scale: motion.reduced ? 1 : 0.86 + lock.value * 0.14 }],
  }));

  return (
    <View style={{ width, height: 36 }}>
      <Animated.View
        accessible={!found}
        accessibilityRole="text"
        accessibilityLabel={`Not yet found, ${word.length} letters`}
        className={cn("wq-word-empty absolute inset-0", className)}
        style={emptyStyle}
        pointerEvents="none"
      />
      <Animated.View
        accessible={found}
        accessibilityRole="text"
        accessibilityLabel={`Found, ${word}`}
        className={cn(
          "wq-word-found absolute inset-0 flex-row items-center justify-center",
          className,
        )}
        style={foundStyle}
        pointerEvents="none"
      >
        <Text variant="wordChip" className="text-field">
          {word}
        </Text>
      </Animated.View>
    </View>
  );
}
