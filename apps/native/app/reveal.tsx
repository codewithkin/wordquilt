import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import Animated, { FadeIn, ReduceMotion } from "react-native-reanimated";

import { TraceableBoard } from "@/components/traceable-board";
import { Button, Text } from "@/components/ui";
import { Screen } from "@/components/ui/screen";
import { useProgress } from "@/contexts/progress-context";
import { duration, revealHoldMs, revealStaggerMs } from "@/lib/motion";
import { buildDaily, buildPuzzle } from "@/lib/puzzles";

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
  // The same identity the Puzzle screen used. Generation is a pure function of
  // it, so this resolves to exactly the board the player just solved.
  const params = useLocalSearchParams<{ pack?: string; index?: string; daily?: string }>();
  const puzzle = useMemo(
    () =>
      params.daily
        ? buildDaily(params.daily)
        : buildPuzzle(params.pack ?? "kitchen-things", Number(params.index ?? 0)),
    [params.pack, params.index, params.daily],
  );

  const [holdDone, setHoldDone] = useState(false);

  /**
   * The one door to the Wall.
   *
   * The square was already sewn on the Puzzle screen, so by the time this
   * renders, `outOfContent` reflects the puzzle just finished. If it was the
   * last one they could reach, "Sew it in" carries them forward to the Wall
   * instead of back to the Shelf — which is the only way the Wall is ever
   * reached. It is never thrown over a puzzle, never shown on a timer, and it
   * does not interrupt this screen: the hold still runs in full first.
   */
  const { outOfContent } = useProgress();
  const onwards = outOfContent ? "/wall" : "/shelf";

  useEffect(() => {
    if (!puzzle) return;
    // The hold begins once the letters have finished resolving, so the phrase
    // is legible for the full three seconds rather than three minus the stagger.
    const resolveMs = puzzle.leftover.length * revealStaggerMs;
    const t = setTimeout(() => setHoldDone(true), resolveMs + revealHoldMs);
    return () => clearTimeout(t);
  }, [puzzle]);

  if (!puzzle) return null;

  return (
    <Screen
      field="full"
      footer={
        holdDone ? (
          <Animated.View
            entering={FadeIn.duration(duration.enter).reduceMotion(ReduceMotion.System)}
          >
            <Button label="Sew it in" onPress={() => router.replace(onwards)} />
          </Animated.View>
        ) : undefined
      }
    >
      <View className="flex-1 justify-center gap-10">
        <TraceableBoard
          puzzle={puzzle}
          found={puzzle.placements.map((p) => p.word)}
          onFound={() => {}}
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
