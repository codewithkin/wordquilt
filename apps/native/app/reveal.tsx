import { generatePuzzle, puzzleSeed } from "@wordquilt/generator";
import { kitchenThings, kitchenTitles } from "@wordquilt/generator/data/kitchen-things";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import Animated, { FadeIn, ReduceMotion } from "react-native-reanimated";

import { PuzzleBoard } from "@/components/puzzle-board";
import { Button, Text } from "@/components/ui";
import { Screen } from "@/components/ui/screen";
import { duration, revealHoldMs, revealStaggerMs } from "@/lib/motion";

/**
 * S3 — Reveal. The payoff, and the entire point of the product.
 *
 * The sheet drops away, found words recede into the field, and the leftover
 * letters resolve in reading order as cream patches spelling the theme. Then a
 * minimum three-second hold with nothing else on screen.
 *
 * No control exists until the hold ends. Everything else in WordQuilt is
 * scaffolding around this moment, so nothing is allowed to hurry it — not a
 * button, not a rating prompt, not a "next puzzle" nudge.
 *
 * After the hold, the square sews into the quilt and the player goes back to
 * the Shelf with one more square than they had.
 */
export default function RevealScreen() {
  const puzzle = useMemo(() => {
    const result = generatePuzzle({
      theme: kitchenThings,
      titles: kitchenTitles,
      spec: { rows: 7, cols: 7, wordCount: 7 },
      seed: puzzleSeed("kitchen-things", 7),
    });
    if (!result.ok) throw new Error(`reveal failed to generate: ${result.reason}`);
    return result.puzzle;
  }, []);

  const [holdDone, setHoldDone] = useState(false);

  useEffect(() => {
    // The hold begins once the letters have finished resolving, so the phrase
    // is legible for the full three seconds rather than three minus the stagger.
    const resolveMs = puzzle.leftover.length * revealStaggerMs;
    const t = setTimeout(() => setHoldDone(true), resolveMs + revealHoldMs);
    return () => clearTimeout(t);
  }, [puzzle.leftover.length]);

  return (
    <Screen
      field="full"
      footer={
        holdDone ? (
          <Animated.View
            entering={FadeIn.duration(duration.enter).reduceMotion(ReduceMotion.System)}
          >
            <Button label="Sew it in" onPress={() => router.replace("/shelf")} />
          </Animated.View>
        ) : undefined
      }
    >
      <View className="flex-1 justify-center gap-10">
        <PuzzleBoard
          puzzle={puzzle}
          found={puzzle.placements.map((p) => p.word)}
          revealing
        />

        {holdDone && (
          <Animated.View
            entering={FadeIn.duration(duration.enter).reduceMotion(ReduceMotion.System)}
          >
            <Text variant="themeReveal">{puzzle.theme}</Text>
          </Animated.View>
        )}
      </View>
    </Screen>
  );
}
