import { fabricSwatches, fieldHeight } from "@wordquilt/tokens";
import { router } from "expo-router";
import { View } from "react-native";

import { Button, Card, Rule, Text } from "@/components/ui";
import { Screen } from "@/components/ui/screen";
import { useOnboarding } from "@/contexts/onboarding-context";

/**
 * O7 — Payoff.
 *
 * Their choices, assembled into a real Shelf preview: built from actual state,
 * with the same component the Shelf uses, in the palette they just chose, and
 * with the cold-open square already in place.
 *
 * The free totals stated here are the ones actually delivered — six themes, 120
 * puzzles, and a new Daily every day. Overstating them here would be the first
 * lie the product tells, on the screen whose whole job is to be credible.
 */

const SWATCH: Record<string, string> = {
  linen: fabricSwatches.terracotta,
  slate: fabricSwatches.slate,
  sage: fabricSwatches.sage,
  rose: fabricSwatches.rose,
};

export default function Payoff() {
  const { prefs } = useOnboarding();
  const colour = SWATCH[prefs.fabric] ?? fabricSwatches.terracotta;

  // Their picks lead, so the preview is genuinely theirs. Falls back to the
  // free themes if somehow nothing was chosen.
  const packs = [
    { name: prefs.themes[0] ?? "Breakfast", count: "1 of 20 sewn", sewn: 1 },
    { name: prefs.themes[1] ?? "Kitchen Things", count: "20 waiting", sewn: 0 },
    { name: prefs.themes[2] ?? "The Garden", count: "20 waiting", sewn: 0 },
  ];

  return (
    <Screen
      field={fieldHeight.compact + 34}
      header={
        <View className="gap-2 pt-6">
          <Text variant="pageTitle">Your quilt, then.</Text>
          <Text variant="bodyOnField">
            One square already sewn — the one you just finished.
          </Text>
        </View>
      }
      footer={<Button label="Carry on" onPress={() => router.push("/onboarding/8")} />}
    >
      <View className="flex-1 gap-5 pt-6">
        <Card>
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

        <View className="gap-1">
          <Text variant="listTitle">Six themes. 120 puzzles.</Text>
          <Text variant="meta">
            And a new Daily every day, free for as long as the app exists.
          </Text>
        </View>
      </View>
    </Screen>
  );
}
