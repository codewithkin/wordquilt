import { router } from "expo-router";
import { View } from "react-native";

import { Button, Text } from "@/components/ui";
import { Screen } from "@/components/ui/screen";

/**
 * O4 — Proposition.
 *
 * Names what just happened and makes the promise at the moment it is most
 * credible: seconds after the player felt the mechanic work, and before
 * anything has been asked of them.
 *
 * No back, no dismiss, no pricing, no mention of packs. Nothing is sold during
 * onboarding — you do not sell to someone who has not played yet.
 */
export default function Proposition() {
  return (
    <Screen
      field="full"
      footer={
        <Button label="Make it mine" onPress={() => router.push("/onboarding/5")} />
      }
    >
      <View className="flex-1 justify-center gap-8">
        <Text variant="themeReveal" className="text-left">
          Morning ritual
        </Text>

        <Text variant="bodyOnField" className="text-[19px] leading-[1.5]">
          Every puzzle hides a theme. The letters you don&apos;t use spell it out.
        </Text>

        {/* The promise. It is the entire market position, so it is stated
            plainly and never qualified. */}
        <Text variant="pageTitle" className="text-[28px]">
          No advertising. Ever.
        </Text>
      </View>
    </Screen>
  );
}
