import { fieldHeight } from "@wordquilt/tokens";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { Card, Chip, ListRow, RoundButton, Rule, Text } from "@/components/ui";
import { Screen } from "@/components/ui/screen";
import { useProgress } from "@/contexts/progress-context";
import { PAID_PACKS, findPack } from "@/lib/puzzles";
import { productId, purchase, restore } from "@/lib/purchases";

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
 *
 * Every row here is a real pack from the library, priced once. What a player
 * already owns says "Yours" in muted text and cannot be bought twice — the two
 * right-hand treatments must never look alike, or someone cannot tell at a
 * glance what would cost money.
 */

/**
 * The two collections, named by the packs they contain. Every pack in one is
 * also sold on its own, so a collection is a discount on things that exist
 * rather than a bundle invented to be bought.
 */
const COLLECTIONS = [
  { title: "The Long Evening", packs: ["books", "trains", "the-garden"], price: "$6.99" },
  { title: "Off the Shelf", packs: ["birds", "the-sea"], price: "$4.99" },
] as const;

const WHOLE_QUILT = "$12.99";

export default function Store() {
  const { owns, sewnInPack, buy } = useProgress();
  const [note, setNote] = useState<string | null>(null);

  /**
   * Entitlements are recorded from what the store actually granted, never from
   * what the tap hoped would happen. With no provider wired up yet a release
   * build simply says so — see `lib/purchases.ts` for why it refuses rather
   * than quietly handing out paid packs.
   */
  const take = async (ids: string[], packIds: string[]) => {
    setNote(null);
    const result = await purchase(ids);
    if (!result.ok) {
      setNote("The store is not available right now. Nothing has been charged.");
      return;
    }
    for (const id of packIds) buy(id);
  };

  const packItems = PAID_PACKS.map((pack) => {
    const owned = owns(pack.id);
    const sewn = sewnInPack(pack.id);
    return {
      key: pack.id,
      title: pack.name,
      // What a player owns is described by what they have done with it. What
      // they do not own is described by what it is and what it costs.
      sub: owned
        ? sewn === 0
          ? `${pack.size} puzzles, none sewn yet`
          : `${sewn} of ${pack.size} sewn`
        : `${pack.size} puzzles · one-time purchase`,
      right: owned ? "Yours" : (pack.price ?? ""),
      buy: !owned,
      onPress: owned
        ? () => router.push(`/pack/${pack.id}`)
        : () => void take([productId.pack(pack.id)], [pack.id]),
    };
  });

  const collectionItems = COLLECTIONS.map((collection) => {
    const packs = collection.packs
      .map((id) => findPack(id))
      .filter((p): p is NonNullable<typeof p> => p !== undefined);
    const owned = packs.every((p) => owns(p.id));
    const slug = collection.title.toLowerCase().replace(/[^a-z]+/g, "");
    return {
      key: collection.title,
      title: collection.title,
      sub: `${packs.map((p) => p.name).join(", ")} · ${packs.reduce((n, p) => n + p.size, 0)} puzzles`,
      right: owned ? "Yours" : collection.price,
      buy: !owned,
      onPress: owned
        ? undefined
        : () => void take([productId.collection(slug)], packs.map((p) => p.id)),
    };
  });

  const hintItems = [20, 60].map((n) => ({
    key: `hints-${n}`,
    title: `${n} hints`,
    sub: "Never expire. Three a day stay free.",
    right: n === 20 ? "$1.99" : "$4.99",
    buy: true,
    onPress: () => void take([productId.hints(n)], []),
  }));

  const sections = [
    { label: "Theme packs", items: packItems },
    { label: "Collections", items: collectionItems },
    { label: "Hints", items: hintItems },
  ];

  const ownsEverything = PAID_PACKS.every((p) => owns(p.id));

  const onRestore = async () => {
    setNote(null);
    const result = await restore();
    setNote(
      result.ok
        ? "Everything you have bought is back."
        : "Nothing to restore right now. Nothing has been charged.",
    );
  };

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
            <Pressable onPress={() => void onRestore()} accessibilityRole="button">
              <Chip label="Restore purchases" />
            </Pressable>
          </View>
          <Text variant="pageTitle">Store</Text>
        </View>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} className="pt-8">
        <View className="gap-6 pb-8">
          {sections.map((section, si) => (
            <View key={section.label} className="gap-3">
              <Text variant="sectionLabel">{section.label}</Text>
              <Card delay={si * 60}>
                {section.items.map((item, i) => (
                  <View key={item.key}>
                    {i > 0 && <Rule />}
                    <ListRow
                      title={item.title}
                      sub={item.sub}
                      right={item.right}
                      rightStyle={item.buy ? "price" : "quiet"}
                      onPress={item.onPress}
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
                sub={`All ${PAID_PACKS.length} packs, three fabric sets, and every new pack for a year`}
                right={ownsEverything ? "Yours" : WHOLE_QUILT}
                rightStyle={ownsEverything ? "quiet" : "price"}
                onPress={
                  ownsEverything
                    ? undefined
                    : () =>
                        void take(
                          [productId.collection("wholequilt")],
                          PAID_PACKS.map((p) => p.id),
                        )
                }
              />
            </Card>
          </View>

          {note ? <Text variant="meta">{note}</Text> : null}

          <Text variant="meta">
            One-off purchases. No subscription, and nothing here expires.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
