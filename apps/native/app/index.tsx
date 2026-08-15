import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { storage } from "@/lib/storage";

/**
 * Where the app opens.
 *
 * There is no splash logo and no launch screen of our own — the OS splash holds
 * the terracotta field while fonts load, then this decides in one frame whether
 * the player has been here before.
 *
 * A first-time player lands on a PLAYABLE PUZZLE, not a welcome screen. That is
 * the whole shape of onboarding: the aha moment arrives in about ninety
 * seconds, before anything is asked of them.
 */
export default function Entry() {
  const [done, setDone] = useState<boolean | null>(null);

  useEffect(() => {
    storage.isOnboardingComplete().then(setDone);
  }, []);

  // The field colour, so the handoff from the OS splash is seamless rather than
  // a flash of white.
  if (done === null) return <View className="flex-1 bg-field" />;

  return <Redirect href={done ? "/shelf" : "/onboarding/1"} />;
}
