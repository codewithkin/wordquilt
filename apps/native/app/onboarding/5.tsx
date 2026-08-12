import { fieldHeight } from "@wordquilt/tokens";
import { router } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

import { Button, Text } from "@/components/ui";
import { Screen } from "@/components/ui/screen";
import { useOnboarding } from "@/contexts/onboarding-context";

/**
 * O5 — Theme picker.
 *
 * Multi-select, minimum one, no maximum, re-editable later in Settings.
 *
 * The framing matters: preference ORDERS the Shelf and decides which free
 * themes unlock first. It never restricts content — nothing a player does not
 * pick is taken away from them. Forward is disabled until one is chosen, which
 * is the only gate in onboarding and exists so the Shelf has something to sort
 * by rather than to extract a commitment.
 */

const THEMES = [
  "Breakfast", "Rain", "Kitchen Things", "The Garden",
  "Cats", "Small Weather", "Old Films", "The Sea",
  "Birds", "Books", "Trains", "Sweets",
] as const;

export default function ThemePicker() {
  const { prefs, toggleTheme } = useOnboarding();
  const count = prefs.themes.length;

  return (
    <Screen
      field={fieldHeight.compact + 34}
      header={
        <View className="gap-3 pt-6">
          <Text variant="pageTitle">What do you like thinking about?</Text>
        </View>
      }
      footer={
        <Button
          label={count === 0 ? "Pick at least one" : `${count} chosen · carry on`}
          disabled={count === 0}
          onPress={() => router.push("/onboarding/6")}
        />
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} className="pt-6">
        <View className="flex-row flex-wrap gap-[10px] pb-6">
          {THEMES.map((name) => {
            const on = prefs.themes.includes(name);
            return (
              <Pressable
                key={name}
                onPress={() => toggleTheme(name)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                className={
                  on
                    ? "h-[50px] items-center justify-center rounded-pill border-2 border-accent bg-wash px-5"
                    : "h-[50px] items-center justify-center rounded-pill border-2 border-line bg-tile px-5"
                }
              >
                <Text variant="listTitle">{name}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}
