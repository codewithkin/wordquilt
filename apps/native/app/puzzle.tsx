import { generatePuzzle, puzzleSeed } from "@wordquilt/generator";
import { kitchenThings, kitchenTitles } from "@wordquilt/generator/data/kitchen-things";
import { fieldHeight } from "@wordquilt/tokens";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import Animated, { FadeIn, FadeOut, ReduceMotion } from "react-native-reanimated";

import { PuzzleBoard } from "@/components/puzzle-board";
import { Button, Chip, RoundButton, Text, WordSlot } from "@/components/ui";
import { Screen } from "@/components/ui/screen";
import { duration } from "@/lib/motion";

/**
 * S2 — Puzzle. The core loop.
 *
 * ── Zero interruption budget ────────────────────────────────────────────────
 * Nothing may appear over the grid during play. No modals, no toasts, no rating
 * prompts, no purchase prompts, no ads — constraint 7, and it is absolute. The
 * band under the grid is RESERVED and holds its height whether or not anything
 * is in it, so hint feedback never shifts the board.
 *
 * The oblique title guides the search without naming the theme. A fully secret
 * theme was rejected in design: with no hint, players pattern-scan for any word
 * and the theme becomes a post-hoc credit sequence rather than part of solving.
 *
 * Hints are generous — three free daily, refilling — and labelled in plain words
 * rather than an unexplained icon. The puzzle is always completable with zero
 * hints (constraint 3); nothing here is ever gated on a resource.
 */
export default function PuzzleScreen() {
  const puzzle = useMemo(() => {
    const result = generatePuzzle({
      theme: kitchenThings,
      titles: kitchenTitles,
      spec: { rows: 7, cols: 7, wordCount: 7 },
      seed: puzzleSeed("kitchen-things", 7),
    });
    if (!result.ok) throw new Error(`puzzle failed to generate: ${result.reason}`);
    return result.puzzle;
  }, []);

  const words = puzzle.placements.map((p) => p.word);
  const [found, setFound] = useState<string[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [hintsLeft, setHintsLeft] = useState(3);

  useEffect(() => {
    if (found.length === words.length) router.replace("/reveal");
  }, [found.length, words.length]);

  const useHint = () => {
    const next = words.find((w) => !found.includes(w));
    if (!next || hintsLeft === 0) return;
    setHintsLeft((n) => n - 1);
    setHint(`${next[0]} … ${next.length} letters`);
  };

  return (
    <Screen
      field={fieldHeight.standard}
      header={
        <View className="gap-4">
          <View className="h-[52px] flex-row items-center gap-3">
            <RoundButton ground="field" accessibilityLabel="Back" onPress={() => router.back()}>
              <View className="ml-[-3px] h-[11px] w-[11px] -rotate-45 border-b-[2.5px] border-l-[2.5px] border-field-ink" />
            </RoundButton>
            <Text variant="crumb">Kitchen Things</Text>
            <View className="flex-1" />
            <Chip label={`${found.length} of ${words.length}`} />
          </View>

          <Text variant="oblique">{puzzle.obliqueTitle}</Text>

          <View className="flex-row flex-wrap justify-center gap-[9px]">
            {words.map((word) => (
              <Pressable key={word} onPress={() => setFound((f) => f.includes(word) ? f : [...f, word])}>
                <WordSlot word={word} found={found.includes(word)} />
              </Pressable>
            ))}
          </View>
        </View>
      }
      footer={
        <View className="flex-row items-center gap-[14px]">
          <Button label="Hint" size="lg" onPress={useHint} disabled={hintsLeft === 0} />
          <View className="flex-1 gap-[2px]">
            {/* Plain words, never an unexplained icon and never a bare number. */}
            <Text variant="listTitle">
              {hintsLeft === 0 ? "No hints left today" : `${hintsLeft} free today`}
            </Text>
            <Text variant="meta">Or hold anywhere on the grid</Text>
          </View>
        </View>
      }
    >
      <View className="h-[44px]" />
      <PuzzleBoard puzzle={puzzle} found={found} />

      {/* The reserved band. Never collapses. */}
      <View className="h-[32px] justify-center">
        {hint && (
          <Animated.View
            entering={FadeIn.duration(duration.enter).reduceMotion(ReduceMotion.System)}
            exiting={FadeOut.duration(duration.reduced).reduceMotion(ReduceMotion.System)}
          >
            <Text variant="hintBand" className="text-kicker">{hint}</Text>
          </Animated.View>
        )}
      </View>
      <View className="flex-1" />
    </Screen>
  );
}
