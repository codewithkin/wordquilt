import { fabricSwatches, fieldHeight } from "@wordquilt/tokens";
import { router } from "expo-router";
import { useEffect } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { Card, Chip, Pill, Rule, Text } from "@/components/ui";
import { Screen } from "@/components/ui/screen";
import { useOnboarding } from "@/contexts/onboarding-context";
import { useProgress } from "@/contexts/progress-context";
import { today } from "@/lib/progress";
import { PACKS } from "@/lib/puzzles";

/**
 * O9 / S1 — The Shelf. Home.
 *
 * Onboarding does not end with a modal or a "you're all set" screen. It ends
 * HERE, on the live Shelf, with one square already sewn and today's Daily
 * waiting — a surface the player has already started rather than an empty one
 * they have to begin.
 *
 * The completion flag is written on ARRIVAL, so a crash anywhere earlier
 * resumes onboarding rather than dropping someone into an app they were never
 * introduced to.
 *
 * ── What is deliberately absent ─────────────────────────────────────────────
 * No streak. No countdown. No red dot. No "you missed a day". Counts accumulate
 * and nothing counts down. A locked pack reads as unstitched, not badged — no
 * price sticker and no timer (constraints 3, 4, 6).
 */

const SWATCH: Record<string, string> = {
  linen: fabricSwatches.terracotta,
  slate: fabricSwatches.slate,
  sage: fabricSwatches.sage,
  rose: fabricSwatches.rose,
};

export default function Shelf() {
  const { prefs, finish } = useOnboarding();
  const { squares, sewnInPack, owns, progress } = useProgress();
  const colour = SWATCH[prefs.fabric] ?? fabricSwatches.terracotta;

  // Written on arrival, not on leaving O8.
  useEffect(() => {
    finish();
  }, [finish]);

  const packs = PACKS.map((pack) => {
    const done = sewnInPack(pack.id);
    return {
      id: pack.id,
      name: pack.name,
      sewn: done,
      owned: owns(pack.id),
      // Counts accumulate; nothing counts down. "none sewn yet" rather than
      // "20 remaining" — the same number said without a deficit. A locked pack
      // gets exactly the same line as an unstarted owned one: it reads as
      // unstitched, not badged. No price sticker, no red dot, no timer.
      count: done === 0 ? `${pack.size} puzzles, none sewn yet` : `${done} of ${pack.size} sewn`,
    };
  });

  const todayIso = today();
  const dailyDone = progress.dailies.includes(todayIso);

  return (
    <Screen
      field={fieldHeight.standard}
      header={
        <View className="gap-4">
          <View className="h-[52px] flex-row items-center gap-3">
            <View className="flex-1" />
            <Chip label={`${squares} ${squares === 1 ? "square" : "squares"} sewn`} />
          </View>
          <Text variant="pageTitle">Your quilt</Text>
        </View>
      }
      footer={
        <View className="flex-row gap-3">
          {([
            ["Fabric", "/fabric"],
            ["Store", "/store"],
            ["Settings", "/settings"],
          ] as const).map(([label, href]) => (
            <Pressable key={label} className="flex-1" onPress={() => router.push(href)}>
              <Pill>
                <Text variant="listTitle">{label}</Text>
              </Pill>
            </Pressable>
          ))}
        </View>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} className="pt-8">
        <View className="gap-6 pb-6">
          {/* The Daily. Free forever, never gated, playable retroactively. */}
          <Card delay={0}>
            <View className="gap-1 p-5">
              <Text variant="sectionLabel" className="text-kicker">
                Today&apos;s Daily
              </Text>
              <Text variant="listTitle" className="text-[22px]">
                {new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </Text>
              <Text variant="meta">
                {dailyDone ? "Sewn · free, every day" : "Unplayed · free, every day"}
              </Text>
            </View>
            <Rule />
            <Pressable
              onPress={() =>
                router.push({ pathname: "/puzzle", params: { daily: todayIso } })
              }
              accessibilityRole="button"
              className="h-[56px] items-center justify-center"
            >
              <Text variant="listTitle" className="text-kicker">
                {dailyDone ? "Play again" : "Play"}
              </Text>
            </Pressable>
          </Card>

          <View className="gap-3">
            <Text variant="sectionLabel">Your packs</Text>
            <Card delay={60}>
              {packs.map((pack, i) => (
                <View key={pack.name}>
                  {i > 0 && <Rule />}
                  <Pressable
                    // A locked pack goes to the Store, not the Wall. The Wall is
                    // reached only by running out of content, never by tapping
                    // something that happens to be behind it.
                    onPress={() =>
                      router.push(pack.owned ? `/pack/${pack.id}` : "/store")
                    }
                    accessibilityRole="button"
                    accessibilityLabel={
                      pack.owned
                        ? `${pack.name}, ${pack.count}`
                        : `${pack.name}, ${pack.count}, not yours yet`
                    }
                    className="flex-row items-center gap-[14px] px-[18px] py-4"
                  >
                    <View className="flex-row flex-wrap gap-[2px]" style={{ width: 40 }}>
                      {Array.from({ length: 9 }).map((_, p) => (
                        <View
                          key={p}
                          className="h-[11px] w-[11px] rounded-sm border-2"
                          style={{
                            backgroundColor: p < pack.sewn ? colour : "transparent",
                            borderColor: p < pack.sewn ? colour : "rgba(36,31,25,0.34)",
                          }}
                        />
                      ))}
                    </View>
                    <View className="flex-1 gap-[2px]">
                      <Text variant="listTitle">{pack.name}</Text>
                      <Text variant="meta">{pack.count}</Text>
                    </View>
                  </Pressable>
                </View>
              ))}
            </Card>
          </View>

          <Pressable
            className="h-[44px] justify-center"
            accessibilityRole="button"
            onPress={() => router.push("/daily")}
          >
            <Text variant="listTitle">All Dailies</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}
