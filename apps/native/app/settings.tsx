import { fieldHeight } from "@wordquilt/tokens";
import * as Application from "expo-application";
import { router } from "expo-router";
import { Platform, ScrollView, View } from "react-native";
import * as MailComposer from "expo-mail-composer";

import { Card, ListRow, RoundButton, Rule, Text } from "@/components/ui";
import { Screen } from "@/components/ui/screen";
import { useOnboarding } from "@/contexts/onboarding-context";

/**
 * S10 — Settings.
 *
 * No account section. No sign-in. No newsletter. No "rate us". There is nothing
 * to log into and nothing is being collected, so there is nothing to put there.
 *
 * ── The reinstall line ──────────────────────────────────────────────────────
 * Progress lives only on the device and is not backed up in this version. That
 * is stated PLAINLY here rather than discovered by someone who has just lost a
 * year of squares. It is the least comfortable sentence in the app and it earns
 * its place: a player who knows can decide, and one who finds out cannot.
 *
 * ── The support route ───────────────────────────────────────────────────────
 * Constraint 9: it must actually work, pre-filled with version and device info.
 * A contact link that opens an empty mail draft asking the player to describe
 * their device is a contact link that does not work.
 */

const SUPPORT_EMAIL = "hello@wordquilt.app";

export default function Settings() {
  const { prefs } = useOnboarding();

  const version = Application.nativeApplicationVersion ?? "0.1.0";
  const build = Application.nativeBuildVersion ?? "—";

  const contactSupport = async () => {
    // Pre-filled, because the player should not have to work out what we need.
    const body = [
      "",
      "",
      "———",
      `WordQuilt ${version} (${build})`,
      `${Platform.OS} ${Platform.Version}`,
    ].join("\n");

    try {
      if (await MailComposer.isAvailableAsync()) {
        await MailComposer.composeAsync({
          recipients: [SUPPORT_EMAIL],
          subject: `WordQuilt ${version}`,
          body,
        });
      }
    } catch {
      // No mail client configured. Nothing useful to say, and an error dialog
      // here would be worse than the silence.
    }
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
          </View>
          <Text variant="pageTitle">Settings</Text>
        </View>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} className="pt-8">
        <View className="gap-6 pb-8">
          <View className="gap-3">
            <Text variant="sectionLabel">Sound and motion</Text>
            <Card delay={0}>
              <ListRow title="Sound" sub="Soft, and off in silent mode" right="On" />
              <Rule />
              <ListRow title="Haptics" sub="A small tick when a word locks" right="On" />
              <Rule />
              <ListRow
                title="Reduce motion"
                sub="Reveals resolve in one step"
                right="Follows your device"
              />
            </Card>
          </View>

          <View className="gap-3">
            <Text variant="sectionLabel">Notifications</Text>
            <Card delay={60}>
              <ListRow
                title="One a day"
                sub="Never about days you missed"
                right={prefs.reminders ? "On" : "Off"}
              />
              <Rule />
              <ListRow
                title="Time"
                sub="Your five quiet minutes"
                right={prefs.rhythm ?? "Not set"}
              />
            </Card>
          </View>

          <View className="gap-3">
            <Text variant="sectionLabel">Your things</Text>
            <Card delay={120}>
              <ListRow
                title="Fabric"
                sub={prefs.fabric[0]!.toUpperCase() + prefs.fabric.slice(1)}
                right="Change"
                onPress={() => router.push("/fabric")}
              />
              <Rule />
              <ListRow title="Restore purchases" sub="From the App Store" right="" />
              <Rule />
              {/* The uncomfortable sentence, stated rather than discovered. */}
              <ListRow
                title="If you reinstall"
                sub="Purchases restore from the App Store. Puzzle progress is not backed up in this version."
              />
            </Card>
          </View>

          <View className="gap-3">
            <Text variant="sectionLabel">About</Text>
            <Card delay={180}>
              <ListRow
                title="Get in touch"
                sub="We read everything"
                right="Email"
                onPress={() => void contactSupport()}
              />
              <Rule />
              <ListRow title="Privacy" sub="Nothing leaves your device" right="Read" />
              <Rule />
              <ListRow title="Terms" right="Read" />
              <Rule />
              <ListRow title="Version" right={`${version} (${build})`} />
            </Card>
          </View>

          <Text variant="meta">
            No advertising. No account. Nothing about you is collected or sent anywhere.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
