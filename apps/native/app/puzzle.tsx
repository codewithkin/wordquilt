import { generatePuzzle, puzzleSeed } from "@wordquilt/generator";
import { kitchenThings, kitchenTitles } from "@wordquilt/generator/data/kitchen-things";
import { fieldHeight } from "@wordquilt/tokens";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import Animated, { FadeIn, FadeOut, ReduceMotion } from "react-native-reanimated";

import { TraceableBoard, cellKey } from "@/components/traceable-board";
import { Button, Chip, RoundButton, Text, WordSlot } from "@/components/ui";
import { Screen } from "@/components/ui/screen";
import { duration } from "@/lib/motion";
import { puzzleId } from "@/lib/progress";
import { useProgress } from "@/contexts/progress-context";

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
/** Counts are spelled out, never shown as a bare numeral (constraint 8). */
const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five",
  "six", "seven", "eight", "nine", "ten", "eleven", "twelve",
];
const wordLength = (n: number) => `${NUMBER_WORDS[n] ?? n}-letter`;

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
  const [hinted, setHinted] = useState<ReadonlySet<string>>(new Set());
  const { hints, useHint: spendHint, sew } = useProgress();

  useEffect(() => {
    if (found.length === words.length) {
      sew(puzzleId("kitchen-things", 7));
      router.replace("/reveal");
    }
  }, [found.length, words.length, sew]);

  /**
   * S9 — the hint. The ONLY thing allowed to appear during play, and only
   * because the player asked for it.
   *
   * It opens ONE cell of the least-revealed unfound word. It never solves a
   * word, never traces one, and never picks the word the player is closest to —
   * helping where they are already succeeding would be pointless.
   *
   * The count is spelled out in words, not shown as a bare number beside an
   * icon, and the message lands in the reserved band so nothing moves.
   */
  const takeHint = () => {
    const unfound = puzzle.placements.filter((p) => !found.includes(p.word));
    if (unfound.length === 0) return;

    // Least revealed = longest still-unfound word. Nothing about this puzzle is
    // partially revealed yet, so length is the honest proxy for "hardest".
    const target = unfound.reduce((a, b) => (b.path.length > a.path.length ? b : a));
    const cell = target.path.find((c) => !hinted.has(cellKey(c.row, c.col)))
      ?? target.path[0]!;

    if (!spendHint()) return;

    setHinted((h) => new Set(h).add(cellKey(cell.row, cell.col)));
    setHint(`One letter of a ${wordLength(target.path.length)} word.`);
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
              <WordSlot key={word} word={word} found={found.includes(word)} />
            ))}
          </View>
        </View>
      }
      footer={
        <View className="flex-row items-center gap-[14px]">
          <Button label="Hint" size="lg" onPress={takeHint} disabled={hints === 0} />
          <View className="flex-1 gap-[2px]">
            {/* Plain words, never an unexplained icon and never a bare number. */}
            <Text variant="listTitle">
              {hints === 0 ? "More hints tomorrow" : `${hints} free today`}
            </Text>
            <Text variant="meta">Or hold anywhere on the grid</Text>
          </View>
        </View>
      }
    >
      <View className="h-[44px]" />
      <TraceableBoard
        puzzle={puzzle}
        found={found}
        hinted={hinted}
        onFound={(word) => setFound((f) => (f.includes(word) ? f : [...f, word]))}
      />

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
