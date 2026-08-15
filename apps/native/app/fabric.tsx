import { fabricSwatches, fieldHeight } from "@wordquilt/tokens";
import { router } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

import { Card, ListRow, RoundButton, Rule, Text } from "@/components/ui";
import { Screen } from "@/components/ui/screen";
import { useOnboarding } from "@/contexts/onboarding-context";

/**
 * S8 — Fabric.
 *
 * Cosmetic only, and the screen SAYS so rather than leaving a player to wonder
 * whether a nicer fabric plays better. Nothing here touches gameplay, now or
 * ever.
 *
 * The four onboarding palettes stay free permanently. Paid sets route to the
 * Store rather than being bought inline, and they remain purchasable after
 * their season — no "gone forever", no seasonal pressure, no countdown.
 *
 * This is the repeat-purchase surface the economy leans on, deliberately in
 * place of hints: selling relief requires the game to be frustrating, and
 * selling a nicer quilt does not.
 */

const FREE = [
  { id: "linen", name: "Linen", swatch: fabricSwatches.terracotta },
  { id: "indigo", name: "Indigo", swatch: fabricSwatches.slate },
  { id: "moss", name: "Moss", swatch: fabricSwatches.sage },
  { id: "dusk", name: "Dusk", swatch: fabricSwatches.rose },
] as const;

const SETS = [
  { title: "Winter Weight", sub: "Three patterns, two borders", right: "$1.99" },
  { title: "Sun-Bleached", sub: "Three patterns, two borders", right: "$1.99" },
] as const;

export default function Fabric() {
  const { prefs, setFabric } = useOnboarding();

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
          <Text variant="pageTitle">Fabric</Text>
        </View>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} className="pt-8">
        <View className="gap-6 pb-8">
          {/* Said out loud, so nobody wonders whether this affects the game. */}
          <Text variant="meta">
            Fabric changes how your quilt looks and nothing else. It never changes a
            puzzle.
          </Text>

          <View className="gap-3">
            <Text variant="sectionLabel">Yours, free, always</Text>
            <View className="flex-row justify-between">
              {FREE.map((fabric, i) => {
                const on = fabric.id === prefs.fabric;
                return (
                  <Pressable
                    key={fabric.id}
                    onPress={() => setFabric(fabric.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={fabric.name}
                    className="items-center gap-2"
                  >
                    <View
                      className={
                        on
                          ? "h-[68px] w-[68px] rounded-tile border-2 border-accent shadow-tile"
                          : "h-[68px] w-[68px] rounded-tile border-2 border-line shadow-tile"
                      }
                      style={{
                        backgroundColor: fabric.swatch,
                        transform: [{ rotate: `${((i % 3) - 1) * 2}deg` }],
                      }}
                    />
                    <Text variant="meta" className="text-ink">
                      {fabric.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text variant="meta">Changes apply everywhere, straight away.</Text>
          </View>

          <View className="gap-3">
            <Text variant="sectionLabel">Sets</Text>
            <Card delay={80}>
              {SETS.map((set, i) => (
                <View key={set.title}>
                  {i > 0 && <Rule />}
                  {/* Routes to the Store rather than buying inline — one place
                      where money is spent, and it is never mid-browse. */}
                  <ListRow
                    title={set.title}
                    sub={set.sub}
                    right={set.right}
                    rightStyle="price"
                    onPress={() => router.push("/store")}
                  />
                </View>
              ))}
            </Card>
            <Text variant="meta">
              Sets stay available after their season. Nothing here disappears.
            </Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
