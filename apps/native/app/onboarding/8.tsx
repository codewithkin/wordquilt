import { fieldHeight } from "@wordquilt/tokens";
import { router } from "expo-router";
import { Pressable, View } from "react-native";

import { Button, Card, Text } from "@/components/ui";
import { Screen } from "@/components/ui/screen";
import { useOnboarding } from "@/contexts/onboarding-context";
import { requestPermission, scheduleDailyReminder } from "@/lib/notifications";

/**
 * O8 — Rhythm question, and the notification pre-permission.
 *
 * The value is stated BEFORE the OS dialog fires. The OS permission prompt is
 * one-shot per install: ask at the wrong moment and the answer is no forever,
 * with no way back. So the player sees what the reminder would actually look
 * like, and the promise attached to it, before anything system-level appears.
 *
 * "Not now" advances with no confirmation and no second ask — the product does
 * not badger. The rhythm answer is kept either way, because it orders content,
 * not just reminders.
 */

const TIMES = ["Morning", "Lunch", "Evening", "Before bed"] as const;

export default function Rhythm() {
  const { prefs, setRhythm, setReminders } = useOnboarding();

  const advance = async (wantsReminders: boolean) => {
    setReminders(wantsReminders);

    // The OS prompt fires ONLY here, only on "Yes", and only after the player
    // has seen what the reminder looks like. It is one-shot per install.
    if (wantsReminders) {
      const granted = await requestPermission();
      if (granted && prefs.rhythm) {
        await scheduleDailyReminder(prefs.rhythm);
      }
      // A refusal at the OS level is not an error and gets no second ask. The
      // rhythm answer is kept either way, because it orders content too.
      setReminders(granted);
    }

    router.push("/shelf");
  };

  return (
    <Screen
      field={fieldHeight.compact + 34}
      header={
        <View className="gap-2 pt-6">
          <Text variant="pageTitle">When do you have five quiet minutes?</Text>
        </View>
      }
      footer={
        <View className="gap-3">
          <Button label="Yes, remind me" onPress={() => void advance(true)} />
          <Pressable
            onPress={() => void advance(false)}
            accessibilityRole="button"
            className="h-[44px] items-center justify-center"
          >
            <Text variant="listTitle">Not now</Text>
          </Pressable>
        </View>
      }
    >
      <View className="flex-1 gap-6 pt-6">
        <View className="flex-row flex-wrap gap-[10px]">
          {TIMES.map((time) => {
            const on = prefs.rhythm === time;
            return (
              <Pressable
                key={time}
                onPress={() => setRhythm(time)}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                className={
                  on
                    ? "h-[50px] items-center justify-center rounded-pill border-2 border-accent bg-wash px-5"
                    : "h-[50px] items-center justify-center rounded-pill border-2 border-line bg-tile px-5"
                }
              >
                <Text variant="listTitle">{time}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* What the reminder actually looks like, before any OS dialog. */}
        <Card className="p-5">
          <View className="flex-row items-center gap-3">
            <View className="h-[26px] w-[26px] rounded-sm border-2 border-line bg-sewn" />
            <View className="flex-1 gap-[2px]">
              <Text variant="sectionLabel">WordQuilt · 7:30 am</Text>
              <Text variant="listTitle">Today&apos;s Daily is up whenever you are.</Text>
            </View>
          </View>
        </Card>

        <Text variant="meta">
          One a day, at the time you picked. Never about days you missed.
        </Text>
      </View>
    </Screen>
  );
}
