import { fieldHeight } from "@wordquilt/tokens";
import { router } from "expo-router";
import { ScrollView, View } from "react-native";

import { Button, Card, ListRow, RoundButton, Rule, Text } from "@/components/ui";
import { Screen } from "@/components/ui/screen";

/**
 * S5 — The Wall. The sole conversion surface.
 *
 * Reached ONLY by finishing all 120 free puzzles, and only by forward
 * navigation. It is never thrown over a puzzle, never shown on a timer, and
 * never interrupts anything — a player arrives here because they ran out of
 * free content, which is the one moment the offer is honest.
 *
 * The free-Daily promise sits ABOVE the offer, deliberately. Someone who has
 * just finished everything needs to know the thing they get for nothing
 * continues before they are asked for money — otherwise the screen reads as the
 * app closing a door.
 *
 * No countdown, no "limited time", no fake scarcity. If an offer has a window,
 * the window is stated in plain words.
 */

const PACKS = [
  { title: "Old Films", sub: "20 puzzles · yours permanently", right: "$2.99" },
  { title: "Trains", sub: "20 puzzles · yours permanently", right: "$2.99" },
  { title: "The Sea", sub: "20 puzzles · yours permanently", right: "$2.99" },
] as const;

export default function Wall() {
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
          <Text variant="pageTitle">That&apos;s all 120.</Text>
        </View>
      }
      footer={<Button label="See the store" onPress={() => router.push("/store")} />}
    >
      <ScrollView showsVerticalScrollIndicator={false} className="pt-8">
        <View className="gap-6 pb-6">
          {/* Above the fold, before anything is asked for. */}
          <Card delay={0} className="p-5">
            <View className="gap-1">
              <Text variant="sectionLabel" className="text-kicker">
                Still free, every day
              </Text>
              <Text variant="listTitle" className="text-[22px]">
                The Daily keeps coming.
              </Text>
              <Text variant="meta">
                A new one every morning, free for as long as the app exists, and every
                past day stays playable.
              </Text>
            </View>
          </Card>

          <View className="gap-3">
            <Text variant="sectionLabel">If you want more</Text>
            <Card delay={80}>
              {PACKS.map((pack, i) => (
                <View key={pack.title}>
                  {i > 0 && <Rule />}
                  <ListRow
                    title={pack.title}
                    sub={pack.sub}
                    right={pack.right}
                    rightStyle="price"
                  />
                </View>
              ))}
            </Card>
          </View>

          <Text variant="meta">
            One-off purchases, yours permanently. No subscription and nothing expires.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
