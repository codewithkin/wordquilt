import { fieldHeight } from "@wordquilt/tokens";
import { router } from "expo-router";
import { ScrollView, View } from "react-native";

import { Button, Card, ListRow, RoundButton, Rule, Text } from "@/components/ui";
import { Screen } from "@/components/ui/screen";
import { useProgress } from "@/contexts/progress-context";
import { PACKS, PAID_PACKS } from "@/lib/puzzles";

/**
 * S5 — The Wall. The sole conversion surface.
 *
 * Reached ONLY by sewing the last puzzle a player can reach, and only by
 * forward navigation from the Reveal. It is never thrown over a puzzle, never
 * shown on a timer, and never interrupts anything — a player arrives here
 * because they ran out of content, which is the one moment the offer is honest.
 *
 * The free-Daily promise sits ABOVE the offer, deliberately. Someone who has
 * just finished everything needs to know the thing they get for nothing
 * continues before they are asked for money — otherwise the screen reads as the
 * app closing a door.
 *
 * No countdown, no "limited time", no fake scarcity. If an offer has a window,
 * the window is stated in plain words.
 */

export default function Wall() {
  const { owns } = useProgress();

  // Only what they have not got. A player who bought two packs and finished
  // everything should be offered the three that are left, not shown five rows
  // with two of them crossed off.
  const offered = PAID_PACKS.filter((pack) => !owns(pack.id));

  // What they actually finished, not the size of the free library. Someone who
  // bought The Sea and sewed all of it did not do 50 puzzles, and telling them
  // they did would be the app not paying attention.
  const finished = PACKS.filter((pack) => owns(pack.id)).reduce((n, p) => n + p.size, 0);

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
          <Text variant="pageTitle">That&apos;s all {finished}.</Text>
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

          {offered.length > 0 && (
            <View className="gap-3">
              <Text variant="sectionLabel">If you want more</Text>
              <Card delay={80}>
                {offered.map((pack, i) => (
                  <View key={pack.id}>
                    {i > 0 && <Rule />}
                    <ListRow
                      title={pack.name}
                      sub={`${pack.size} puzzles · yours permanently`}
                      right={pack.price}
                      rightStyle="price"
                      onPress={() => router.push("/store")}
                    />
                  </View>
                ))}
              </Card>
            </View>
          )}

          <Text variant="meta">
            One-off purchases, yours permanently. No subscription and nothing expires.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
