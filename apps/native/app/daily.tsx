import { fieldHeight } from "@wordquilt/tokens";
import { router } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

import { Card, RoundButton, Text } from "@/components/ui";
import { Screen } from "@/components/ui/screen";

/**
 * S7 — Daily calendar.
 *
 * A month grid, and it is FORGIVING by design. Catch-up is always free and
 * always available: any past day can be played at any time, for as long as the
 * app exists.
 *
 * Nothing here scolds. There is no streak, no chain, no "you missed 4 days", no
 * red on an unplayed square, and no count of anything lost (constraint 4). An
 * unplayed past day looks exactly like a future one — waiting, not missed.
 */

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export default function DailyCalendar() {
  const today = 12;
  const daysInMonth = 31;
  // Placeholder until the store layer lands.
  const played = new Set([3, 4, 8, 11]);

  return (
    <Screen
      field={fieldHeight.medium}
      header={
        <View className="gap-4">
          <View className="h-[52px] flex-row items-center gap-3">
            <RoundButton ground="field" accessibilityLabel="Back" onPress={() => router.back()}>
              <View className="ml-[-3px] h-[11px] w-[11px] -rotate-45 border-b-[2.5px] border-l-[2.5px] border-field-ink" />
            </RoundButton>
            <Text variant="crumb">Your quilt</Text>
          </View>
          <Text variant="pageTitle">All Dailies</Text>
        </View>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} className="pt-8">
        <View className="gap-4 pb-6">
          <Text variant="sectionLabel">August</Text>
          <Card delay={0} className="p-4">
            <View className="flex-row">
              {DAYS.map((d, i) => (
                <View key={i} className="flex-1 items-center pb-2">
                  <Text variant="sectionLabel">{d}</Text>
                </View>
              ))}
            </View>

            <View className="flex-row flex-wrap">
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const done = played.has(day);
                const future = day > today;
                return (
                  <View key={day} style={{ width: `${100 / 7}%` }} className="items-center py-1">
                    <Pressable
                      disabled={future}
                      onPress={() => router.push("/puzzle")}
                      accessibilityRole="button"
                      accessibilityLabel={
                        `August ${day}` +
                        (done ? ", sewn" : future ? ", not yet" : ", free to play")
                      }
                      className={
                        done
                          ? "h-[38px] w-[38px] items-center justify-center rounded-sm border-2 border-line bg-sewn"
                          : "h-[38px] w-[38px] items-center justify-center rounded-sm border-2 border-empty"
                      }
                      // A future day is simply quieter. It is not disabled-looking,
                      // because there is nothing wrong with it not having happened.
                      style={{ opacity: future ? 0.4 : 1 }}
                    >
                      <Text variant="meta" className={done ? "text-ink" : "text-muted"}>
                        {day}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </Card>

          <Text variant="meta">
            Every past day is still there, and always free. Play them whenever you like.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
