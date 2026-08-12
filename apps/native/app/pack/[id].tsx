import { fieldHeight } from "@wordquilt/tokens";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

import { Card, Chip, Rule, RoundButton, Text } from "@/components/ui";
import { Screen } from "@/components/ui/screen";

/**
 * S4 — Pack view.
 *
 * Puzzles within a theme, playable in ANY order. Nothing here is locked behind
 * finishing the one before it — a player who bounces off puzzle 7 can go
 * straight to 8 rather than being stuck.
 *
 * Sewn puzzles show as filled squares; unplayed ones as empty outlines. No
 * scores, no times, no stars: the only thing recorded is whether it is sewn.
 */
export default function PackView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const name = typeof id === "string" ? decodeURIComponent(id) : "Pack";

  // Placeholder progress until the store layer lands.
  const total = 20;
  const sewn = 1;

  return (
    <Screen
      field={fieldHeight.standard}
      header={
        <View className="gap-4">
          <View className="h-[52px] flex-row items-center gap-3">
            <RoundButton ground="field" accessibilityLabel="Back" onPress={() => router.back()}>
              <View className="ml-[-3px] h-[11px] w-[11px] -rotate-45 border-b-[2.5px] border-l-[2.5px] border-field-ink" />
            </RoundButton>
            <Text variant="crumb">Your quilt</Text>
            <View className="flex-1" />
            <Chip label={`${sewn} of ${total}`} />
          </View>
          <Text variant="pageTitle">{name}</Text>
        </View>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} className="pt-8">
        <View className="gap-3 pb-6">
          <Text variant="sectionLabel">Any order you like</Text>
          <Card delay={0} className="p-4">
            <View className="flex-row flex-wrap gap-[10px]">
              {Array.from({ length: total }).map((_, i) => {
                const done = i < sewn;
                return (
                  <Pressable
                    key={i}
                    onPress={() => router.push("/puzzle")}
                    accessibilityRole="button"
                    accessibilityLabel={`Puzzle ${i + 1}, ${done ? "sewn" : "not yet played"}`}
                    className={
                      done
                        ? "h-[56px] w-[56px] items-center justify-center rounded-tile border-2 border-line bg-sewn shadow-tile"
                        : "h-[56px] w-[56px] items-center justify-center rounded-tile border-2 border-line bg-tile shadow-tile"
                    }
                    style={{ transform: [{ rotate: `${(((i % 5) - 2) * 0.7)}deg` }] }}
                  >
                    <Text variant="listTitle">{i + 1}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}
