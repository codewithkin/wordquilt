import { generatePuzzle } from "@wordquilt/generator";
import { morningRitual, morningTitles } from "@wordquilt/generator/data/morning-ritual";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import Animated, { FadeIn, ReduceMotion } from "react-native-reanimated";

import { PuzzleBoard } from "@/components/puzzle-board";
import { Text } from "@/components/ui";
import { Screen } from "@/components/ui/screen";
import { duration, revealHoldMs } from "@/lib/motion";

/**
 * O3 — Reveal. The aha.
 *
 * The sheet drops away, the board inverts — letters that belonged to words
 * recede into the field, and the LEFTOVER letters come forward as cream patches
 * — and they resolve one at a time in reading order to spell the theme.
 *
 * Then a minimum three-second hold with nothing else on screen. Tapping does
 * not skip it: the one place in the entire product where the player is not in
 * control. Letting a control appear over this to hurry them along would undo
 * the single moment everything else exists to produce.
 */

const COLD_OPEN_SEED = 1;

export default function Reveal() {
  const puzzle = useMemo(() => {
    const result = generatePuzzle({
      theme: morningRitual,
      titles: morningTitles,
      spec: { rows: 6, cols: 6, wordCount: 4 },
      seed: COLD_OPEN_SEED,
    });
    if (!result.ok) throw new Error(`reveal failed to generate: ${result.reason}`);
    return result.puzzle;
  }, []);

  const [holdDone, setHoldDone] = useState(false);

  useEffect(() => {
    // The hold starts once the letters have finished resolving, not on mount,
    // so the phrase is legible for the full three seconds rather than for
    // three seconds minus however long the stagger took.
    const resolveMs = puzzle.leftover.length * 40;
    const t = setTimeout(() => setHoldDone(true), resolveMs + revealHoldMs);
    return () => clearTimeout(t);
  }, [puzzle.leftover.length]);

  return (
    <Screen field="full">
      <View className="flex-1 justify-center gap-10">
        <PuzzleBoard puzzle={puzzle} found={puzzle.placements.map((p) => p.word)} revealing />

        {holdDone && (
          <Animated.View
            entering={FadeIn.duration(duration.enter).reduceMotion(ReduceMotion.System)}
            className="gap-8"
          >
            <Text variant="themeReveal">{puzzle.theme}</Text>
          </Animated.View>
        )}
      </View>

      {/* No control exists until the hold ends. */}
      {holdDone && (
        <Animated.View
          entering={FadeIn.duration(duration.enter).delay(200).reduceMotion(ReduceMotion.System)}
          className="pb-2"
        >
          <Text
            variant="bodyOnField"
            className="text-center"
            onPress={() => router.replace("/onboarding/4")}
          >
            Tap to carry on
          </Text>
        </Animated.View>
      )}
    </Screen>
  );
}
