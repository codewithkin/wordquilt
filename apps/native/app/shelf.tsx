import { fabricSwatches, fieldHeight } from "@wordquilt/tokens";
import { router } from "expo-router";
import { useEffect } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { Card, Chip, Pill, Rule, Text } from "@/components/ui";
import { Screen } from "@/components/ui/screen";
import { useOnboarding } from "@/contexts/onboarding-context";

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
  const colour = SWATCH[prefs.fabric] ?? fabricSwatches.terracotta;

  // Written on arrival, not on leaving O8.
  useEffect(() => {
    finish();
  }, [finish]);

  const packs = [
    { name: prefs.themes[0] ?? "Breakfast", count: "1 of 20 sewn", sewn: 1 },
    { name: prefs.themes[1] ?? "Kitchen Things", count: "20 waiting", sewn: 0 },
    { name: prefs.themes[2] ?? "The Garden", count: "20 waiting", sewn: 0 },
  ];

  const sewn = packs.reduce((n, p) => n + p.sewn, 0);

  return (
    <Screen
      field={fieldHeight.standard}
      header={
        <View className="gap-4">
          <View className="h-[52px] flex-row items-center gap-3">
            <View className="flex-1" />
            <Chip label={`${sewn} ${sewn === 1 ? "square" : "squares"} sewn`} />
          </View>
          <Text variant="pageTitle">Your quilt</Text>
        </View>
      }
      footer={
        <View className="flex-row gap-3">
          <Pill><Text variant="listTitle">Fabric</Text></Pill>
          <Pill><Text variant="listTitle">Store</Text></Pill>
          <Pill><Text variant="listTitle">Settings</Text></Pill>
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
                Wednesday, 12 August
              </Text>
              <Text variant="meta">Unplayed · free, every day</Text>
            </View>
            <Rule />
            <Pressable
              onPress={() => router.push("/onboarding/1")}
              accessibilityRole="button"
              className="h-[56px] items-center justify-center"
            >
              <Text variant="listTitle" className="text-kicker">Play</Text>
            </Pressable>
          </Card>

          <View className="gap-3">
            <Text variant="sectionLabel">Your packs</Text>
            <Card delay={60}>
              {packs.map((pack, i) => (
                <View key={pack.name}>
                  {i > 0 && <Rule />}
                  <View className="flex-row items-center gap-[14px] px-[18px] py-4">
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
                  </View>
                </View>
              ))}
            </Card>
          </View>

          <Pressable className="h-[44px] justify-center" accessibilityRole="button">
            <Text variant="listTitle">All Dailies</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}
