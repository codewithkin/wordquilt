import { fabricSwatches, fieldHeight } from "@wordquilt/tokens";
import { router } from "expo-router";
import { Pressable, View } from "react-native";

import { Button, Card, Text } from "@/components/ui";
import { Screen } from "@/components/ui/screen";
import { useOnboarding } from "@/contexts/onboarding-context";

/**
 * O6 — Fabric picker.
 *
 * Single-select with one always chosen, defaulting to Linen. This is a
 * functional preview of the Fabric store WITHOUT referencing it: no paid fabric
 * is shown or teased, and no price appears anywhere in onboarding.
 *
 * It exists to make the app feel owned before the first real play. Fabric has
 * zero gameplay effect, now and forever.
 */

const FABRICS = [
  { id: "linen", name: "Linen", swatch: fabricSwatches.terracotta },
  { id: "slate", name: "Slate", swatch: fabricSwatches.slate },
  { id: "sage", name: "Sage", swatch: fabricSwatches.sage },
  { id: "rose", name: "Rose", swatch: fabricSwatches.rose },
] as const;

export default function FabricPicker() {
  const { prefs, setFabric } = useOnboarding();
  const chosen = FABRICS.find((f) => f.id === prefs.fabric) ?? FABRICS[0];

  return (
    <Screen
      field={fieldHeight.compact + 34}
      header={
        <View className="gap-2 pt-6">
          <Text variant="pageTitle">Pick your fabric.</Text>
          <Text variant="bodyOnField">All four are free, and stay free.</Text>
        </View>
      }
      footer={<Button label={`Use ${chosen.name}`} onPress={() => router.push("/onboarding/7")} />}
    >
      <View className="flex-1 gap-6 pt-6">
        <View className="flex-row justify-between">
          {FABRICS.map((fabric, i) => {
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
                    // The same hand-sewn tilt the quilt patches use, so the
                    // swatches read as fabric rather than as colour chips.
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

        {/* A live preview, so the choice is felt rather than described. */}
        <Card className="p-5">
          <View className="gap-1">
            <Text variant="listTitle">{chosen.name}</Text>
            <Text variant="meta">
              Every square you sew will be this colour. Change it whenever you like.
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-[3px] pt-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <View
                key={i}
                className="h-[18px] w-[18px] rounded-sm border-2 border-line"
                style={{
                  backgroundColor: chosen.swatch,
                  opacity: i % 3 === 0 ? 0.75 : 1,
                  transform: [{ rotate: `${((i % 3) - 1) * 2}deg` }],
                }}
              />
            ))}
          </View>
        </Card>
      </View>
    </Screen>
  );
}
