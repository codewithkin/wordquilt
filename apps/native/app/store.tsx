import { fieldHeight } from "@wordquilt/tokens";
import { router } from "expo-router";
import { ScrollView, View } from "react-native";

import { Card, Chip, ListRow, RoundButton, Rule, Text } from "@/components/ui";
import { Screen } from "@/components/ui/screen";

/**
 * S6 — Store.
 *
 * Every price is REAL MONEY. No coins, no gems, no currency bundles, no
 * "best value" badges, no countdowns, no fake scarcity (constraint 6). A player
 * can see exactly what a thing costs in their own currency and decide.
 *
 * Restore sits in the HEADER, above and before any purchasable item — reachable
 * by someone who has already paid without making them scroll past things being
 * sold to them first.
 *
 * Hints are listed last and their subtitle says the free ones stay free. The
 * economy deliberately puts its weight on cosmetics rather than relief: selling
 * relief requires the game to be frustrating, which is the exact anxiety this
 * product exists to avoid.
 */

const SECTIONS = [
  {
    label: "Theme packs",
    items: [
      { title: "Old Films", sub: "20 puzzles · one-time purchase", right: "$2.99", buy: true },
      { title: "Trains", sub: "20 puzzles · one-time purchase", right: "$2.99", buy: true },
      { title: "The Garden", sub: "20 puzzles · all 20 sewn", right: "Yours", buy: false },
    ],
  },
  {
    label: "Collections",
    items: [
      { title: "The Long Evening", sub: "Old Films, Books, Trains · 60 puzzles", right: "$6.99", buy: true },
      { title: "Off the Shelf", sub: "Birds, The Sea, Sweets · 60 puzzles", right: "$6.99", buy: true },
    ],
  },
  {
    label: "Hints",
    items: [
      { title: "20 hints", sub: "Never expire. Three a day stay free.", right: "$1.99", buy: true },
      { title: "60 hints", sub: "Never expire. Three a day stay free.", right: "$4.99", buy: true },
    ],
  },
] as const;

export default function Store() {
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
            <View className="flex-1" />
            {/* Above every purchasable item, on purpose. */}
            <Chip label="Restore purchases" />
          </View>
          <Text variant="pageTitle">Store</Text>
        </View>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} className="pt-8">
        <View className="gap-6 pb-8">
          {SECTIONS.map((section, si) => (
            <View key={section.label} className="gap-3">
              <Text variant="sectionLabel">{section.label}</Text>
              <Card delay={si * 60}>
                {section.items.map((item, i) => (
                  <View key={item.title}>
                    {i > 0 && <Rule />}
                    <ListRow
                      title={item.title}
                      sub={item.sub}
                      right={item.right}
                      rightStyle={item.buy ? "price" : "quiet"}
                    />
                  </View>
                ))}
              </Card>
            </View>
          ))}

          {/* The Whole Quilt sits last rather than first. It is the best value
              in the store, but leading with the biggest number would make every
              screen above it feel like a warm-up to a sale. */}
          <View className="gap-3">
            <Text variant="sectionLabel">Everything</Text>
            <Card delay={200}>
              <ListRow
                title="The Whole Quilt"
                sub="All five packs, three fabric sets, and every new pack for a year"
                right="$12.99"
                rightStyle="price"
              />
            </Card>
          </View>

          <Text variant="meta">
            One-off purchases. No subscription, and nothing here expires.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
