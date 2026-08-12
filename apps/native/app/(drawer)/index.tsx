import { grid } from "@wordquilt/tokens";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import {
  Button,
  Card,
  Chip,
  LetterTile,
  Pill,
  Rule,
  RoundButton,
  Text,
  WordSlot,
} from "@/components/ui";
import { useAppTheme } from "@/contexts/app-theme-context";

/**
 * FOUNDATION PREVIEW — placeholder, not a product screen.
 *
 * This replaced the Better-T-Stack scaffold screen, which referenced undefined
 * variables and heroui's `success`/`danger` colours (which WordQuilt bans).
 *
 * It exists for one reason: to make the token layer VISIBLE. A design system
 * wired to the wrong config renders in the library's stock palette and looks
 * perfectly self-consistent while being completely wrong — the single most
 * expensive mistake available here. Run the app, look at this screen, and
 * confirm the ground is terracotta-and-cream and every surface has a hard
 * offset edge below it rather than a blurred shadow.
 *
 * Delete this once the Shelf is built (plans/02-shelf.md T01).
 */
export default function FoundationPreview() {
  const { currentTheme, toggleTheme } = useAppTheme();

  // Toggled so the lock and press animations can actually be watched, rather
  // than only existing in the source.
  const [locked, setLocked] = useState(false);
  const demoRows = ["KET", "TLE", "SAU"];

  return (
    <View className="flex-1 bg-sheet">
      {/* The terracotta band. Real screens size this per-screen; see
          fieldHeight in @wordquilt/tokens. */}
      <View className="bg-field px-[26px] pt-16 pb-6">
        <View className="flex-row items-center gap-3">
          <RoundButton ground="field" accessibilityLabel="Back" />
          <Text variant="crumb">Foundation</Text>
          <View className="flex-1" />
          <Chip label="preview" />
        </View>
        <View className="h-4" />
        <Text variant="pageTitle">Every primitive, one screen</Text>
        <View className="h-3" />
        <Text variant="bodyOnField">
          If this reads grey or blue, the tokens are not wired.
        </Text>
      </View>

      <ScrollView contentContainerClassName="px-[26px] py-6 gap-6">
        <View className="gap-3">
          <Text variant="sectionLabel">Word slots</Text>
          <View className="bg-field rounded-card p-4 flex-row flex-wrap gap-[9px]">
            <WordSlot word="KETTLE" found />
            <WordSlot word="TEAPOT" found />
            <WordSlot word="SAUCER" found={locked} />
            <WordSlot word="SIEVE" found={locked} />
          </View>
        </View>

        <View className="gap-3">
          <Text variant="sectionLabel">Letter tiles</Text>
          {/* Absolutely positioned, as on the real board — see LetterTile. */}
          <View
            style={{ height: 3 * grid.pitch, width: grid.boxWidth }}
            className="self-center"
          >
            {demoRows.map((chars, row) =>
              [...chars].map((char, col) => (
                <LetterTile
                  key={`${row}-${col}`}
                  char={char}
                  row={row}
                  col={col}
                  state={
                    row === 0 ? "sewn" : row === 1 && locked ? "tracing" : "idle"
                  }
                  delay={(row * 3 + col) * 40}
                />
              )),
            )}
          </View>
        </View>

        <View className="gap-3">
          <Text variant="sectionLabel">Card and rule</Text>
          <Card delay={0}>
            <View className="px-[18px] py-4 gap-1">
              <Text variant="listTitle">Kitchen Things</Text>
              <Text variant="meta">6 of 20 sewn · puzzle 7 waiting</Text>
            </View>
            <Rule />
            <View className="px-[18px] py-4 gap-1">
              <Text variant="listTitle">Breakfast</Text>
              <Text variant="meta">3 of 20 sewn</Text>
            </View>
          </Card>
        </View>

        <View className="gap-3">
          <Text variant="sectionLabel">Actions</Text>
          <Button label="Hint" size="lg" />
          <Button label="Keep going" />
          <Pill>
            <Text variant="listTitle">A quiet pill</Text>
          </Pill>
          <Button
            label={locked ? "Unlock the words" : "Lock the words"}
            onPress={() => setLocked((v) => !v)}
          />
          <Button label={`Theme: ${currentTheme} — tap to swap`} onPress={toggleTheme} />
        </View>
      </ScrollView>
    </View>
  );
}
